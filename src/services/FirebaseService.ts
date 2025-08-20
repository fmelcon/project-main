/**
 * Servicio Firebase para multijugador en tiempo real
 * Usa Firebase Realtime Database para sincronización automática
 */

import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  remove,
  serverTimestamp,
  Database
} from 'firebase/database';
import { 
  getAuth, 
  signInAnonymously, 
  Auth, 
  User 
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

// Interfaces
export interface FirebaseGameSession {
  id: string;
  name: string;
  gmId: string;
  gmName: string;
  players: { [playerId: string]: FirebasePlayer };
  gameState: FirebaseGameState;
  createdAt: number;
  lastUpdated: number;
  isActive: boolean;
}

export interface FirebasePlayer {
  id: string;
  name: string;
  role: 'gm' | 'player';
  isConnected: boolean;
  joinedAt: number;
  lastSeen: number;
}

export interface FirebaseGameState {
  tokens: { [tokenId: string]: any };
  drawingData: { [drawingId: string]: any };
  fogOfWar: string[];
  doors: { [doorKey: string]: any };
  walls: { [wallKey: string]: any };
  gridType: string;
  backgroundImage?: string;
  selectedTool?: string;
  selectedColor?: string;
  fogEnabled?: boolean;
  version: number;
}

export interface FirebaseGameUpdate {
  type: 'token_add' | 'token_update' | 'token_remove' | 'drawing_add' | 'drawing_clear' | 'fog_update' | 'door_update' | 'wall_update' | 'background_update' | 'grid_type_update' | 'dice_roll' | 'selected_tool_update' | 'selected_color_update' | 'token_sync_all' | 'drawing_sync_all' | 'doors_sync_all' | 'walls_sync_all';
  data: any;
  playerId: string;
  timestamp: number;
}

class FirebaseService {
  private app: any;
  private database: Database;
  private auth: Auth;
  private currentUser: User | null = null;
  private currentSessionId: string | null = null;
  private currentPlayerId: string | null = null;
  private isGM = false;
  private listeners: { [key: string]: any } = {};
  
  // Callbacks
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onSessionJoinedCallback?: (session: FirebaseGameSession) => void;
  private onPlayerJoinedCallback?: (player: FirebasePlayer) => void;
  private onPlayerLeftCallback?: (playerId: string) => void;
  private onGameUpdateCallback?: (update: FirebaseGameUpdate) => void;
  private onErrorCallback?: (error: string) => void;

  constructor() {
    this.initializeFirebase();
  }

  private async initializeFirebase() {
    try {
      // Inicializar Firebase
      this.app = initializeApp(firebaseConfig);
      this.database = getDatabase(this.app);
      this.auth = getAuth(this.app);
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      this.onErrorCallback?.('Failed to initialize Firebase');
    }
  }

  /**
   * Conectar a Firebase (autenticación anónima)
   */
  async connect(): Promise<void> {
    try {
      // Autenticación anónima
      const userCredential = await signInAnonymously(this.auth);
      this.currentUser = userCredential.user;
      this.currentPlayerId = this.currentUser.uid;
      
      console.log('Connected to Firebase:', this.currentPlayerId);
      this.onConnectedCallback?.();
      
      // Configurar listener de presencia
      this.setupPresence();
      
    } catch (error) {
      console.error('Firebase connection error:', error);
      throw new Error('Failed to connect to Firebase');
    }
  }

  /**
   * Configurar sistema de presencia
   */
  private setupPresence() {
    if (!this.currentPlayerId) return;
    
    // Marcar como conectado
    const presenceRef = ref(this.database, `presence/${this.currentPlayerId}`);
    set(presenceRef, {
      online: true,
      lastSeen: serverTimestamp()
    });
    
    // Marcar como desconectado al cerrar
    const offlineRef = ref(this.database, `presence/${this.currentPlayerId}`);
    set(offlineRef, {
      online: false,
      lastSeen: serverTimestamp()
    });
  }

  /**
   * Desconectar de Firebase
   */
  disconnect(): void {
    // Limpiar listeners
    Object.values(this.listeners).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners = {};
    
    // Marcar como desconectado
    if (this.currentPlayerId) {
      const presenceRef = ref(this.database, `presence/${this.currentPlayerId}`);
      set(presenceRef, {
        online: false,
        lastSeen: serverTimestamp()
      });
    }
    
    this.currentSessionId = null;
    this.currentPlayerId = null;
    this.isGM = false;
    
    this.onDisconnectedCallback?.();
  }

  /**
   * Crear nueva sesión
   */
  async createSession(sessionName: string, playerName: string): Promise<void> {
    if (!this.currentPlayerId) {
      throw new Error('Not connected to Firebase');
    }

    try {
      const sessionId = this.generateSessionId();
      const now = Date.now();
      
      const newSession: FirebaseGameSession = {
        id: sessionId,
        name: sessionName,
        gmId: this.currentPlayerId,
        gmName: playerName,
        players: {
          [this.currentPlayerId]: {
            id: this.currentPlayerId,
            name: playerName,
            role: 'gm',
            isConnected: true,
            joinedAt: now,
            lastSeen: now
          }
        },
        gameState: {
          tokens: {},
          drawingData: {},
          fogOfWar: [],
          doors: {},
          walls: {},
          gridType: 'square',
          selectedTool: 'move',
          selectedColor: '#000000',
          fogEnabled: false,
          version: 1
        },
        createdAt: now,
        lastUpdated: now,
        isActive: true
      };
      
      // Guardar sesión en Firebase
      const sessionRef = ref(this.database, `sessions/${sessionId}`);
      await set(sessionRef, newSession);
      
      this.currentSessionId = sessionId;
      this.isGM = true;
      
      // Configurar listeners
      this.setupSessionListeners(sessionId);
      
      // Convertir a formato compatible con GameSession
      const compatibleSession = this.convertToGameSession(newSession);
      this.onSessionJoinedCallback?.(compatibleSession);
      
      console.log('Session created:', sessionId);
      
    } catch (error) {
      console.error('Create session error:', error);
      this.onErrorCallback?.('Failed to create session');
    }
  }

  /**
   * Unirse a sesión existente
   */
  async joinSession(sessionId: string, playerName: string): Promise<void> {
    if (!this.currentPlayerId) {
      throw new Error('Not connected to Firebase');
    }

    try {
      const sessionRef = ref(this.database, `sessions/${sessionId}`);
      
      // Verificar que la sesión existe
      const sessionSnapshot = await new Promise((resolve, reject) => {
        onValue(sessionRef, (snapshot) => {
          resolve(snapshot);
        }, { onlyOnce: true });
      }) as any;
      
      if (!sessionSnapshot.exists()) {
        throw new Error('Session not found');
      }
      
      const session = sessionSnapshot.val() as FirebaseGameSession;
      
      // Agregar jugador a la sesión
      const playerData: FirebasePlayer = {
        id: this.currentPlayerId,
        name: playerName,
        role: 'player',
        isConnected: true,
        joinedAt: Date.now(),
        lastSeen: Date.now()
      };
      
      const playerRef = ref(this.database, `sessions/${sessionId}/players/${this.currentPlayerId}`);
      await set(playerRef, playerData);
      
      this.currentSessionId = sessionId;
      this.isGM = false;
      
      // Configurar listeners
      this.setupSessionListeners(sessionId);
      
      // Actualizar sesión con el nuevo jugador
      session.players[this.currentPlayerId] = playerData;
      
      // Convertir a formato compatible con GameSession
      const compatibleSession = this.convertToGameSession(session);
      this.onSessionJoinedCallback?.(compatibleSession);
      
      console.log('Joined session:', sessionId);
      
    } catch (error) {
      console.error('Join session error:', error);
      this.onErrorCallback?.('Failed to join session');
    }
  }

  /**
   * Configurar listeners de la sesión
   */
  private setupSessionListeners(sessionId: string) {
    // Listener para cambios en jugadores
    const playersRef = ref(this.database, `sessions/${sessionId}/players`);
    let previousPlayers: { [key: string]: any } = {};
    
    this.listeners.players = onValue(playersRef, (snapshot) => {
      const currentPlayers = snapshot.val() || {};
      
      // Detectar jugadores nuevos
      Object.values(currentPlayers).forEach((player: any) => {
        if (player.id !== this.currentPlayerId && !previousPlayers[player.id]) {
          console.log('Player joined:', player.name);
          this.onPlayerJoinedCallback?.(player);
        }
      });
      
      // Detectar jugadores que se fueron
      Object.keys(previousPlayers).forEach((playerId) => {
        if (playerId !== this.currentPlayerId && !currentPlayers[playerId]) {
          console.log('Player left:', playerId);
          this.onPlayerLeftCallback?.(playerId);
        }
      });
      
      previousPlayers = { ...currentPlayers };
    });
    
    // Listener para cambios en el estado del juego
    const gameStateRef = ref(this.database, `sessions/${sessionId}/gameState`);
    this.listeners.gameState = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        console.log('🔥 Firebase gameState changed, processing...', gameState.version);
        // Procesar cambios en el estado del juego
        this.processGameStateChanges(gameState);
      }
    });
  }

  /**
   * Procesar cambios en el estado del juego
   */
  private processGameStateChanges(gameState: FirebaseGameState) {
    console.log('🔄 Processing game state changes, version:', gameState.version);
    
    // Sincronizar tokens completos
    if (gameState.tokens) {
      const tokensArray = Object.values(gameState.tokens);
      console.log('📦 Syncing tokens:', tokensArray.length);
      this.onGameUpdateCallback?.({
        type: 'token_sync_all',
        data: tokensArray,
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar fog of war
    if (gameState.fogOfWar !== undefined) {
      console.log('🌫️ Syncing fog of war:', gameState.fogOfWar.length, 'cells');
      this.onGameUpdateCallback?.({
        type: 'fog_update',
        data: gameState.fogOfWar,
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar dibujos
    if (gameState.drawingData) {
      const drawingsArray = Object.values(gameState.drawingData);
      console.log('🎨 Syncing drawings:', drawingsArray.length);
      this.onGameUpdateCallback?.({
        type: 'drawing_sync_all',
        data: drawingsArray,
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar puertas
    if (gameState.doors !== undefined) {
      console.log('🚪 Syncing doors:', Object.keys(gameState.doors).length);
      this.onGameUpdateCallback?.({
        type: 'doors_sync_all',
        data: gameState.doors,
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar paredes
    if (gameState.walls !== undefined) {
      console.log('🧱 Syncing walls:', Object.keys(gameState.walls).length);
      this.onGameUpdateCallback?.({
        type: 'walls_sync_all',
        data: gameState.walls,
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar imagen de fondo
    if (gameState.backgroundImage !== undefined) {
      console.log('🖼️ Syncing background image');
      this.onGameUpdateCallback?.({
        type: 'background_update',
        data: { backgroundImage: gameState.backgroundImage },
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar tipo de grilla
    if (gameState.gridType !== undefined) {
      console.log('🎯 Syncing grid type:', gameState.gridType);
      this.onGameUpdateCallback?.({
        type: 'grid_type_update',
        data: { gridType: gameState.gridType },
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // Sincronizar fog enabled
    if (gameState.fogEnabled !== undefined) {
      console.log('🌫️ Syncing fog enabled:', gameState.fogEnabled);
      this.onGameUpdateCallback?.({
        type: 'fog_enabled_update',
        data: { fogEnabled: gameState.fogEnabled },
        playerId: 'firebase-sync',
        timestamp: Date.now()
      });
    }
    
    // NO sincronizar herramientas seleccionadas - cada jugador mantiene su propia selección
    // Las herramientas son locales a cada jugador, solo se sincronizan las ACCIONES
  }

  /**
   * Convertir FirebaseGameSession a GameSession compatible
   */
  private convertToGameSession(firebaseSession: FirebaseGameSession): any {
    // Convertir players de objeto a array
    const playersArray = Object.values(firebaseSession.players).map(player => ({
      id: player.id,
      name: player.name,
      role: player.role,
      isConnected: player.isConnected,
      joinedAt: new Date(player.joinedAt)
    }));

    // Convertir gameState
    const gameState = {
      tokens: Object.values(firebaseSession.gameState.tokens || {}),
      drawingData: Object.values(firebaseSession.gameState.drawingData || {}),
      fogOfWar: firebaseSession.gameState.fogOfWar || [],
      doors: Object.entries(firebaseSession.gameState.doors || {}),
      walls: Object.entries(firebaseSession.gameState.walls || {}),
      gridType: firebaseSession.gameState.gridType || 'square',
      backgroundImage: firebaseSession.gameState.backgroundImage,
      lastUpdated: new Date(),
      version: firebaseSession.gameState.version || 1
    };

    return {
      id: firebaseSession.id,
      name: firebaseSession.name,
      gmId: firebaseSession.gmId,
      players: playersArray,
      gameState: gameState,
      createdAt: new Date(firebaseSession.createdAt),
      isActive: firebaseSession.isActive
    };
  }

  /**
   * Abandonar sesión
   */
  async leaveSession(): Promise<void> {
    if (!this.currentSessionId || !this.currentPlayerId) return;

    try {
      // Marcar jugador como desconectado
      const playerRef = ref(this.database, `sessions/${this.currentSessionId}/players/${this.currentPlayerId}`);
      await set(playerRef, null);
      
      // Limpiar listeners
      Object.values(this.listeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this.listeners = {};
      
      this.currentSessionId = null;
      this.isGM = false;
      
    } catch (error) {
      console.error('Leave session error:', error);
    }
  }

  /**
   * Enviar actualización del juego
   */
  async sendGameUpdate(update: Omit<FirebaseGameUpdate, 'playerId' | 'timestamp'>): Promise<void> {
    console.log('🔥 FirebaseService.sendGameUpdate called:', update, 'Session:', this.currentSessionId);
    
    if (!this.currentSessionId || !this.currentPlayerId) {
      console.warn('❌ Cannot send update: not in session', { currentSessionId: this.currentSessionId, currentPlayerId: this.currentPlayerId });
      return;
    }

    try {
      console.log('🚀 Updating game state in Firebase:', update);
      
      // Actualizar estado del juego (esto disparará el listener gameState)
      await this.updateGameState(update);
      
      console.log('✅ Game update sent successfully to Firebase');
      
    } catch (error) {
      console.error('❌ Send update error:', error);
    }
  }

  /**
   * Actualizar estado del juego en Firebase
   */
  private async updateGameState(update: Omit<FirebaseGameUpdate, 'playerId' | 'timestamp'>) {
    if (!this.currentSessionId) return;
    
    const gameStateRef = ref(this.database, `sessions/${this.currentSessionId}/gameState`);
    
    switch (update.type) {
      case 'token_add':
        const tokenRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/tokens/${update.data.id}`);
        await set(tokenRef, update.data);
        break;
        
      case 'token_update':
        const updateTokenRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/tokens/${update.data.id}`);
        // Obtener token actual y hacer merge con updates
        const currentTokenSnapshot = await new Promise((resolve) => {
          onValue(updateTokenRef, (snapshot) => {
            resolve(snapshot);
          }, { onlyOnce: true });
        }) as any;
        
        const currentToken = currentTokenSnapshot.exists() ? currentTokenSnapshot.val() : {};
        const updatedToken = { ...currentToken, ...update.data.updates };
        await set(updateTokenRef, updatedToken);
        break;
        
      case 'token_remove':
        const removeTokenRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/tokens/${update.data.id}`);
        await remove(removeTokenRef);
        break;
        
      case 'fog_update':
        const fogRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/fogOfWar`);
        await set(fogRef, update.data);
        break;
        
      case 'grid_type_update':
        const gridTypeRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/gridType`);
        await set(gridTypeRef, update.data.gridType);
        break;
        
      case 'selected_tool_update':
        const toolRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/selectedTool`);
        await set(toolRef, update.data.selectedTool);
        break;
        
      case 'selected_color_update':
         const colorRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/selectedColor`);
         await set(colorRef, update.data.selectedColor);
         break;
         
       case 'fog_enabled_update':
          const fogEnabledRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/fogEnabled`);
          await set(fogEnabledRef, update.data.fogEnabled);
          break;
          
        case 'doors_clear':
          const doorsRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/doors`);
          await set(doorsRef, {});
          break;
          
        case 'walls_clear':
          const wallsRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/walls`);
          await set(wallsRef, {});
          break;
          
        // Agregar más casos según necesidad
    }
    
    // Actualizar versión
    const versionRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/version`);
    const currentTime = Date.now();
    await set(versionRef, currentTime);
  }

  /**
   * Métodos de sincronización (compatibles con otros servicios)
   */
  syncTokenAdd(token: any): void {
    console.log('🔥 FirebaseService.syncTokenAdd called:', token, 'Session:', this.currentSessionId);
    
    // Limpiar datos undefined antes de enviar a Firebase
    const cleanToken = this.cleanFirebaseData(token);
    console.log('🧹 Cleaned token data:', cleanToken);
    
    this.sendGameUpdate({ type: 'token_add', data: cleanToken });
  }

  syncTokenUpdate(tokenId: string, updates: any): void {
    console.log('🔥 FirebaseService.syncTokenUpdate called:', { tokenId, updates });
    
    // Limpiar datos undefined antes de enviar a Firebase
    const cleanUpdates = this.cleanFirebaseData(updates);
    console.log('🧹 Cleaned update data:', cleanUpdates);
    
    this.sendGameUpdate({ type: 'token_update', data: { id: tokenId, updates: cleanUpdates } });
  }

  syncTokenRemove(tokenId: string): void {
    this.sendGameUpdate({ type: 'token_remove', data: { id: tokenId } });
  }

  syncDrawingAdd(drawingData: any): void {
    this.sendGameUpdate({ type: 'drawing_add', data: drawingData });
  }

  syncDrawingClear(): void {
    this.sendGameUpdate({ type: 'drawing_clear', data: {} });
  }

  syncFogUpdate(fogData: string[]): void {
    this.sendGameUpdate({ type: 'fog_update', data: fogData });
  }

  syncDoorUpdate(doorKey: string, doorData: any): void {
    this.sendGameUpdate({ type: 'door_update', data: { key: doorKey, door: doorData } });
  }

  syncWallUpdate(wallKey: string, wallData: any): void {
    this.sendGameUpdate({ type: 'wall_update', data: { key: wallKey, wall: wallData } });
  }

  syncBackgroundUpdate(backgroundImage: string): void {
    this.sendGameUpdate({ type: 'background_update', data: { backgroundImage } });
  }

  syncGridTypeUpdate(gridType: "square" | "octagonal"): void {
    console.log('🔥 FirebaseService.syncGridTypeUpdate called:', gridType, 'Session:', this.currentSessionId);
    
    // Limpiar datos undefined antes de enviar a Firebase
    const cleanGridType = this.cleanFirebaseData({ gridType });
    console.log('🧹 Cleaned grid type data:', cleanGridType);
    
    this.sendGameUpdate({ type: 'grid_type_update', data: cleanGridType });
  }

  syncDiceRoll(diceData: { sides: number; result: number; player: string; timestamp: number }): void {
    console.log('🎲 FirebaseService.syncDiceRoll called:', diceData, 'Session:', this.currentSessionId);
    
    // Limpiar datos undefined antes de enviar a Firebase
    const cleanDiceData = this.cleanFirebaseData(diceData);
    console.log('🧹 Cleaned dice data:', cleanDiceData);
    
    this.sendGameUpdate({ type: 'dice_roll', data: cleanDiceData });
  }

  syncSelectedToolUpdate(tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v"): void {
    console.log('🎨 FirebaseService.syncSelectedToolUpdate called:', tool, 'Session:', this.currentSessionId);
    
    const cleanToolData = this.cleanFirebaseData({ selectedTool: tool });
    console.log('🧹 Cleaned tool data:', cleanToolData);
    
    this.sendGameUpdate({ type: 'selected_tool_update', data: cleanToolData });
  }

  syncSelectedColorUpdate(color: string): void {
    console.log('🎨 FirebaseService.syncSelectedColorUpdate called:', color, 'Session:', this.currentSessionId);
    
    const cleanColorData = this.cleanFirebaseData({ selectedColor: color });
    console.log('🧹 Cleaned color data:', cleanColorData);
    
    this.sendGameUpdate({ type: 'selected_color_update', data: cleanColorData });
  }

  syncFogEnabledUpdate(enabled: boolean): void {
    console.log('🌫️ FirebaseService.syncFogEnabledUpdate called:', enabled, 'Session:', this.currentSessionId);
    
    const cleanFogEnabledData = this.cleanFirebaseData({ fogEnabled: enabled });
    console.log('🧹 Cleaned fog enabled data:', cleanFogEnabledData);
    
    this.sendGameUpdate({ type: 'fog_enabled_update', data: cleanFogEnabledData });
  }

  syncClearDoors(): void {
    console.log('🚪 FirebaseService.syncClearDoors called, Session:', this.currentSessionId);
    this.sendGameUpdate({ type: 'doors_clear', data: {} });
  }

  syncClearWalls(): void {
    console.log('🧱 FirebaseService.syncClearWalls called, Session:', this.currentSessionId);
    this.sendGameUpdate({ type: 'walls_clear', data: {} });
  }

  /**
   * Limpiar datos para Firebase (eliminar undefined)
   */
  private cleanFirebaseData(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanFirebaseData(item)).filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = this.cleanFirebaseData(value);
        }
      });
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Generar ID de sesión simple
   */
  private generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Getters
   */
  isConnected(): boolean {
    return this.currentUser !== null && this.currentPlayerId !== null;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  getCurrentPlayerId(): string | null {
    return this.currentPlayerId;
  }

  isGameMaster(): boolean {
    return this.isGM;
  }

  /**
   * Configurar callbacks (compatibles con otros servicios)
   */
  onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  onSessionJoined(callback: (session: any) => void): void {
    this.onSessionJoinedCallback = callback;
  }

  onPlayerJoined(callback: (player: any) => void): void {
    this.onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback: (playerId: string) => void): void {
    this.onPlayerLeftCallback = callback;
  }

  onGameUpdate(callback: (update: any) => void): void {
    this.onGameUpdateCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }
}

// Singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
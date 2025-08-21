/**
 * WebSocket Service para funcionalidad multisesión
 * Maneja la conexión, sincronización y eventos en tiempo real
 */

export interface GameSession {
  id: string;
  name: string;
  gmId: string;
  players: Player[];
  gameState: GameState;
  createdAt: Date;
  isActive: boolean;
}

export interface Player {
  id: string;
  name: string;
  role: 'gm' | 'player';
  isConnected: boolean;
  joinedAt: Date;
}

export interface GameState {
  tokens: any[];
  drawingData: any[];
  fogOfWar: string[];
  doors: [string, any][];
  walls: [string, any][];
  gridType: string;
  backgroundImage?: string;
  lastUpdated: Date;
  version: number;
}

export interface WebSocketMessage {
  type: 'join_session' | 'leave_session' | 'game_update' | 'player_joined' | 'player_left' | 'session_created' | 'error' | 'ping' | 'pong';
  sessionId?: string;
  playerId?: string;
  playerName?: string;
  data?: any;
  timestamp: Date;
}

export interface GameUpdate {
  type: 'token_add' | 'token_update' | 'token_remove' | 'drawing_add' | 'drawing_clear' | 'fog_update' | 'door_update' | 'wall_update' | 'background_update' | 'text_add' | 'text_update' | 'text_remove' | 'loot_add' | 'loot_update' | 'loot_remove' | 'game_state';
  data: any;
  playerId: string;
  timestamp: Date;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  
  // Callbacks
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onSessionJoinedCallback?: (session: GameSession) => void;
  private onPlayerJoinedCallback?: (player: Player) => void;
  private onPlayerLeftCallback?: (playerId: string) => void;
  private onGameUpdateCallback?: (update: GameUpdate) => void;
  private onErrorCallback?: (error: string) => void;

  // Estado local
  private currentSessionId: string | null = null;
  private currentPlayerId: string | null = null;
  private isGM = false;

  constructor() {
    this.generatePlayerId();
  }

  private generatePlayerId(): void {
    this.currentPlayerId = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Obtener URL por defecto del servidor WebSocket basado en el entorno
   */
  private getDefaultServerUrl(): string {
    const isProduction = window.location.protocol === 'https:';
    const hostname = window.location.hostname;
    
    // Configuraciones específicas para diferentes plataformas
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      // Para Netlify, usar el servidor WebSocket desplegado
      return `wss://${hostname.replace('.netlify.app', '-ws.netlify.app').replace('.netlify.com', '-ws.netlify.com')}`;
    }
    
    if (hostname.includes('vercel.app')) {
      // Para Vercel
      return `wss://${hostname.replace('.vercel.app', '-ws.vercel.app')}`;
    }
    
    if (hostname.includes('herokuapp.com')) {
      // Para Heroku
      return `wss://${hostname.replace('.herokuapp.com', '-ws.herokuapp.com')}`;
    }
    
    // Para otros dominios de producción
    if (isProduction && hostname !== 'localhost') {
      return `wss://${hostname}:8080`;
    }
    
    // Desarrollo local
    return 'ws://localhost:8080';
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(serverUrl?: string): Promise<void> {
    // Auto-detectar URL del servidor basado en el entorno
    if (!serverUrl) {
      serverUrl = this.getDefaultServerUrl();
    }
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPing();
          this.onConnectedCallback?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopPing();
          this.onDisconnectedCallback?.();
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.currentSessionId = null;
  }

  /**
   * Crear nueva sesión de juego
   */
  createSession(sessionName: string, playerName: string): void {
    if (!this.isConnected()) {
      this.onErrorCallback?.('Not connected to server');
      return;
    }

    this.isGM = true;
    const message: WebSocketMessage = {
      type: 'join_session',
      sessionId: 'create_new',
      playerId: this.currentPlayerId!,
      playerName,
      data: { sessionName, isGM: true },
      timestamp: new Date()
    };

    this.sendMessage(message);
  }

  /**
   * Unirse a sesión existente
   */
  joinSession(sessionId: string, playerName: string): void {
    if (!this.isConnected()) {
      this.onErrorCallback?.('Not connected to server');
      return;
    }

    this.isGM = false;
    const message: WebSocketMessage = {
      type: 'join_session',
      sessionId,
      playerId: this.currentPlayerId!,
      playerName,
      data: { isGM: false },
      timestamp: new Date()
    };

    this.sendMessage(message);
  }

  /**
   * Abandonar sesión actual
   */
  leaveSession(): void {
    if (!this.currentSessionId) return;

    const message: WebSocketMessage = {
      type: 'leave_session',
      sessionId: this.currentSessionId,
      playerId: this.currentPlayerId!,
      timestamp: new Date()
    };

    this.sendMessage(message);
    this.currentSessionId = null;
    this.isGM = false;
  }

  /**
   * Enviar actualización del juego
   */
  sendGameUpdate(update: Omit<GameUpdate, 'playerId' | 'timestamp'>): void {
    if (!this.currentSessionId || !this.currentPlayerId) {
      console.warn('Cannot send update: not in session');
      return;
    }

    const gameUpdate: GameUpdate = {
      ...update,
      playerId: this.currentPlayerId,
      timestamp: new Date()
    };

    const message: WebSocketMessage = {
      type: 'game_update',
      sessionId: this.currentSessionId,
      playerId: this.currentPlayerId,
      data: gameUpdate,
      timestamp: new Date()
    };

    this.sendMessage(message);
  }

  /**
   * Métodos específicos para diferentes tipos de actualizaciones
   */
  syncTokenAdd(token: any): void {
    this.sendGameUpdate({ type: 'token_add', data: token });
  }

  syncTokenUpdate(tokenId: string, updates: any): void {
    this.sendGameUpdate({ type: 'token_update', data: { id: tokenId, updates } });
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

  // Métodos de sincronización para textos
  syncTextAdd(text: any): void {
    this.sendGameUpdate({ type: 'text_add', data: text });
  }

  syncTextUpdate(textId: string, updates: any): void {
    this.sendGameUpdate({ type: 'text_update', data: { id: textId, updates } });
  }

  syncTextRemove(textId: string): void {
    this.sendGameUpdate({ type: 'text_remove', data: { id: textId } });
  }

  // Métodos de sincronización para loot
  syncLootAdd(loot: any): void {
    this.sendGameUpdate({ type: 'loot_add', data: loot });
  }

  syncLootUpdate(lootId: string, updates: any): void {
    this.sendGameUpdate({ type: 'loot_update', data: { id: lootId, updates } });
  }

  syncLootRemove(lootId: string): void {
    this.sendGameUpdate({ type: 'loot_remove', data: { id: lootId } });
  }

  // Método de sincronización del estado completo del juego
  syncGameState(gameState: any): void {
    this.sendGameUpdate({ type: 'game_state', data: gameState });
  }

  /**
   * Manejo de mensajes entrantes
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      switch (message.type) {
        case 'session_created':
        case 'join_session':
          if (message.data?.session) {
            this.currentSessionId = message.data.session.id;
            this.onSessionJoinedCallback?.(message.data.session);
          }
          break;

        case 'player_joined':
          if (message.data?.player) {
            this.onPlayerJoinedCallback?.(message.data.player);
          }
          break;

        case 'player_left':
          if (message.playerId) {
            this.onPlayerLeftCallback?.(message.playerId);
          }
          break;

        case 'game_update':
          if (message.data && message.playerId !== this.currentPlayerId) {
            // Solo procesar updates de otros jugadores
            this.onGameUpdateCallback?.(message.data);
          }
          break;

        case 'error':
          this.onErrorCallback?.(message.data?.message || 'Unknown error');
          break;

        case 'pong':
          // Respuesta al ping, conexión activa
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Enviar mensaje al servidor
   */
  private sendMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  /**
   * Reconexión automática
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  /**
   * Sistema de ping/pong para mantener conexión
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const pingMessage: WebSocketMessage = {
          type: 'ping',
          timestamp: new Date()
        };
        this.sendMessage(pingMessage);
      }
    }, 30000); // Ping cada 30 segundos
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Getters y utilidades
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
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
   * Configurar callbacks
   */
  onConnected(callback: () => void): void {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback;
  }

  onSessionJoined(callback: (session: GameSession) => void): void {
    this.onSessionJoinedCallback = callback;
  }

  onPlayerJoined(callback: (player: Player) => void): void {
    this.onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback: (playerId: string) => void): void {
    this.onPlayerLeftCallback = callback;
  }

  onGameUpdate(callback: (update: GameUpdate) => void): void {
    this.onGameUpdateCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
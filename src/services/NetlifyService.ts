/**
 * Servicio alternativo para Netlify usando HTTP polling
 * Reemplaza WebSocket con requests HTTP para compatibilidad serverless
 */

export interface NetlifyGameSession {
  id: string;
  name: string;
  gmId: string;
  players: NetlifyPlayer[];
  gameState: NetlifyGameState;
  createdAt: string;
  lastUpdated: string;
}

export interface NetlifyPlayer {
  id: string;
  name: string;
  role: 'gm' | 'player';
  isConnected: boolean;
  joinedAt: string;
}

export interface NetlifyGameState {
  tokens: any[];
  drawingData: any[];
  fogOfWar: string[];
  doors: [string, any][];
  walls: [string, any][];
  gridType: string;
  backgroundImage?: string;
  version: number;
}

export interface NetlifyGameUpdate {
  type: 'token_add' | 'token_update' | 'token_remove' | 'drawing_add' | 'drawing_clear' | 'fog_update' | 'door_update' | 'wall_update' | 'background_update';
  data: any;
  playerId: string;
  timestamp: string;
}

class NetlifyService {
  private baseUrl: string;
  private currentSessionId: string | null = null;
  private currentPlayerId: string | null = null;
  private isGM = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastVersion = 0;
  
  // Callbacks
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onSessionJoinedCallback?: (session: NetlifyGameSession) => void;
  private onPlayerJoinedCallback?: (player: NetlifyPlayer) => void;
  private onPlayerLeftCallback?: (playerId: string) => void;
  private onGameUpdateCallback?: (update: NetlifyGameUpdate) => void;
  private onErrorCallback?: (error: string) => void;

  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.generatePlayerId();
  }

  private getBaseUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      return `${window.location.origin}/.netlify/functions`;
    }
    
    // Fallback para desarrollo local
    return 'http://localhost:8888/.netlify/functions';
  }

  private generatePlayerId(): void {
    this.currentPlayerId = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Conectar al servicio (simula conexión WebSocket)
   */
  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/websocket/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: this.currentPlayerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Connected to Netlify service:', data);
      
      this.onConnectedCallback?.();
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  /**
   * Desconectar del servicio
   */
  disconnect(): void {
    this.stopPolling();
    this.currentSessionId = null;
    this.onDisconnectedCallback?.();
  }

  /**
   * Crear nueva sesión
   */
  async createSession(sessionName: string, playerName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/websocket/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'create_new',
          playerId: this.currentPlayerId,
          playerName,
          sessionName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.session) {
        this.currentSessionId = data.session.id;
        this.isGM = true;
        this.lastVersion = data.session.gameState.version;
        
        this.onSessionJoinedCallback?.(data.session);
        this.startPolling();
      }
    } catch (error) {
      console.error('Create session error:', error);
      this.onErrorCallback?.(error instanceof Error ? error.message : 'Failed to create session');
    }
  }

  /**
   * Unirse a sesión existente
   */
  async joinSession(sessionId: string, playerName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/websocket/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          playerId: this.currentPlayerId,
          playerName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join session: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.session) {
        this.currentSessionId = data.session.id;
        this.isGM = false;
        this.lastVersion = data.session.gameState.version;
        
        this.onSessionJoinedCallback?.(data.session);
        this.startPolling();
      }
    } catch (error) {
      console.error('Join session error:', error);
      this.onErrorCallback?.(error instanceof Error ? error.message : 'Failed to join session');
    }
  }

  /**
   * Abandonar sesión
   */
  async leaveSession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      await fetch(`${this.baseUrl}/websocket/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          playerId: this.currentPlayerId,
        }),
      });
    } catch (error) {
      console.error('Leave session error:', error);
    }

    this.stopPolling();
    this.currentSessionId = null;
    this.isGM = false;
  }

  /**
   * Enviar actualización del juego
   */
  async sendGameUpdate(update: Omit<NetlifyGameUpdate, 'playerId' | 'timestamp'>): Promise<void> {
    if (!this.currentSessionId || !this.currentPlayerId) {
      console.warn('Cannot send update: not in session');
      return;
    }

    try {
      const gameUpdate: NetlifyGameUpdate = {
        ...update,
        playerId: this.currentPlayerId,
        timestamp: new Date().toISOString(),
      };

      await fetch(`${this.baseUrl}/websocket/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          playerId: this.currentPlayerId,
          update: gameUpdate,
        }),
      });
    } catch (error) {
      console.error('Send update error:', error);
    }
  }

  /**
   * Métodos de sincronización (compatibles con WebSocketService)
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

  /**
   * Polling para simular tiempo real
   */
  private startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      await this.pollForUpdates();
    }, 2000); // Poll cada 2 segundos
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async pollForUpdates(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const response = await fetch(`${this.baseUrl}/websocket/poll?sessionId=${this.currentSessionId}&version=${this.lastVersion}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.updates && data.updates.length > 0) {
          data.updates.forEach((update: NetlifyGameUpdate) => {
            if (update.playerId !== this.currentPlayerId) {
              this.onGameUpdateCallback?.(update);
            }
          });
          
          this.lastVersion = data.version;
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  /**
   * Getters
   */
  isConnected(): boolean {
    return this.currentSessionId !== null;
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
   * Configurar callbacks (compatibles con WebSocketService)
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
export const netlifyService = new NetlifyService();
export default netlifyService;
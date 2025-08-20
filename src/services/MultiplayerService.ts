/**
 * Servicio adaptador que detecta el entorno y usa el servicio apropiado
 * WebSocket para desarrollo local, HTTP polling para Netlify
 */

import webSocketService from './WebSocketService';
import netlifyService from './NetlifyService';
import firebaseService from './FirebaseService';
import { isFirebaseConfigured } from '../config/firebase';

type ServiceType = typeof webSocketService | typeof netlifyService | typeof firebaseService;
type ServiceName = 'websocket' | 'netlify' | 'firebase';

class MultiplayerService {
  private service: ServiceType;
  private serviceName: ServiceName;

  constructor() {
    this.serviceName = this.detectBestService();
    this.service = this.getServiceInstance(this.serviceName);
    
    console.log(`Using ${this.serviceName.toUpperCase()} service for multiplayer`);
  }

  private detectBestService(): ServiceName {
    // Prioridad: Firebase > WebSocket > Netlify
    
    // Verificar si Firebase está configurado
    if (this.isFirebaseConfigured()) {
      return 'firebase';
    }
    
    // Verificar si estamos en Netlify
    if (this.detectNetlifyEnvironment()) {
      return 'netlify';
    }
    
    // Por defecto usar WebSocket
    return 'websocket';
  }
  
  private isFirebaseConfigured(): boolean {
    // Verificar si Firebase está configurado
    try {
      return isFirebaseConfigured();
    } catch (error) {
      console.warn('Firebase config not available:', error);
      return false;
    }
  }
  
  private getServiceInstance(serviceName: ServiceName): ServiceType {
    switch (serviceName) {
      case 'firebase':
        return firebaseService;
      case 'netlify':
        return netlifyService;
      case 'websocket':
      default:
        return webSocketService;
    }
  }

  private detectNetlifyEnvironment(): boolean {
    const hostname = window.location.hostname;
    
    // Detectar si estamos en Netlify
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      return true;
    }
    
    // Detectar si hay variables de entorno de Netlify
    if (typeof window !== 'undefined' && (window as any).netlifyIdentity) {
      return true;
    }
    
    // Verificar si existe el endpoint de Netlify Functions
    return window.location.pathname.includes('/.netlify/');
  }

  /**
   * Conectar al servicio apropiado
   */
  async connect(serverUrl?: string): Promise<void> {
    switch (this.serviceName) {
      case 'firebase':
        return (this.service as typeof firebaseService).connect();
      case 'netlify':
        return (this.service as typeof netlifyService).connect();
      case 'websocket':
      default:
        return (this.service as typeof webSocketService).connect(serverUrl);
    }
  }

  /**
   * Desconectar del servicio
   */
  disconnect(): void {
    this.service.disconnect();
  }

  /**
   * Crear nueva sesión
   */
  createSession(sessionName: string, playerName: string): void {
    switch (this.serviceName) {
      case 'firebase':
        (this.service as typeof firebaseService).createSession(sessionName, playerName);
        break;
      case 'netlify':
        (this.service as typeof netlifyService).createSession(sessionName, playerName);
        break;
      case 'websocket':
      default:
        (this.service as typeof webSocketService).createSession(sessionName, playerName);
        break;
    }
  }

  /**
   * Unirse a sesión existente
   */
  joinSession(sessionId: string, playerName: string): void {
    switch (this.serviceName) {
      case 'firebase':
        (this.service as typeof firebaseService).joinSession(sessionId, playerName);
        break;
      case 'netlify':
        (this.service as typeof netlifyService).joinSession(sessionId, playerName);
        break;
      case 'websocket':
      default:
        (this.service as typeof webSocketService).joinSession(sessionId, playerName);
        break;
    }
  }

  /**
   * Abandonar sesión
   */
  leaveSession(): void {
    this.service.leaveSession();
  }

  /**
   * Métodos de sincronización
   */
  syncTokenAdd(token: any): void {
    console.log('🔥 MultiplayerService.syncTokenAdd called:', token, 'Service type:', this.serviceName);
    this.service.syncTokenAdd(token);
  }

  syncTokenUpdate(tokenId: string, updates: any): void {
    this.service.syncTokenUpdate(tokenId, updates);
  }

  syncTokenRemove(tokenId: string): void {
    this.service.syncTokenRemove(tokenId);
  }

  syncDrawingAdd(drawingData: any): void {
    this.service.syncDrawingAdd(drawingData);
  }

  syncDrawingClear(): void {
    this.service.syncDrawingClear();
  }

  syncFogUpdate(fogData: string[]): void {
    this.service.syncFogUpdate(fogData);
  }

  syncDoorUpdate(doorKey: string, doorData: any): void {
    this.service.syncDoorUpdate(doorKey, doorData);
  }

  syncWallUpdate(wallKey: string, wallData: any): void {
    this.service.syncWallUpdate(wallKey, wallData);
  }

  syncBackgroundUpdate(backgroundImage: string): void {
    this.service.syncBackgroundUpdate(backgroundImage);
  }

  syncGridTypeUpdate(gridType: "square" | "octagonal"): void {
    console.log('🔥 MultiplayerService.syncGridTypeUpdate called:', gridType, 'Service type:', this.serviceName);
    this.service.syncGridTypeUpdate(gridType);
  }

  syncDiceRoll(diceData: { sides: number; result: number; player: string; timestamp: number }): void {
    console.log('🎲 MultiplayerService.syncDiceRoll called:', diceData, 'Service type:', this.serviceName);
    this.service.syncDiceRoll(diceData);
  }

  syncSelectedToolUpdate(tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v"): void {
    console.log('🎨 MultiplayerService.syncSelectedToolUpdate called:', tool, 'Service type:', this.serviceName);
    this.service.syncSelectedToolUpdate(tool);
  }

  syncSelectedColorUpdate(color: string): void {
    console.log('🎨 MultiplayerService.syncSelectedColorUpdate called:', color, 'Service type:', this.serviceName);
    this.service.syncSelectedColorUpdate(color);
  }

  /**
   * Getters
   */
  isConnected(): boolean {
    return this.service.isConnected();
  }

  getCurrentSessionId(): string | null {
    return this.service.getCurrentSessionId();
  }

  getCurrentPlayerId(): string | null {
    return this.service.getCurrentPlayerId();
  }

  isGameMaster(): boolean {
    return this.service.isGameMaster();
  }

  getServiceType(): ServiceName {
    return this.serviceName;
  }

  /**
   * Configurar callbacks
   */
  onConnected(callback: () => void): void {
    this.service.onConnected(callback);
  }

  onDisconnected(callback: () => void): void {
    this.service.onDisconnected(callback);
  }

  onSessionJoined(callback: (session: any) => void): void {
    this.service.onSessionJoined(callback);
  }

  onPlayerJoined(callback: (player: any) => void): void {
    this.service.onPlayerJoined(callback);
  }

  onPlayerLeft(callback: (playerId: string) => void): void {
    this.service.onPlayerLeft(callback);
  }

  onGameUpdate(callback: (update: any) => void): void {
    this.service.onGameUpdate(callback);
  }

  onError(callback: (error: string) => void): void {
    this.service.onError(callback);
  }
}

// Singleton instance
export const multiplayerService = new MultiplayerService();
export default multiplayerService;
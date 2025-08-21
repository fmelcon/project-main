import { useCallback, useEffect, useRef } from 'react';
import multiplayerService from '../services/MultiplayerService';
import { GameUpdate } from '../services/WebSocketService';

/**
 * Hook personalizado para sincronizar el estado del juego en multijugador
 * Maneja la sincronización bidireccional de todos los elementos del juego
 */

interface UseMultiplayerSyncProps {
  // Estados del juego
  tokens: any[];
  drawingData: any[];
  fogOfWar: Set<string>;
  doors: Map<string, any>;
  walls: Map<string, any>;
  texts: any[];
  loots: any[];
  backgroundImage?: string;
  gridType: "square" | "octagonal";
  selectedTool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot";
  selectedColor: string;
  fogEnabled: boolean;
  
  // Setters del estado
  setTokens: (tokens: any[] | ((prev: any[]) => any[])) => void;
  setDrawingData: (data: any[] | ((prev: any[]) => any[])) => void;
  setFogOfWar: (fog: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setDoors: (doors: Map<string, any> | ((prev: Map<string, any>) => Map<string, any>)) => void;
  setWalls: (walls: Map<string, any> | ((prev: Map<string, any>) => Map<string, any>)) => void;
  setTexts: (texts: any[] | ((prev: any[]) => any[])) => void;
  setLoots: (loots: any[] | ((prev: any[]) => any[])) => void;
  setBackgroundImage: (image: string | undefined) => void;
  setGridType: (gridType: "square" | "octagonal") => void;
  setSelectedTool: (tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot") => void;
  setSelectedColor: (color: string) => void;
  setFogEnabled: (enabled: boolean) => void;
  
  // Configuración
  isInSession: boolean;
  isGM: boolean;
}

interface SyncMethods {
  // Métodos de sincronización para tokens
  syncAddToken: (token: any) => void;
  syncUpdateToken: (tokenId: string, updates: any) => void;
  syncRemoveToken: (tokenId: string) => void;
  
  // Métodos de sincronización para dibujos
  syncAddDrawing: (drawing: any) => void;
  syncClearDrawings: () => void;
  
  // Métodos de sincronización para fog of war
  syncUpdateFog: (fogData: Set<string>) => void;
  
  // Métodos de sincronización para elementos arquitectónicos
  syncUpdateDoor: (doorKey: string, doorData: any) => void;
  syncUpdateWall: (wallKey: string, wallData: any) => void;
  syncClearDoors: () => void;
  syncClearWalls: () => void;
  
  // Métodos de sincronización para textos y botín
  syncAddText: (text: any) => void;
  syncUpdateText: (textId: string, updates: any) => void;
  syncRemoveText: (textId: string) => void;
  syncAddLoot: (loot: any) => void;
  syncUpdateLoot: (lootId: string, updates: any) => void;
  syncRemoveLoot: (lootId: string) => void;
  syncGameState: (gameState: any) => void;
  
  // Método de sincronización para fondo
  syncUpdateBackground: (backgroundImage: string) => void;
  
  // Método de sincronización para tipo de grilla
  syncUpdateGridType: (gridType: "square" | "octagonal") => void;
  
  // Método de sincronización para resultados de dados
  syncDiceRoll: (diceData: { sides: number; result: number; player: string; timestamp: number }) => void;
  
  // Métodos de sincronización para herramientas de dibujo
  syncUpdateSelectedTool: (tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot") => void;
  syncUpdateSelectedColor: (color: string) => void;
  
  // Método de sincronización para fog enabled
  syncUpdateFogEnabled: (enabled: boolean) => void;
  
  // Método para aplicar updates remotos
  applyRemoteUpdate: (update: any) => void;
  
  // Utilidades
  canModify: (elementType?: 'tokens' | 'drawing' | 'fog' | 'doors' | 'walls' | 'background' | 'gridType') => boolean;
}

export const useMultiplayerSync = ({
  tokens,
  drawingData,
  fogOfWar,
  doors,
  walls,
  texts,
  loots,
  backgroundImage,
  gridType,
  selectedTool,
  selectedColor,
  fogEnabled,
  setTokens,
  setDrawingData,
  setFogOfWar,
  setDoors,
  setWalls,
  setTexts,
  setLoots,
  setBackgroundImage,
  setGridType,
  setSelectedTool,
  setSelectedColor,
  setFogEnabled,
  isInSession,
  isGM,
}: UseMultiplayerSyncProps): SyncMethods => {
  
  // Referencias para evitar loops infinitos
  const isApplyingRemoteUpdate = useRef(false);
  const lastSyncTimestamp = useRef<{ [key: string]: number }>({});
  
  // Debounce para evitar spam de actualizaciones
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const debounce = (key: string, fn: () => void, delay: number = 100) => {
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    debounceTimers.current[key] = setTimeout(fn, delay);
  };
  
  // Verificar si el usuario puede modificar un elemento
  const canModify = useCallback((elementType?: string): boolean => {
    if (!isInSession) return true; // Modo offline, puede modificar todo
    
    switch (elementType) {
      case 'tokens':
        return true; // Todos pueden mover tokens
      case 'drawing':
        return true; // Todos pueden dibujar
      case 'fog':
        return isGM; // Solo GM puede controlar fog of war
      case 'doors':
      case 'walls':
        return isGM; // Solo GM puede modificar arquitectura
      case 'background':
        return isGM; // Solo GM puede cambiar fondo
      case 'gridType':
        return isGM; // Solo GM puede cambiar tipo de grilla
      default:
        return isGM; // Por defecto, solo GM
    }
  }, [isInSession, isGM]);
  
  // Aplicar actualizaciones remotas (sin dependencias para evitar loops)
  const applyRemoteUpdate = useCallback((update: GameUpdate) => {
    console.log('🔍 DEBUG: applyRemoteUpdate called with:', update.type);
    console.log('🔍 DEBUG: isApplyingRemoteUpdate.current:', isApplyingRemoteUpdate.current);
    
    if (isApplyingRemoteUpdate.current) {
      console.log('❌ DEBUG: Blocked by isApplyingRemoteUpdate flag');
      return;
    }
    
    console.log('🔄 Applying remote update:', update.type, update.data);
    isApplyingRemoteUpdate.current = true;
    console.log('🔍 DEBUG: Set isApplyingRemoteUpdate.current to true');
    
    try {
      switch (update.type) {
        case 'token_add':
          setTokens(prev => {
            const exists = prev.find(t => t.id === update.data.id);
            if (exists) return prev;
            return [...prev, update.data];
          });
          break;
          
        case 'token_sync_all':
          // Sincronización completa de tokens desde Firebase
          if (Array.isArray(update.data)) {
            setTokens(update.data);
          }
          break;
          
        case 'drawing_sync_all':
          // Sincronización completa de dibujos desde Firebase
          if (Array.isArray(update.data)) {
            setDrawingData(update.data);
          }
          break;
          
        case 'doors_sync_all':
          // Sincronización completa de puertas desde Firebase
          if (update.data && typeof update.data === 'object') {
            const doorsMap = new Map(Object.entries(update.data));
            setDoors(doorsMap);
          }
          break;
          
        case 'walls_sync_all':
          // Sincronización completa de paredes desde Firebase
          if (update.data && typeof update.data === 'object') {
            const wallsMap = new Map(Object.entries(update.data));
            setWalls(wallsMap);
          }
          break;
          
        case 'token_add_old':
          setTokens(prev => {
            const exists = prev.find(t => t.id === update.data.id);
            if (exists) return prev;
            return [...prev, update.data];
          });
          break;
          
        case 'token_update':
          setTokens(prev => prev.map(token => 
            token.id === update.data.id 
              ? { ...token, ...update.data.updates }
              : token
          ));
          break;
          
        case 'token_remove':
          setTokens(prev => prev.filter(token => token.id !== update.data.id));
          break;
          
        case 'drawing_add':
          setDrawingData(prev => [...prev, update.data]);
          break;
          
        case 'drawing_clear':
          setDrawingData([]);
          break;
          
        case 'fog_update':
          setFogOfWar(new Set(update.data));
          break;
          
        case 'door_update':
          setDoors(prev => {
            const newDoors = new Map(prev);
            newDoors.set(update.data.key, update.data.door);
            return newDoors;
          });
          break;
          
        case 'wall_update':
          setWalls(prev => {
            const newWalls = new Map(prev);
            newWalls.set(update.data.key, update.data.wall);
            return newWalls;
          });
          break;
          
        case 'background_update':
          setBackgroundImage(update.data.backgroundImage);
          break;
          
        case 'grid_type_update':
          setGridType(update.data.gridType);
          break;
          
        case 'dice_roll':
          // Los resultados de dados se muestran como notificaciones, no cambian estado
          console.log('🎲 Dice roll received:', update.data);
          break;
          
        // NO procesar updates de herramientas - cada jugador mantiene su propia selección
        case 'selected_tool_update':
        case 'selected_color_update':
          console.log('🎨 DEBUG: Ignoring tool/color update - local selection only');
          break;
          
        case 'fog_enabled_update':
          setFogEnabled(update.data.fogEnabled);
          break;
          
        case 'doors_clear':
          setDoors(new Map());
          break;
          
        case 'walls_clear':
          setWalls(new Map());
          break;
          
        default:
          console.warn('Unknown update type:', update.type);
      }
    } catch (error) {
      console.error('Error applying remote update:', error);
    } finally {
      // Resetear flag inmediatamente después de procesar
      isApplyingRemoteUpdate.current = false;
      console.log('🔍 DEBUG: Reset isApplyingRemoteUpdate.current to false');
    }
  }, []); // Sin dependencias para evitar loops infinitos
  
  // NOTA: El callback se configura en App.tsx, no aquí para evitar duplicados
  // useEffect(() => {
  //   console.log('🔧 Setting up multiplayer callback');
  //   multiplayerService.onGameUpdate(applyRemoteUpdate);
  //   
  //   // Cleanup para evitar múltiples callbacks
  //   return () => {
  //     console.log('🧹 Cleaning up multiplayer callback');
  //     multiplayerService.onGameUpdate(() => {});
  //   };
  // }, []); // Solo ejecutar una vez
  
  // Métodos de sincronización
  const syncAddToken = useCallback((token: any) => {
    console.log('🔥 syncAddToken called:', token, { isInSession, canModify: canModify('tokens') });
    if (!isInSession || !canModify('tokens')) {
      console.log('❌ syncAddToken blocked:', { isInSession, canModify: canModify('tokens') });
      return;
    }
    
    debounce(`token_add_${token.id}`, () => {
      console.log('🚀 Calling multiplayerService.syncTokenAdd:', token);
      multiplayerService.syncTokenAdd(token);
    });
  }, [isInSession, canModify]);
  
  const syncUpdateToken = useCallback((tokenId: string, updates: any) => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    debounce(`token_update_${tokenId}`, () => {
      multiplayerService.syncTokenUpdate(tokenId, updates);
    });
  }, [isInSession]);
  
  const syncRemoveToken = useCallback((tokenId: string) => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    multiplayerService.syncTokenRemove(tokenId);
  }, [isInSession]);
  
  const syncAddDrawing = useCallback((drawing: any) => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    debounce('drawing_add', () => {
      multiplayerService.syncDrawingAdd(drawing);
    }, 50); // Más rápido para dibujos
  }, [isInSession]);
  
  const syncClearDrawings = useCallback(() => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('drawing')) return;
    
    multiplayerService.syncDrawingClear();
  }, [isInSession, canModify]);
  
  const syncUpdateFog = useCallback((fogData: Set<string>) => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('fog')) return;
    
    debounce('fog_update', () => {
      multiplayerService.syncFogUpdate(Array.from(fogData));
    }, 200);
  }, [isInSession, canModify]);
  
  const syncUpdateDoor = useCallback((doorKey: string, doorData: any) => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('doors')) return;
    
    multiplayerService.syncDoorUpdate(doorKey, doorData);
  }, [isInSession, canModify]);
  
  const syncUpdateWall = useCallback((wallKey: string, wallData: any) => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('walls')) return;
    
    multiplayerService.syncWallUpdate(wallKey, wallData);
  }, [isInSession, canModify]);
  
  const syncUpdateBackground = useCallback((backgroundImage: string) => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('background')) return;
    
    debounce('background_update', () => {
      multiplayerService.syncBackgroundUpdate(backgroundImage);
    }, 500);
  }, [isInSession, canModify]);
  
  const syncUpdateGridType = useCallback((gridType: "square" | "octagonal") => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('gridType')) return;
    
    multiplayerService.syncGridTypeUpdate(gridType);
  }, [isInSession, canModify]);
  
  const syncDiceRoll = useCallback((diceData: { sides: number; result: number; player: string; timestamp: number }) => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    console.log('🎲 Syncing dice roll:', diceData);
    multiplayerService.syncDiceRoll(diceData);
  }, [isInSession]);
  
  const syncUpdateSelectedTool = useCallback((tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v") => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    console.log('🎨 Syncing selected tool:', tool);
    multiplayerService.syncSelectedToolUpdate(tool);
  }, [isInSession]);
  
  const syncUpdateSelectedColor = useCallback((color: string) => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    console.log('🎨 Syncing selected color:', color);
    multiplayerService.syncSelectedColorUpdate(color);
  }, [isInSession]);
  
  const syncUpdateFogEnabled = useCallback((enabled: boolean) => {
    if (!isInSession || isApplyingRemoteUpdate.current) return;
    
    console.log('🌫️ Syncing fog enabled:', enabled);
    multiplayerService.syncFogEnabledUpdate(enabled);
  }, [isInSession]);
  
  const syncClearDoors = useCallback(() => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('doors')) return;
    
    console.log('🚪 Syncing clear doors');
    multiplayerService.syncClearDoors();
  }, [isInSession, canModify]);
  
  const syncClearWalls = useCallback(() => {
    if (!isInSession || isApplyingRemoteUpdate.current || !canModify('walls')) return;
    
    console.log('🧱 Syncing clear walls');
    multiplayerService.syncClearWalls();
  }, [isInSession, canModify]);
  
  // Cleanup de timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);
  
  return {
    syncAddToken,
    syncUpdateToken,
    syncRemoveToken,
    syncAddDrawing,
    syncClearDrawings,
    syncUpdateFog,
    syncUpdateDoor,
    syncUpdateWall,
    syncClearDoors,
    syncClearWalls,
    syncUpdateBackground,
    syncUpdateGridType,
    syncDiceRoll,
    syncUpdateSelectedTool,
    syncUpdateSelectedColor,
    syncUpdateFogEnabled,
    applyRemoteUpdate,
    canModify,
  };
};

export default useMultiplayerSync;
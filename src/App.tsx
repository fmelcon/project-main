import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Minus,
  Move,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  Square,
  Pencil,
  Eraser,
  PaintBucket,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Users,
  ExternalLink,
} from "lucide-react";
import GridComponent from "./components/GridComponent";
import TokenPanel from "./components/TokenPanel";
import DrawingTools from "./components/DrawingTools";
import ApiSection from "./components/ApiSection";
import InitiativeList from "./components/InitiativeList";
import DiceRoller from "./components/DiceRoller";
import MultiplayerPanel from "./components/MultiplayerPanel";
import TokenManagerPopup from "./components/TokenManagerPopup";
import TextEditModal, { TextData } from "./components/TextEditModal";
import LootEditModal, { LootData } from "./components/LootEditModal";
import { useMultiplayerSync } from "./hooks/useMultiplayerSync";
import { GameUpdate } from "./services/WebSocketService";
import "./App.css";

function App() {
  const [gridType, setGridType] = useState<"square" | "octagonal">("square");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<
    Array<{
      id: string;
      type: "ally" | "enemy" | "boss";
      x: number;
      y: number;
      color: string;
      name?: string;
      initiative?: number;
      maxHp?: number;
      currentHp?: number;
      ac?: number;
      statusMarkers?: string[];
      isVisible?: boolean;
      showNameplate?: boolean;
      showHealthBar?: boolean;
      notes?: string;
    }>
  >([]);
  const [selectedTool, setSelectedTool] = useState<
    "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot"
  >("move");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>("#ff0000");
  const [drawingData, setDrawingData] = useState<
    Array<{ type: string; points: number[]; color: string }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fogOfWar, setFogOfWar] = useState<Set<string>>(new Set());
  const [fogEnabled, setFogEnabled] = useState(false);
  const [permanentlyRevealed, setPermanentlyRevealed] = useState<Set<string>>(new Set());
  
  // Estados de multijugador
  const [isInMultiplayerSession, setIsInMultiplayerSession] = useState(false);
  const [isGameMaster, setIsGameMaster] = useState(false);
  const [doors, setDoors] = useState<Map<string, { type: 'horizontal' | 'vertical'; isOpen: boolean }>>(new Map());
  const [walls, setWalls] = useState<Map<string, { type: 'horizontal' | 'vertical' }>>(new Map());
  
  // Estado para resultados de dados
  const [lastDiceRoll, setLastDiceRoll] = useState<{ sides: number; result: number; player: string; timestamp: number } | null>(null);
  
  // Estado para Token Manager Popup
  const [showTokenManager, setShowTokenManager] = useState(false);
  
  // Estados para textos y botín
  const [texts, setTexts] = useState<TextData[]>([]);
  const [loots, setLoots] = useState<LootData[]>([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showLootModal, setShowLootModal] = useState(false);
  const [editingText, setEditingText] = useState<TextData | undefined>(undefined);
  const [editingLoot, setEditingLoot] = useState<LootData | undefined>(undefined);
  const [pendingTextPosition, setPendingTextPosition] = useState<{x: number, y: number} | null>(null);
  const [pendingLootPosition, setPendingLootPosition] = useState<{x: number, y: number} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    // Mostrar automáticamente Token Manager en pantalla completa
    if (newFullscreenState) {
      setShowTokenManager(true);
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    // Opcional: ocultar Token Manager al salir de pantalla completa
    // setShowTokenManager(false);
  };

  // Función para revelar áreas alrededor de tokens aliados
  const revealAroundAllies = useCallback(() => {
    if (!fogEnabled) return;
    
    const revealedCells = new Set<string>();
    
    tokens.forEach(token => {
      if (token.type === 'ally') {
        // Revelar 2 casilleros en todas las direcciones desde el token aliado
        // pero excluyendo las esquinas más alejadas
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            // Excluir las 4 esquinas más alejadas
            const isCorner = (Math.abs(dx) === 2 && Math.abs(dy) === 2);
            if (isCorner) continue;
            
            const newX = token.x + dx;
            const newY = token.y + dy;
            
            // Verificar que esté dentro de los límites de la grilla
            if (newX >= 0 && newX < 40 && newY >= 0 && newY < 40) {
              revealedCells.add(`${newX}-${newY}`);
            }
          }
        }
      }
    });
    
    // Agregar nuevas celdas reveladas a las permanentemente reveladas
    const newPermanentlyRevealed = new Set([...permanentlyRevealed, ...revealedCells]);
    setPermanentlyRevealed(newPermanentlyRevealed);
    
    // Combinar celdas actuales con las permanentemente reveladas
    setFogOfWar(newPermanentlyRevealed);
  }, [tokens, fogEnabled, permanentlyRevealed]);

  // Efecto para revelar áreas alrededor de aliados cuando se muevan o se active la niebla
  // Usar useRef para evitar loops infinitos
  const lastTokensRef = useRef<string>('');
  const lastFogEnabledRef = useRef<boolean>(false);
  
  useEffect(() => {
    const tokensString = JSON.stringify(tokens.map(t => ({ id: t.id, x: t.x, y: t.y, type: t.type })));
    
    // Solo ejecutar si realmente cambió la posición de tokens o el estado de fog
    if (tokensString !== lastTokensRef.current || fogEnabled !== lastFogEnabledRef.current) {
      lastTokensRef.current = tokensString;
      lastFogEnabledRef.current = fogEnabled;
      revealAroundAllies();
    }
  }, [revealAroundAllies]);

  // Hook de sincronización multijugador (memoizado para evitar recreación)
  const multiplayerSyncProps = useMemo(() => ({
    tokens,
    drawingData,
    fogOfWar,
    permanentlyRevealed,
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
    setPermanentlyRevealed,
    setDoors,
    setWalls,
    setTexts,
    setLoots,
    setBackgroundImage,
    setGridType,
    setSelectedTool,
    setSelectedColor,
    setFogEnabled,
    isInSession: isInMultiplayerSession,
    isGM: isGameMaster,
  }), [tokens, drawingData, fogOfWar, permanentlyRevealed, doors, walls, texts, loots, backgroundImage, gridType, selectedTool, selectedColor, fogEnabled, isInMultiplayerSession, isGameMaster]);
  
  const multiplayerSync = useMultiplayerSync(multiplayerSyncProps);

  // Manejar actualizaciones de juego remotas
  const handleGameUpdate = (update: GameUpdate) => {
    // CRÍTICO: Pasar el update al hook useMultiplayerSync para que aplique los cambios
    if (multiplayerSync.applyRemoteUpdate) {
      multiplayerSync.applyRemoteUpdate(update);
    }
  };

  // Manejar cambios de estado de sesión
  const handleSessionStateChange = (inSession: boolean, isGM: boolean) => {
    setIsInMultiplayerSession(inSession);
    setIsGameMaster(isGM);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newBackground = event.target?.result as string;
        setBackgroundImage(newBackground);
        
        // Sincronizar con multijugador
        multiplayerSync.syncUpdateBackground(newBackground);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearDrawing = () => {
    setDrawingData([]);
    
    // Sincronizar con multijugador
    multiplayerSync.syncClearDrawings();
  };

  const addToken = (type: "ally" | "enemy" | "boss", tokenData: any) => {
    const newToken = {
      id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: tokenData.x !== undefined ? tokenData.x : 20, // Centro de la grilla (40x40)
      y: tokenData.y !== undefined ? tokenData.y : 20, // Centro de la grilla (40x40)
      color: tokenData.color || (type === "ally" ? "#3498db" : type === "enemy" ? "#e74c3c" : "#f1c40f"),
      name: tokenData.name || "",
      initiative: tokenData.initiative || undefined,
      maxHp: tokenData.maxHp || undefined,
      currentHp: tokenData.currentHp || tokenData.maxHp || undefined,
      ac: tokenData.ac,
    };
    setTokens([...tokens, newToken]);
    
    // Sincronizar con multijugador
     multiplayerSync.syncAddToken(newToken);
  };

  const updateTokenName = (id: string, newName: string) => {
    setTokens(
      tokens.map((token) =>
        token.id === id ? { ...token, name: newName } : token
      )
    );
  };

  const moveToken = (id: string, x: number, y: number) => {
    setTokens(
      tokens.map((token) => (token.id === id ? { ...token, x, y } : token))
    );
    
    // Sincronizar con multijugador
     multiplayerSync.syncUpdateToken(id, { x, y });
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter((token) => token.id !== id));
    
    // Sincronizar con multijugador
     multiplayerSync.syncRemoveToken(id);
  };

  const resetGrid = () => {
    setTokens([]);
    setDrawingData([]);
    setBackgroundImage(null);
  };

  const saveMap = () => {
    const mapData = {
      gridType,
      backgroundImage,
      tokens,
      drawingData,
      doors: Array.from(doors.entries()), // Convertir Map a Array para JSON
      walls: Array.from(walls.entries()), // Convertir Map a Array para JSON
      fogOfWar: Array.from(fogOfWar), // Convertir Set a Array para JSON
      permanentlyRevealed: Array.from(permanentlyRevealed), // Convertir Set a Array para JSON
      fogEnabled,
      savedAt: new Date().toISOString(),
    };

    const mapName = prompt("Nombre del mapa:", `Mapa_${new Date().toLocaleDateString().replace(/\//g, '-')}`);
    if (mapName) {
      localStorage.setItem(`dndMap_${mapName}`, JSON.stringify(mapData));
      alert(`Mapa "${mapName}" guardado exitosamente!`);
    }
  };
  
  // Mantener función original para compatibilidad
  const saveGame = () => {
    const gameData = {
      gridType,
      backgroundImage,
      tokens,
      drawingData,
    };

    localStorage.setItem("dndCombatGrid", JSON.stringify(gameData));
    alert("Game saved successfully!");
  };

  const loadMap = () => {
    // Obtener todos los mapas guardados
    const savedMaps = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dndMap_')) {
        const mapName = key.replace('dndMap_', '');
        savedMaps.push(mapName);
      }
    }
    
    if (savedMaps.length === 0) {
      alert("No hay mapas guardados!");
      return;
    }
    
    // Mostrar lista de mapas disponibles
    const mapList = savedMaps.map((name, index) => `${index + 1}. ${name}`).join('\n');
    const selection = prompt(`Mapas disponibles:\n${mapList}\n\nEscribe el nombre del mapa a cargar:`);
    
    if (selection) {
      const savedMap = localStorage.getItem(`dndMap_${selection}`);
      if (savedMap) {
        try {
          const mapData = JSON.parse(savedMap);
          
          // Restaurar todos los estados
          setGridType(mapData.gridType || 'square');
          setBackgroundImage(mapData.backgroundImage || null);
          setTokens(mapData.tokens || []);
          setDrawingData(mapData.drawingData || []);
          
          // Restaurar Maps y Sets desde Arrays
          setDoors(new Map(mapData.doors || []));
          setWalls(new Map(mapData.walls || []));
          setFogOfWar(new Set(mapData.fogOfWar || []));
          setPermanentlyRevealed(new Set(mapData.permanentlyRevealed || []));
          setFogEnabled(mapData.fogEnabled || false);
          
          alert(`Mapa "${selection}" cargado exitosamente!`);
        } catch (error) {
          alert("Error al cargar el mapa. El archivo puede estar corrupto.");
        }
      } else {
        alert("Mapa no encontrado!");
      }
    }
  };
  
  // Mantener función original para compatibilidad
  const loadGame = () => {
    const savedGame = localStorage.getItem("dndCombatGrid");
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      setGridType(gameData.gridType);
      setBackgroundImage(gameData.backgroundImage);
      setTokens(gameData.tokens);
      setDrawingData(gameData.drawingData);
    } else {
      alert("No saved game found!");
    }
  };

  const handleDrawing = (newDrawingData: {
    type: string;
    points: number[];
    color: string;
  }) => {
    setDrawingData([...drawingData, newDrawingData]);
    
    // Sincronizar con multijugador
    multiplayerSync.syncAddDrawing(newDrawingData);
  };

  const updateToken = (id: string, newData: any) => {
    setTokens(
      tokens.map((token) =>
        token.id === id ? { ...token, ...newData } : token
      )
    );
    
    // Sincronizar con multijugador
     multiplayerSync.syncUpdateToken(id, newData);
  };

  const handleFogToggle = (x: number, y: number) => {
    // La niebla ahora se maneja automáticamente por los tokens aliados
    // Esta función ya no es necesaria para el comportamiento manual
    revealAroundAllies();
  };

  const toggleFogOfWar = () => {
    const newFogEnabled = !fogEnabled;
    setFogEnabled(newFogEnabled);
    
    // Sincronizar con multijugador
    multiplayerSync.syncUpdateFogEnabled(newFogEnabled);
  };

  const clearFogOfWar = () => {
    setFogOfWar(new Set());
    setPermanentlyRevealed(new Set()); // También limpiar áreas permanentemente reveladas
    
    // Sincronizar con multijugador
    multiplayerSync.syncFogUpdate([]);
  };

  const handleDoorToggle = (x: number, y: number, type: 'horizontal' | 'vertical') => {
    const cellKey = `${x}-${y}`;
    const newDoors = new Map(doors);
    
    if (newDoors.has(cellKey)) {
      const currentDoor = newDoors.get(cellKey)!;
      if (currentDoor.type === type) {
        // Toggle existing door of same type
        newDoors.set(cellKey, { type, isOpen: !currentDoor.isOpen });
      } else {
        // Replace with new door type
        newDoors.set(cellKey, { type, isOpen: false });
      }
    } else {
      // Create new door
      newDoors.set(cellKey, { type, isOpen: false });
    }
    
    setDoors(newDoors);
    
    // Sincronizar con multijugador
    multiplayerSync.syncUpdateDoor(cellKey, newDoors.get(cellKey));
  };

  const clearDoors = () => {
    setDoors(new Map());
    
    // Sincronizar con multijugador
    multiplayerSync.syncClearDoors();
  };

  const handleWallToggle = (x: number, y: number, type: 'horizontal' | 'vertical') => {
    const cellKey = `${x}-${y}`;
    const newWalls = new Map(walls);
    
    if (newWalls.has(cellKey)) {
      newWalls.delete(cellKey); // Remove existing wall
    } else {
      newWalls.set(cellKey, { type }); // Add new wall
    }
    
    setWalls(newWalls);
    
    // Sincronizar con multijugador
    multiplayerSync.syncUpdateWall(cellKey, newWalls.get(cellKey));
  };

  const clearWalls = () => {
    setWalls(new Map());
    
    // Sincronizar con multijugador
    multiplayerSync.syncClearWalls();
  };
  
  const handleDiceRoll = (sides: number, result: number) => {
    const diceRollData = {
      sides,
      result,
      player: isGameMaster ? 'GM' : 'Player',
      timestamp: Date.now()
    };
    
    setLastDiceRoll(diceRollData);
    
    // Sincronizar con multijugador
    multiplayerSync.syncDiceRoll(diceRollData);
  };
  
  const handleSelectedToolChange = (tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot") => {
    setSelectedTool(tool);
    // NO sincronizar herramientas - cada jugador mantiene su propia selección
  };
  
  // Funciones para manejar textos
  const handleTextSave = (textData: TextData) => {
    if (editingText) {
      setTexts(texts.map(t => t.id === textData.id ? textData : t));
    } else {
      if (pendingTextPosition) {
        textData.x = pendingTextPosition.x;
        textData.y = pendingTextPosition.y;
      }
      setTexts([...texts, textData]);
    }
    setEditingText(undefined);
    setPendingTextPosition(null);
  };
  
  const handleTextEdit = (textData: TextData) => {
    setEditingText(textData);
    setShowTextModal(true);
  };
  
  const handleTextDelete = (id: string) => {
    setTexts(texts.filter(t => t.id !== id));
  };
  
  // Funciones para manejar botín
  const handleLootSave = (lootData: LootData) => {
    if (editingLoot) {
      setLoots(loots.map(l => l.id === lootData.id ? lootData : l));
    } else {
      if (pendingLootPosition) {
        lootData.x = pendingLootPosition.x;
        lootData.y = pendingLootPosition.y;
      }
      setLoots([...loots, lootData]);
    }
    setEditingLoot(undefined);
    setPendingLootPosition(null);
  };
  
  const handleLootEdit = (lootData: LootData) => {
    setEditingLoot(lootData);
    setShowLootModal(true);
  };
  
  const handleLootDelete = (id: string) => {
    setLoots(loots.filter(l => l.id !== id));
  };
  
  // Funciones de limpieza
  const clearTexts = () => {
    setTexts([]);
  };
  
  const clearLoots = () => {
    setLoots([]);
  };
  
  const clearAll = () => {
    // Limpiar todo el contenido de la grilla
    setDrawingData([]);
    setTexts([]);
    setLoots([]);
    setDoors(new Map());
    setWalls(new Map());
    setFogOfWar(new Set());
    setPermanentlyRevealed(new Set());
  };

  // Funciones de zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Máximo 3x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Mínimo 0.5x
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };
  
  // Función para borrar selectivamente una celda
  const eraseCell = (gridX: number, gridY: number) => {
    // Eliminar textos en esta posición
    setTexts(texts.filter(text => 
      Math.floor(text.x) !== gridX || Math.floor(text.y) !== gridY
    ));
    
    // Eliminar botín en esta posición
    setLoots(loots.filter(loot => 
      Math.floor(loot.x) !== gridX || Math.floor(loot.y) !== gridY
    ));
    
    // Eliminar puertas en esta posición
    const newDoors = new Map(doors);
    newDoors.delete(`${gridX}-${gridY}`);
    setDoors(newDoors);
    
    // Eliminar muros en esta posición
    const newWalls = new Map(walls);
    newWalls.delete(`${gridX}-${gridY}`);
    setWalls(newWalls);
    
    // Eliminar dibujos que intersecten con esta celda
    const CELL_SIZE = 40;
    const cellLeft = gridX * CELL_SIZE;
    const cellTop = gridY * CELL_SIZE;
    const cellRight = cellLeft + CELL_SIZE;
    const cellBottom = cellTop + CELL_SIZE;
    
    setDrawingData(drawingData.filter(drawing => {
      if (drawing.type === 'fill') {
        // Para rellenos, verificar si el punto está en la celda
        const [x, y] = drawing.points;
        return !(x >= cellLeft && x < cellRight && y >= cellTop && y < cellBottom);
      } else {
        // Para líneas y cuadrados, verificar si algún punto intersecta
        for (let i = 0; i < drawing.points.length; i += 2) {
          const x = drawing.points[i];
          const y = drawing.points[i + 1];
          if (x >= cellLeft && x < cellRight && y >= cellTop && y < cellBottom) {
            return false; // Eliminar este dibujo
          }
        }
        return true; // Mantener este dibujo
      }
    }));
    
    // Sincronizar con multijugador
    multiplayerSync.syncGameState({
      texts: texts.filter(text => 
        Math.floor(text.x) !== gridX || Math.floor(text.y) !== gridY
      ),
      loots: loots.filter(loot => 
        Math.floor(loot.x) !== gridX || Math.floor(loot.y) !== gridY
      ),
      doors: newDoors,
      walls: newWalls,
      drawingData: drawingData.filter(drawing => {
        if (drawing.type === 'fill') {
          const [x, y] = drawing.points;
          return !(x >= cellLeft && x < cellRight && y >= cellTop && y < cellBottom);
        } else {
          for (let i = 0; i < drawing.points.length; i += 2) {
            const x = drawing.points[i];
            const y = drawing.points[i + 1];
            if (x >= cellLeft && x < cellRight && y >= cellTop && y < cellBottom) {
              return false;
            }
          }
          return true;
        }
      })
    });
  };
  
  const handleSelectedColorChange = (color: string) => {
    setSelectedColor(color);
    // NO sincronizar colores - cada jugador mantiene su propia selección
  };

  // Render en modo pantalla completa
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50">
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          
          {/* Exit Fullscreen Button */}
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition-all"
            onClick={exitFullscreen}
          >
            <Minimize size={16} /> Exit Fullscreen
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="relative border-2 border-gray-600 rounded overflow-auto max-h-full max-w-full grid-scrollable">
            <GridComponent
              gridType={gridType}
              backgroundImage={backgroundImage}
              zoomLevel={zoomLevel}
              tokens={tokens}
              drawingData={drawingData}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              onDrawing={handleDrawing}
              onTokenMove={moveToken}
              onTokenUpdate={updateToken}
              onTokenDelete={removeToken}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              draggedToken={draggedToken}
              setDraggedToken={setDraggedToken}
              fogOfWar={fogOfWar}
              onFogToggle={handleFogToggle}
              fogEnabled={fogEnabled}
              doors={doors}
              onDoorToggle={handleDoorToggle}
              walls={walls}
              onWallToggle={handleWallToggle}
              texts={texts}
              onTextEdit={handleTextEdit}
              onTextDelete={handleTextDelete}
              loots={loots}
              onLootEdit={handleLootEdit}
              onLootDelete={handleLootDelete}
              onTextPlace={(x, y) => {
                setPendingTextPosition({x, y});
                setShowTextModal(true);
              }}
              onLootPlace={(x, y) => {
                setPendingLootPosition({x, y});
                setShowLootModal(true);
              }}
              onEraseCell={eraseCell}
              onOpenTokenManager={() => setShowTokenManager(true)}
              onAddAlly={() => addToken('ally', {})}
              onAddEnemy={() => addToken('enemy', {})}
              onAddBoss={() => addToken('boss', {})}
            />
          </div>
        </div>
        
        {/* Token Manager Popup - También en fullscreen */}
        <TokenManagerPopup
          isOpen={showTokenManager}
          onClose={() => setShowTokenManager(false)}
          tokens={tokens}
          updateToken={updateToken}
          removeToken={removeToken}
        />
        
        {/* Text Edit Modal - También en fullscreen */}
        <TextEditModal
          isOpen={showTextModal}
          onClose={() => {
            setShowTextModal(false);
            setEditingText(undefined);
            setPendingTextPosition(null);
          }}
          onSave={handleTextSave}
          initialData={editingText}
        />
        
        {/* Loot Edit Modal - También en fullscreen */}
         <LootEditModal
           isOpen={showLootModal}
           onClose={() => {
             setShowLootModal(false);
             setEditingLoot(undefined);
             setPendingLootPosition(null);
           }}
           onSave={handleLootSave}
           initialData={editingLoot}
         />
         
         {/* Initiative List Flotante - También en fullscreen */}
         <InitiativeList tokens={tokens} />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col touch-friendly no-select">
      <header
        className="p-4 shadow-lg"
        style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
      >
        <h1 className="text-2xl font-bold text-center">D&D Combat Grid</h1>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row p-2 md:p-4 gap-2 md:gap-4">
        {/* Columna izquierda: Dados y controles */}
        <div className="w-full lg:w-1/4 flex flex-col gap-2 md:gap-4 order-2 lg:order-1">
          <DiceRoller onResult={handleDiceRoll} /> {/* Mostrar el lanzador de dados */}
          
          {/* Panel de Multijugador */}
          <MultiplayerPanel
            onGameUpdate={handleGameUpdate}
            onSessionStateChange={handleSessionStateChange}
          />
          
          <TokenPanel
            addToken={addToken}
            removeToken={removeToken}
            resetGrid={resetGrid}
            saveGame={saveGame}
            loadGame={loadGame}
            saveMap={saveMap}
            loadMap={loadMap}
            updateToken={updateToken} // Nueva función para actualizar los datos del token
            tokens={tokens}
          />
        </div>

        {/* Columna central: Grilla y herramientas de dibujo */}
        <div className="flex flex-col gap-2 md:gap-4 w-full order-1 lg:order-2">
          <div
            className="p-2 md:p-4 rounded-lg shadow-lg"
            style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`px-3 py-1 rounded ${
                    gridType === "square" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => {
                    setGridType("square");
                    // Sincronizar con multijugador
                    multiplayerSync.syncUpdateGridType("square");
                  }}
                >
                  Square Grid
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    gridType === "octagonal" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => {
                    setGridType("octagonal");
                    // Sincronizar con multijugador
                    multiplayerSync.syncUpdateGridType("octagonal");
                  }}
                >
                  Octagonal Grid
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} /> Upload Map
                </button>
                <div className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1">
                  <button
                    className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded flex items-center transition-all"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded flex items-center transition-all"
                    onClick={handleZoomIn}
                    title="Zoom In"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs transition-all"
                    onClick={resetZoom}
                    title="Reset Zoom"
                  >
                    1:1
                  </button>
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center gap-1 transition-all"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleBackgroundUpload}
              />
            </div>

            <div className="relative border-2 border-gray-600 rounded overflow-auto max-h-[70vh] max-w-full grid-scrollable">
              <GridComponent
                gridType={gridType}
                backgroundImage={backgroundImage}
                zoomLevel={zoomLevel}
                tokens={tokens}
                drawingData={drawingData}
                selectedTool={selectedTool}
                selectedColor={selectedColor}
                onDrawing={handleDrawing}
                onTokenMove={moveToken}
                onTokenUpdate={updateToken}
                onTokenDelete={removeToken}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                draggedToken={draggedToken}
                setDraggedToken={setDraggedToken}
                fogOfWar={fogOfWar}
                onFogToggle={handleFogToggle}
                fogEnabled={fogEnabled}
                doors={doors}
                onDoorToggle={handleDoorToggle}
                walls={walls}
                onWallToggle={handleWallToggle}
                texts={texts}
                onTextEdit={handleTextEdit}
                onTextDelete={handleTextDelete}
                loots={loots}
                onLootEdit={handleLootEdit}
                onLootDelete={handleLootDelete}
                onTextPlace={(x, y) => {
                  setPendingTextPosition({x, y});
                  setShowTextModal(true);
                }}
                onLootPlace={(x, y) => {
                  setPendingLootPosition({x, y});
                  setShowLootModal(true);
                }}
                onEraseCell={eraseCell}
                 onOpenTokenManager={() => setShowTokenManager(true)}
                 onAddAlly={() => addToken('ally', {})}
                 onAddEnemy={() => addToken('enemy', {})}
                 onAddBoss={() => addToken('boss', {})}
               />
            </div>
          </div>

          <DrawingTools
            selectedTool={selectedTool}
            setSelectedTool={handleSelectedToolChange}
            selectedColor={selectedColor}
            setSelectedColor={handleSelectedColorChange}
            fogEnabled={fogEnabled}
            toggleFogOfWar={toggleFogOfWar}
            clearAll={clearAll}
          />
        </div>
      </main>

      <ApiSection />
      
      {/* Token Manager Popup */}
      <TokenManagerPopup
        isOpen={showTokenManager}
        onClose={() => setShowTokenManager(false)}
        tokens={tokens}
        updateToken={updateToken}
        removeToken={removeToken}
      />
      
      {/* Text Edit Modal */}
      <TextEditModal
        isOpen={showTextModal}
        onClose={() => {
          setShowTextModal(false);
          setEditingText(undefined);
          setPendingTextPosition(null);
        }}
        onSave={handleTextSave}
        initialData={editingText}
      />
      
      {/* Loot Edit Modal */}
      <LootEditModal
        isOpen={showLootModal}
        onClose={() => {
          setShowLootModal(false);
          setEditingLoot(undefined);
          setPendingLootPosition(null);
        }}
        onSave={handleLootSave}
        initialData={editingLoot}
      />

      {/* Initiative List Flotante */}
      <InitiativeList tokens={tokens} />

      <footer
        className="p-4 text-center text-sm"
        style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
      >
        D&D Combat Grid © 2025 - Powered by Franco Melcon
      </footer>
    </div>
  );
}

export default App;

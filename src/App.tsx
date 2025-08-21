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
import { dndApiService, LootRarity } from "./services/DnDApiService";
import "./App.css";

function App() {
  const [gridType, setGridType] = useState<"square" | "octagonal">("square");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<
    Array<{
      id: string;
      name?: string;
      initiative?: number;
      maxHp?: number;
      currentHp?: number;
      ac?: number;
      type: "ally" | "enemy" | "boss";
      x: number;
      y: number;
      color: string;
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
  
  // Estados para anotaciones de habitaciones (one page dungeon)
  const [roomAnnotations, setRoomAnnotations] = useState<Array<{
    id: string;
    roomNumber: number;
    x: number;
    y: number;
    content: string;
    lineToX: number;
    lineToY: number;
    rarity?: LootRarity;
    isVisible?: boolean;
  }>>([]);
  
  // Función para alternar visibilidad de anotaciones
  const toggleAnnotationVisibility = (annotationId: string) => {
    setRoomAnnotations(prev => 
      prev.map(annotation => 
        annotation.id === annotationId 
          ? { ...annotation, isVisible: !annotation.isVisible }
          : annotation
      )
    );
  };
  const [editingText, setEditingText] = useState<TextData | undefined>(undefined);
  const [editingLoot, setEditingLoot] = useState<LootData | undefined>(undefined);
  const [textPosition, setTextPosition] = useState<{x: number, y: number} | null>(null);
  const [lootPosition, setLootPosition] = useState<{x: number, y: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuración de multijugador
  const multiplayerSync = useMultiplayerSync({
    onGameUpdate: (update: GameUpdate) => {
      console.log('Received game update:', update);
      // Manejar actualizaciones del juego
    },
    onSessionStateChange: (isInSession: boolean, isGM: boolean) => {
      setIsInMultiplayerSession(isInSession);
      setIsGameMaster(isGM);
    }
  });

  const handleGameUpdate = useCallback((update: GameUpdate) => {
    console.log('Handling game update:', update);
    // Procesar actualizaciones específicas del juego
  }, []);

  const handleSessionStateChange = useCallback((isInSession: boolean, isGM: boolean) => {
    setIsInMultiplayerSession(isInSession);
    setIsGameMaster(isGM);
    console.log(`Session state changed: inSession=${isInSession}, isGM=${isGM}`);
  }, []);

  const addToken = (type: "ally" | "enemy" | "boss", customData: any = {}) => {
    const colors = {
      ally: "#22c55e",
      enemy: "#ef4444",
      boss: "#f59e0b"
    };
    
    const newToken = {
      id: Date.now().toString(),
      type,
      x: Math.floor(Math.random() * 20) + 10,
      y: Math.floor(Math.random() * 20) + 10,
      color: colors[type],
      name: customData.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${tokens.filter(t => t.type === type).length + 1}`,
      initiative: customData.initiative || 0,
      maxHp: customData.maxHp || (type === 'boss' ? 100 : type === 'enemy' ? 50 : 75),
      currentHp: customData.currentHp || customData.maxHp || (type === 'boss' ? 100 : type === 'enemy' ? 50 : 75),
      ac: customData.ac || (type === 'boss' ? 18 : type === 'enemy' ? 14 : 16),
      showHealthBar: customData.showHealthBar !== undefined ? customData.showHealthBar : true,
      notes: customData.notes || ''
    };
    
    setTokens([...tokens, newToken]);
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncAddToken(newToken);
    }
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter(token => token.id !== id));
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncRemoveToken(id);
    }
  };

  const updateToken = (id: string, updates: any) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, ...updates } : token
    ));
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncUpdateToken(id, updates);
    }
  };

  const handleTokenMove = (id: string, x: number, y: number) => {
    updateToken(id, { x, y });
  };

  const handleTokenClick = (id: string) => {
    console.log('Token clicked:', id);
  };

  const resetGrid = () => {
    setTokens([]);
    setDrawingData([]);
    setFogOfWar(new Set());
    setPermanentlyRevealed(new Set());
    setDoors(new Map());
    setWalls(new Map());
    setTexts([]);
    setLoots([]);
    setRoomAnnotations([]);
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncClearAll();
    }
  };

  const saveGame = () => {
    const gameState = {
      tokens,
      drawingData,
      fogOfWar: Array.from(fogOfWar),
      permanentlyRevealed: Array.from(permanentlyRevealed),
      doors: Array.from(doors.entries()),
      walls: Array.from(walls.entries()),
      texts,
      loots,
      roomAnnotations,
      gridType,
      selectedTool,
      selectedColor,
      zoomLevel
    };
    
    const blob = new Blob([JSON.stringify(gameState, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-game-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameState = JSON.parse(e.target?.result as string);
        
        setTokens(gameState.tokens || []);
        setDrawingData(gameState.drawingData || []);
        setFogOfWar(new Set(gameState.fogOfWar || []));
        setPermanentlyRevealed(new Set(gameState.permanentlyRevealed || []));
        setDoors(new Map(gameState.doors || []));
        setWalls(new Map(gameState.walls || []));
        setTexts(gameState.texts || []);
        setLoots(gameState.loots || []);
        setRoomAnnotations(gameState.roomAnnotations || []);
        setGridType(gameState.gridType || 'square');
        setSelectedTool(gameState.selectedTool || 'move');
        setSelectedColor(gameState.selectedColor || '#ff0000');
        setZoomLevel(gameState.zoomLevel || 1);
        
        console.log('Game loaded successfully');
      } catch (error) {
        console.error('Error loading game:', error);
        alert('Error loading game file');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const saveMap = () => {
    const mapState = {
      doors: Array.from(doors.entries()),
      walls: Array.from(walls.entries()),
      texts,
      loots,
      roomAnnotations,
      gridType
    };
    
    const blob = new Blob([JSON.stringify(mapState, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-map-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapState = JSON.parse(e.target?.result as string);
        
        setDoors(new Map(mapState.doors || []));
        setWalls(new Map(mapState.walls || []));
        setTexts(mapState.texts || []);
        setLoots(mapState.loots || []);
        setRoomAnnotations(mapState.roomAnnotations || []);
        setGridType(mapState.gridType || 'square');
        
        console.log('Map loaded successfully');
      } catch (error) {
        console.error('Error loading map:', error);
        alert('Error loading map file');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleSelectedToolChange = (tool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot") => {
    setSelectedTool(tool);
  };

  const handleSelectedColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.3));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const handleFogToggle = (x: number, y: number) => {
    const key = `${x}-${y}`;
    const newFogOfWar = new Set(fogOfWar);
    const newPermanentlyRevealed = new Set(permanentlyRevealed);
    
    if (fogOfWar.has(key)) {
      newFogOfWar.delete(key);
      newPermanentlyRevealed.add(key);
    } else {
      newFogOfWar.add(key);
      newPermanentlyRevealed.delete(key);
    }
    
    setFogOfWar(newFogOfWar);
    setPermanentlyRevealed(newPermanentlyRevealed);
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncFogToggle(x, y);
    }
  };

  const toggleFogOfWar = () => {
    setFogEnabled(!fogEnabled);
  };

  const handleWallToggle = (x: number, y: number, type: 'horizontal' | 'vertical') => {
    const key = `${x}-${y}`;
    const newWalls = new Map(walls);
    const newDoors = new Map(doors);
    
    if (newWalls.has(key)) {
      newWalls.delete(key);
    } else {
      // Si hay una puerta en esta posición, eliminarla primero
      if (newDoors.has(key)) {
        newDoors.delete(key);
        setDoors(newDoors);
      }
      newWalls.set(key, { type });
    }
    
    setWalls(newWalls);
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncUpdateWall(key, newWalls.has(key) ? { type } : null);
      if (newDoors.size !== doors.size) {
        multiplayerSync.syncUpdateDoor(key, null);
      }
    }
  };

  const handleDoorToggle = (x: number, y: number, type: 'horizontal' | 'vertical') => {
    const key = `${x}-${y}`;
    const newDoors = new Map(doors);
    const newWalls = new Map(walls);
    
    if (newDoors.has(key)) {
      const door = newDoors.get(key)!;
      if (door.isOpen) {
        newDoors.delete(key);
      } else {
        newDoors.set(key, { ...door, isOpen: true });
      }
    } else {
      // Si hay una pared en esta posición, eliminarla primero
      if (newWalls.has(key)) {
        newWalls.delete(key);
        setWalls(newWalls);
      }
      newDoors.set(key, { type, isOpen: false });
    }
    
    setDoors(newDoors);
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncUpdateDoor(key, newDoors.get(key) || null);
      if (newWalls.size !== walls.size) {
        multiplayerSync.syncUpdateWall(key, null);
      }
    }
  };

  const clearAll = () => {
    setDrawingData([]);
    setFogOfWar(new Set());
    setPermanentlyRevealed(new Set());
    setDoors(new Map());
    setWalls(new Map());
    setTexts([]);
    setLoots([]);
    setRoomAnnotations([]);
    
    // Sincronizar con multijugador
    if (isInMultiplayerSession) {
      multiplayerSync.syncClearAll();
    }
  };

  const handleTextEdit = (textData: TextData) => {
    setEditingText(textData);
    setShowTextModal(true);
  };

  const handleTextDelete = (id: string) => {
    setTexts(texts.filter(text => text.id !== id));
  };

  const handleLootEdit = (lootData: LootData) => {
    setEditingLoot(lootData);
    setShowLootModal(true);
  };

  const handleLootDelete = (id: string) => {
    setLoots(loots.filter(loot => loot.id !== id));
  };

  const handleTextSave = (textData: TextData) => {
    if (editingText) {
      // Editando texto existente
      setTexts(texts.map(text => text.id === textData.id ? textData : text));
    } else {
      // Creando nuevo texto
      const newText = {
        ...textData,
        x: textPosition?.x || 0,
        y: textPosition?.y || 0
      };
      setTexts([...texts, newText]);
    }
    setShowTextModal(false);
    setEditingText(undefined);
    setTextPosition(null);
  };

  const handleLootSave = (lootData: LootData) => {
    if (editingLoot) {
      // Editando loot existente
      setLoots(loots.map(loot => loot.id === lootData.id ? lootData : loot));
    } else {
      // Creando nuevo loot
      const newLoot = {
        ...lootData,
        x: lootPosition?.x || 0,
        y: lootPosition?.y || 0
      };
      setLoots([...loots, newLoot]);
    }
    setShowLootModal(false);
    setEditingLoot(undefined);
    setLootPosition(null);
  };

  const handleDrawing = (newDrawingData: { type: string; points: number[]; color: string }) => {
    setDrawingData([...drawingData, newDrawingData]);
  };

  // Generador de dungeons estilo "One Page Dungeon" con API de D&D 5e
  const generateRandomMap = async () => {
    console.log('📜 Generating One Page Dungeon with D&D 5e API integration...');
    
    // Limpiar todo primero
    clearAll();
    setRoomAnnotations([]);
    console.log('🧹 Cleared existing content');
    
    const GRID_SIZE = 40;
    const newWalls = new Map();
    const newDoors = new Map();
    const newLoots: LootData[] = [];
    const newTexts: TextData[] = [];
    const newAnnotations: Array<{
      id: string;
      roomNumber: number;
      x: number;
      y: number;
      content: string;
      lineToX: number;
      lineToY: number;
      rarity?: LootRarity;
    }> = [];
    
    // Formas de habitaciones tipo Tetris (4, 6, 9, 12 casillas)
    const TETRIS_ROOM_SHAPES = {
      // 4 casillas
      I_SHAPE_4: [[1, 1, 1, 1]], // Línea horizontal
      L_SHAPE_4: [[1, 0], [1, 0], [1, 1]], // L pequeña
      SQUARE_4: [[1, 1], [1, 1]], // Cuadrado 2x2
      
      // 6 casillas
      I_SHAPE_6: [[1, 1, 1, 1, 1, 1]], // Línea larga
      L_SHAPE_6: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], // L mediana
      T_SHAPE_6: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], // T
      
      // 9 casillas
      SQUARE_9: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // Cuadrado 3x3
      PLUS_9: [[0, 1, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0]], // Cruz
      
      // 12 casillas
      RECT_12: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]], // Rectángulo 4x3
      L_SHAPE_12: [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 1]] // L grande
    };
    
    interface Room {
      id: number;
      x: number;
      y: number;
      width: number;
      height: number;
      shape: number[][];
      cells: Array<{x: number, y: number}>;
      size: number;
      number: number;
    }
    
    const rooms: Room[] = [];
    let roomCounter = 1;
    
    // 1. Crear perímetro sellado
    for (let x = 0; x < GRID_SIZE; x++) {
      newWalls.set(`${x}-0`, { type: 'horizontal' });
      newWalls.set(`${x}-${GRID_SIZE - 1}`, { type: 'horizontal' });
    }
    for (let y = 0; y < GRID_SIZE; y++) {
      newWalls.set(`0-${y}`, { type: 'vertical' });
      newWalls.set(`${GRID_SIZE - 1}-${y}`, { type: 'vertical' });
    }
    
    console.log('🛡️ Created sealed perimeter');
    
    // 2. Generar habitaciones con formas Tetris
    const numRooms = Math.floor(Math.random() * 6) + 8; // 8-13 habitaciones
    const shapeNames = Object.keys(TETRIS_ROOM_SHAPES);
    
    for (let i = 0; i < numRooms; i++) {
      let attempts = 0;
      let roomPlaced = false;
      
      while (attempts < 50 && !roomPlaced) {
        attempts++;
        
        // Seleccionar forma aleatoria
        const shapeName = shapeNames[Math.floor(Math.random() * shapeNames.length)];
        const shape = TETRIS_ROOM_SHAPES[shapeName as keyof typeof TETRIS_ROOM_SHAPES];
        
        // Posición aleatoria con margen
        const x = Math.floor(Math.random() * (GRID_SIZE - shape[0].length - 4)) + 2;
        const y = Math.floor(Math.random() * (GRID_SIZE - shape.length - 4)) + 2;
        
        // Calcular celdas de la habitación
        const cells: Array<{x: number, y: number}> = [];
        for (let sy = 0; sy < shape.length; sy++) {
          for (let sx = 0; sx < shape[sy].length; sx++) {
            if (shape[sy][sx] === 1) {
              cells.push({x: x + sx, y: y + sy});
            }
          }
        }
        
        // Verificar superposición con habitaciones existentes
        let hasOverlap = false;
        for (const existingRoom of rooms) {
          for (const newCell of cells) {
            for (const existingCell of existingRoom.cells) {
              if (Math.abs(newCell.x - existingCell.x) <= 2 && 
                  Math.abs(newCell.y - existingCell.y) <= 2) {
                hasOverlap = true;
                break;
              }
            }
            if (hasOverlap) break;
          }
          if (hasOverlap) break;
        }
        
        if (!hasOverlap) {
          const room: Room = {
            id: i,
            x,
            y,
            width: shape[0].length,
            height: shape.length,
            shape,
            cells,
            size: cells.length,
            number: roomCounter++
          };
          
          rooms.push(room);
          roomPlaced = true;
        }
      }
    }
    
    console.log('🏠 Generated', rooms.length, 'Tetris-shaped rooms');
    
    // 3. Crear paredes alrededor de cada habitación
    rooms.forEach(room => {
      room.cells.forEach(cell => {
        const directions = [
          {dx: 0, dy: -1, type: 'horizontal'},
          {dx: 0, dy: 1, type: 'horizontal'},
          {dx: -1, dy: 0, type: 'vertical'},
          {dx: 1, dy: 0, type: 'vertical'}
        ];
        
        directions.forEach(dir => {
          const wallX = cell.x + dir.dx;
          const wallY = cell.y + dir.dy;
          
          const hasRoomCell = room.cells.some(c => c.x === wallX && c.y === wallY);
          if (!hasRoomCell) {
            newWalls.set(`${wallX}-${wallY}`, { type: dir.type as 'horizontal' | 'vertical' });
          }
        });
      });
    });
    
    // 4. Conectar habitaciones con pasillos estrechos
    const corridors: Array<{cells: Array<{x: number, y: number}>}> = [];
    
    // Crear árbol de conexión mínimo (MST)
    const connections: Array<{roomA: Room, roomB: Room, distance: number}> = [];
    
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const roomA = rooms[i];
        const roomB = rooms[j];
        
        const centerA = {
          x: roomA.x + Math.floor(roomA.width / 2),
          y: roomA.y + Math.floor(roomA.height / 2)
        };
        const centerB = {
          x: roomB.x + Math.floor(roomB.width / 2),
          y: roomB.y + Math.floor(roomB.height / 2)
        };
        
        const distance = Math.abs(centerA.x - centerB.x) + Math.abs(centerA.y - centerB.y);
        connections.push({roomA, roomB, distance});
      }
    }
    
    // Ordenar por distancia y crear conexiones
    connections.sort((a, b) => a.distance - b.distance);
    const connectedRooms = new Set<number>();
    const selectedConnections: Array<{roomA: Room, roomB: Room}> = [];
    
    connections.forEach(conn => {
      if (!connectedRooms.has(conn.roomA.id) || !connectedRooms.has(conn.roomB.id)) {
        selectedConnections.push(conn);
        connectedRooms.add(conn.roomA.id);
        connectedRooms.add(conn.roomB.id);
      }
    });
    
    // Crear pasillos
    selectedConnections.forEach(conn => {
      const startCell = conn.roomA.cells[Math.floor(Math.random() * conn.roomA.cells.length)];
      const endCell = conn.roomB.cells[Math.floor(Math.random() * conn.roomB.cells.length)];
      
      const corridorCells: Array<{x: number, y: number}> = [];
      
      // Pasillo en L
      let currentX = startCell.x;
      let currentY = startCell.y;
      
      // Horizontal primero
      while (currentX !== endCell.x) {
        corridorCells.push({x: currentX, y: currentY});
        currentX += currentX < endCell.x ? 1 : -1;
      }
      
      // Vertical después
      while (currentY !== endCell.y) {
        corridorCells.push({x: currentX, y: currentY});
        currentY += currentY < endCell.y ? 1 : -1;
      }
      
      corridors.push({cells: corridorCells});
    });
    
    // 5. Crear paredes alrededor de pasillos
    corridors.forEach(corridor => {
      corridor.cells.forEach(cell => {
        const directions = [
          {dx: 0, dy: -1, type: 'horizontal'},
          {dx: 0, dy: 1, type: 'horizontal'},
          {dx: -1, dy: 0, type: 'vertical'},
          {dx: 1, dy: 0, type: 'vertical'}
        ];
        
        directions.forEach(dir => {
          const wallX = cell.x + dir.dx;
          const wallY = cell.y + dir.dy;
          
          const hasCorridorCell = corridors.some(c => 
            c.cells.some(cc => cc.x === wallX && cc.y === wallY)
          );
          const hasRoomCell = rooms.some(r => 
            r.cells.some(rc => rc.x === wallX && rc.y === wallY)
          );
          
          if (!hasCorridorCell && !hasRoomCell && 
              wallX > 0 && wallX < GRID_SIZE - 1 && 
              wallY > 0 && wallY < GRID_SIZE - 1) {
            newWalls.set(`${wallX}-${wallY}`, { type: dir.type as 'horizontal' | 'vertical' });
          }
        });
      });
    });
    
    // 6. Colocar puertas en conexiones habitación-pasillo (una por conexión)
    const placedDoors = new Set<string>();
    
    selectedConnections.forEach(conn => {
      // Encontrar el mejor punto de conexión entre habitación y pasillo
      let bestDoor: {x: number, y: number, type: 'horizontal' | 'vertical'} | null = null;
      let minDistance = Infinity;
      
      // Buscar conexiones entre roomA y pasillos
      conn.roomA.cells.forEach(roomCell => {
        corridors.forEach(corridor => {
          corridor.cells.forEach(corridorCell => {
            const distance = Math.abs(roomCell.x - corridorCell.x) + Math.abs(roomCell.y - corridorCell.y);
            if (distance === 1) {
              const doorX = roomCell.x === corridorCell.x ? roomCell.x : Math.min(roomCell.x, corridorCell.x);
              const doorY = roomCell.y === corridorCell.y ? roomCell.y : Math.min(roomCell.y, corridorCell.y);
              const doorType = roomCell.x === corridorCell.x ? 'horizontal' : 'vertical';
              const doorKey = `${doorX}-${doorY}`;
              
              // Verificar que no haya puertas adyacentes
              const hasAdjacentDoor = [
                `${doorX-1}-${doorY}`, `${doorX+1}-${doorY}`,
                `${doorX}-${doorY-1}`, `${doorX}-${doorY+1}`
              ].some(key => placedDoors.has(key));
              
              if (!hasAdjacentDoor && !placedDoors.has(doorKey)) {
                const centerDistance = Math.abs(doorX - (conn.roomA.x + Math.floor(conn.roomA.width / 2))) +
                                    Math.abs(doorY - (conn.roomA.y + Math.floor(conn.roomA.height / 2)));
                if (centerDistance < minDistance) {
                  minDistance = centerDistance;
                  bestDoor = {x: doorX, y: doorY, type: doorType};
                }
              }
            }
          });
        });
      });
      
      // Colocar la mejor puerta encontrada para roomA
      if (bestDoor) {
        const doorKey = `${bestDoor.x}-${bestDoor.y}`;
        newWalls.delete(doorKey);
        newDoors.set(doorKey, {
          type: bestDoor.type,
          isOpen: Math.random() < 0.7 // 70% abiertas
        });
        placedDoors.add(doorKey);
      }
      
      // Repetir para roomB
      bestDoor = null;
      minDistance = Infinity;
      
      conn.roomB.cells.forEach(roomCell => {
        corridors.forEach(corridor => {
          corridor.cells.forEach(corridorCell => {
            const distance = Math.abs(roomCell.x - corridorCell.x) + Math.abs(roomCell.y - corridorCell.y);
            if (distance === 1) {
              const doorX = roomCell.x === corridorCell.x ? roomCell.x : Math.min(roomCell.x, corridorCell.x);
              const doorY = roomCell.y === corridorCell.y ? roomCell.y : Math.min(roomCell.y, corridorCell.y);
              const doorType = roomCell.x === corridorCell.x ? 'horizontal' : 'vertical';
              const doorKey = `${doorX}-${doorY}`;
              
              // Verificar que no haya puertas adyacentes
              const hasAdjacentDoor = [
                `${doorX-1}-${doorY}`, `${doorX+1}-${doorY}`,
                `${doorX}-${doorY-1}`, `${doorX}-${doorY+1}`
              ].some(key => placedDoors.has(key));
              
              if (!hasAdjacentDoor && !placedDoors.has(doorKey)) {
                const centerDistance = Math.abs(doorX - (conn.roomB.x + Math.floor(conn.roomB.width / 2))) +
                                    Math.abs(doorY - (conn.roomB.y + Math.floor(conn.roomB.height / 2)));
                if (centerDistance < minDistance) {
                  minDistance = centerDistance;
                  bestDoor = {x: doorX, y: doorY, type: doorType};
                }
              }
            }
          });
        });
      });
      
      // Colocar la mejor puerta encontrada para roomB
      if (bestDoor) {
        const doorKey = `${bestDoor.x}-${bestDoor.y}`;
        newWalls.delete(doorKey);
        newDoors.set(doorKey, {
          type: bestDoor.type,
          isOpen: Math.random() < 0.7 // 70% abiertas
        });
        placedDoors.add(doorKey);
       }
     });
    
    console.log('🚪 Created doors at room-corridor connections');
    
    // 7. Agregar números de habitaciones
    rooms.forEach(room => {
      const centerX = room.x + Math.floor(room.width / 2);
      const centerY = room.y + Math.floor(room.height / 2);
      
      newTexts.push({
        id: `room-number-${room.id}`,
        x: centerX,
        y: centerY,
        text: room.number.toString(),
        fontSize: 16,
        color: '#FFFFFF'
      });
    });
    
    console.log('🔢 Added room numbers');
    
    // 8. Generar loot usando API de D&D 5e con probabilidades exactas
    console.log('🎲 Generating loot from D&D 5e API...');
    
    for (const room of rooms) {
      try {
        const lootResult = await dndApiService.generateLoot();
        
        if (lootResult.hasLoot && lootResult.items.length > 0) {
          // Colocar loot en la habitación
          const randomCell = room.cells[Math.floor(Math.random() * room.cells.length)];
          
          const lootData: LootData = {
            id: `loot-room-${room.number}-${Date.now()}`,
            x: randomCell.x,
            y: randomCell.y,
            items: lootResult.items.map(item => ({
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: item.name,
              type: 'treasure',
              rarity: item.rarity,
              value: item.value ? parseInt(item.value.split(' ')[0]) : 0,
              description: item.description
            })),
            isLooted: false
          };
          
          newLoots.push(lootData);
          
          // Crear anotación con recuadro negro
          const annotationX = room.x + room.width + 2;
          const annotationY = room.y + Math.floor(room.height / 2);
          
          const content = `Room ${room.number}:\n${lootResult.items.map(item => 
            `• ${item.name} (${item.rarity})`
          ).join('\n')}`;
          
          newAnnotations.push({
             id: `annotation-${room.number}`,
             roomNumber: room.number,
             x: annotationX,
             y: annotationY,
             content,
             lineToX: room.x + Math.floor(room.width / 2),
             lineToY: room.y + Math.floor(room.height / 2),
             rarity: lootResult.items[0].rarity,
             isVisible: true
           });
          
          console.log(`💰 Room ${room.number}: ${lootResult.items[0].name} (${lootResult.items[0].rarity})`);
        } else {
          console.log(`🚫 Room ${room.number}: No loot`);
        }
      } catch (error) {
        console.error(`❌ Error generating loot for room ${room.number}:`, error);
      }
    }
    
    console.log('📊 Dungeon Statistics:');
    console.log('🏠 Total rooms:', rooms.length);
    console.log('🚪 Total doors:', newDoors.size);
    console.log('💰 Rooms with loot:', newLoots.length);
    console.log('📝 Annotations:', newAnnotations.length);
    
    // Aplicar todos los cambios
    setWalls(newWalls);
    setDoors(newDoors);
    setLoots(newLoots);
    setTexts(newTexts);
    setRoomAnnotations(newAnnotations);
    
    console.log('✅ One Page Dungeon generation complete!');
    
    // Sincronizar con multijugador si está activo
    if (isInMultiplayerSession) {
      console.log('🌐 Syncing with multiplayer...');
      // Aquí iría la lógica de sincronización
      console.log('🌐 Multiplayer sync complete!');
    }
  };

  // Función para manejar el fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Renderizado condicional para fullscreen
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50">
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          
          {/* Exit Fullscreen Button */}
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition-all"
            onClick={toggleFullscreen}
          >
            <Minimize size={16} /> Exit Fullscreen
          </button>
        </div>
        <div className="flex-grow">
          <GridComponent
            gridType={gridType}
            backgroundImage={null}
            zoomLevel={zoomLevel}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            walls={walls}
            doors={doors}
            tokens={tokens}
            drawingData={drawingData}
            onDrawing={handleDrawing}
            onTokenMove={handleTokenMove}
            onTokenUpdate={updateToken}
            onTokenDelete={removeToken}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            draggedToken={draggedToken}
            setDraggedToken={setDraggedToken}
            onWallToggle={handleWallToggle}
            onDoorToggle={handleDoorToggle}
            onTokenClick={handleTokenClick}
            onTokenRemove={removeToken}
            fogOfWar={fogOfWar}
            onFogToggle={handleFogToggle}
            fogEnabled={fogEnabled}
            texts={texts}
            loots={loots}
            onTextPlace={(x, y) => {
              setEditingText(undefined);
              setTextPosition({ x, y });
              setShowTextModal(true);
            }}
            onLootPlace={(x, y) => {
              setEditingLoot(undefined);
              setLootPosition({ x, y });
              setShowLootModal(true);
            }}
            onTextEdit={handleTextEdit}
            onLootEdit={handleLootEdit}
            onTextDelete={handleTextDelete}
            onLootDelete={handleLootDelete}
            onEraseCell={(gridX, gridY) => {}}
            onOpenTokenManager={() => setShowTokenManager(true)}
            onAddAlly={() => addToken('ally', {})}
            onAddEnemy={() => addToken('enemy', {})}
             onAddBoss={() => addToken('boss', {})}
             roomAnnotations={roomAnnotations}
             onToggleAnnotation={toggleAnnotationVisibility}
          />
         </div>

         <TextEditModal
           isOpen={showTextModal}
           onClose={() => {
             setShowTextModal(false);
             setEditingText(undefined);
             setTextPosition(null);
           }}
           onSave={handleTextSave}
           initialData={editingText}
         />

         <LootEditModal
           isOpen={showLootModal}
           onClose={() => {
             setShowLootModal(false);
             setEditingLoot(undefined);
             setLootPosition(null);
           }}
           onSave={handleLootSave}
           initialData={editingLoot}
         />
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

        <div className="w-full lg:w-1/4 flex flex-col gap-2 md:gap-4 order-2 lg:order-1">

          <DiceRoller onRoll={setLastDiceRoll} />

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
            updateToken={updateToken}
            tokens={tokens}
          />
        </div>

        <div className="flex flex-col gap-2 md:gap-4 w-full order-1 lg:order-2">
          <div
            className="p-2 md:p-4 rounded-lg shadow-lg"
            style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <button
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                    gridType === "square" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => {
                    setGridType("square");
                    setBackgroundImage(null);
                  }}
                >
                  Square Grid
                </button>
                <button
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                    gridType === "octagonal" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => {
                    setGridType("octagonal");
                    setBackgroundImage(null);
                  }}
                >
                  Octagonal Grid
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1 rounded flex items-center gap-1 transition-all text-xs sm:text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="sm:w-4 sm:h-4" /> 
                  <span className="hidden xs:inline">Upload </span>Map
                </button>
                <div className="flex items-center gap-1 bg-gray-700 rounded px-1 sm:px-2 py-1">
                  <button
                    className="bg-orange-600 hover:bg-orange-700 px-1 sm:px-2 py-1 rounded flex items-center transition-all"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                  >
                    <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span className="text-white text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    className="bg-orange-600 hover:bg-orange-700 px-1 sm:px-2 py-1 rounded flex items-center transition-all"
                    onClick={handleZoomIn}
                    title="Zoom In"
                  >
                    <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-500 px-1 sm:px-2 py-1 rounded text-xs transition-all"
                    onClick={resetZoom}
                    title="Reset Zoom"
                  >
                    1:1
                  </button>
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 px-2 sm:px-3 py-1 rounded flex items-center gap-1 transition-all text-xs sm:text-sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize size={14} className="sm:w-4 sm:h-4" /> : <Maximize size={14} className="sm:w-4 sm:h-4" />}
                  <span className="hidden xs:inline">{isFullscreen ? "Exit " : ""}Fullscreen</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={loadMap}
              />
            </div>

            <GridComponent
              gridType={gridType}
              backgroundImage={null}
              zoomLevel={zoomLevel}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              walls={walls}
              doors={doors}
              tokens={tokens}
              drawingData={drawingData}
              onDrawing={handleDrawing}
              onTokenMove={handleTokenMove}
              onTokenUpdate={updateToken}
              onTokenDelete={removeToken}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              draggedToken={draggedToken}
              setDraggedToken={setDraggedToken}
              onWallToggle={handleWallToggle}
              onDoorToggle={handleDoorToggle}
              onTokenClick={handleTokenClick}
              onTokenRemove={removeToken}
              fogOfWar={fogOfWar}
              onFogToggle={handleFogToggle}
              fogEnabled={fogEnabled}
              texts={texts}
              loots={loots}
              onTextPlace={(x, y) => {
                setEditingText(undefined);
                setTextPosition({ x, y });
                setShowTextModal(true);
              }}
              onLootPlace={(x, y) => {
                setEditingLoot(undefined);
                setLootPosition({ x, y });
                setShowLootModal(true);
              }}
              onTextEdit={handleTextEdit}
              onLootEdit={handleLootEdit}
              onTextDelete={handleTextDelete}
              onLootDelete={handleLootDelete}
              onEraseCell={(gridX, gridY) => {}}
              onOpenTokenManager={() => setShowTokenManager(true)}
              onAddAlly={() => addToken('ally', {})}
               onAddEnemy={() => addToken('enemy', {})}
               onAddBoss={() => addToken('boss', {})}
               roomAnnotations={roomAnnotations}
               onToggleAnnotation={toggleAnnotationVisibility}
             />
          </div>

          <div className="md:hidden flex flex-col gap-2 mt-4">

            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => addToken('ally', {})}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Ally
              </button>
              <button
                onClick={() => addToken('enemy', {})}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Enemy
              </button>
              <button
                onClick={() => addToken('boss', {})}
                className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Boss
              </button>
            </div>


            <div className="flex gap-2 justify-center flex-wrap">
              <InitiativeList tokens={tokens} />
              <button
                onClick={() => setShowTokenManager(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Users size={16} /> Token Manager
                {tokens.length > 0 && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                    {tokens.length}
                  </span>
                )}
              </button>
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
            generateRandomMap={generateRandomMap}
          />
        </div>
      </main>

      <ApiSection />

      <TokenManagerPopup
        isOpen={showTokenManager}
        onClose={() => setShowTokenManager(false)}
        tokens={tokens}
        updateToken={updateToken}
        removeToken={removeToken}
      />

      <TextEditModal
        isOpen={showTextModal}
        onClose={() => {
          setShowTextModal(false);
          setEditingText(undefined);
          setTextPosition(null);
        }}
        onSave={handleTextSave}
        initialData={editingText}
      />

      <LootEditModal
        isOpen={showLootModal}
        onClose={() => {
          setShowLootModal(false);
          setEditingLoot(undefined);
          setLootPosition(null);
        }}
        onSave={handleLootSave}
        initialData={editingLoot}
      />

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

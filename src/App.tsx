import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import GridComponent from "./components/GridComponent";
import TokenPanel from "./components/TokenPanel";
import DrawingTools from "./components/DrawingTools";
import ApiSection from "./components/ApiSection";
import InitiativeList from "./components/InitiativeList"; // Importar el nuevo componente
import DiceRoller from "./components/DiceRoller"; // Importar el nuevo componente
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
    "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v"
  >("move");
  const [selectedColor, setSelectedColor] = useState<string>("#ff0000");
  const [drawingData, setDrawingData] = useState<
    Array<{ type: string; points: number[]; color: string }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedToken, setDraggedToken] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fogOfWar, setFogOfWar] = useState<Set<string>>(new Set());
  const [fogEnabled, setFogEnabled] = useState(false);
  const [doors, setDoors] = useState<Map<string, { type: 'horizontal' | 'vertical'; isOpen: boolean }>>(new Map());
  const [walls, setWalls] = useState<Map<string, { type: 'horizontal' | 'vertical' }>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Función para revelar áreas alrededor de tokens aliados
  const revealAroundAllies = () => {
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
    
    setFogOfWar(revealedCells);
  };

  // Efecto para revelar áreas alrededor de aliados cuando se muevan o se active la niebla
  useEffect(() => {
    revealAroundAllies();
  }, [tokens, fogEnabled]);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearDrawing = () => {
    setDrawingData([]);
  };

  const addToken = (type: "ally" | "enemy" | "boss", tokenData: any) => {
    const newToken = {
      id: `token-${Date.now()}`,
      type,
      x: Math.floor(Math.random() * 40),
      y: Math.floor(Math.random() * 40),
      color:
        type === "ally" ? "#3498db" : type === "enemy" ? "#e74c3c" : "#f1c40f",
      name: tokenData.name || "",
      initiative: tokenData.initiative || undefined,
      maxHp: tokenData.maxHp || undefined,
      currentHp: tokenData.currentHp || tokenData.maxHp || undefined,
    };
    setTokens([...tokens, newToken]);
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
  };

  const removeToken = (id: string) => {
    setTokens(tokens.filter((token) => token.id !== id));
  };

  const resetGrid = () => {
    setTokens([]);
    setDrawingData([]);
    setBackgroundImage(null);
  };

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
  };

  const updateToken = (id: string, newData: any) => {
    setTokens(
      tokens.map((token) =>
        token.id === id ? { ...token, ...newData } : token
      )
    );
  };

  const handleFogToggle = (x: number, y: number) => {
    // La niebla ahora se maneja automáticamente por los tokens aliados
    // Esta función ya no es necesaria para el comportamiento manual
    revealAroundAllies();
  };

  const toggleFogOfWar = () => {
    setFogEnabled(!fogEnabled);
  };

  const clearFogOfWar = () => {
    setFogOfWar(new Set());
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
  };

  const clearDoors = () => {
    setDoors(new Map());
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
  };

  const clearWalls = () => {
    setWalls(new Map());
  };

  // Render en modo pantalla completa
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50">
        <div className="absolute top-4 right-4 z-10">
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 transition-all"
            onClick={exitFullscreen}
          >
            <Minimize size={16} /> Exit Fullscreen
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="relative border-2 border-gray-600 rounded overflow-auto max-h-full max-w-full">
            <GridComponent
              gridType={gridType}
              backgroundImage={backgroundImage}
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
              />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header
        className="p-4 shadow-lg"
        style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
      >
        <h1 className="text-2xl font-bold text-center">D&D Combat Grid</h1>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        {/* Columna izquierda: Lista de iniciativa y dados */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <InitiativeList tokens={tokens} />{" "}
          {/* Mostrar la lista de iniciativa */}
          <DiceRoller /> {/* Mostrar el lanzador de dados */}
          <TokenPanel
            addToken={addToken}
            removeToken={removeToken}
            resetGrid={resetGrid}
            saveGame={saveGame}
            loadGame={loadGame}
            updateToken={updateToken} // Nueva función para actualizar los datos del token
            tokens={tokens}
          />
        </div>

        {/* Columna central: Grilla y herramientas de dibujo */}
        <div className="flex flex-col gap-4 w-full">
          <div
            className="p-4 rounded-lg shadow-lg"
            style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${
                    gridType === "square" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => setGridType("square")}
                >
                  Square Grid
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    gridType === "octagonal" ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => setGridType("octagonal")}
                >
                  Octagonal Grid
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center gap-1 transition-all"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} /> Upload Map
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                />
              </div>
            </div>

            <div className="relative border-2 border-gray-600 rounded overflow-hidden">
              <GridComponent
                gridType={gridType}
                backgroundImage={backgroundImage}
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
              />
            </div>
          </div>

          <DrawingTools
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            clearDrawing={clearDrawing}
            fogEnabled={fogEnabled}
            toggleFogOfWar={toggleFogOfWar}
            clearFogOfWar={clearFogOfWar}
            clearDoors={clearDoors}
            clearWalls={clearWalls}
          />
        </div>
      </main>

      <ApiSection />

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

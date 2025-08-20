import React, { useRef, useEffect, useState } from "react";
import TokenTooltip from "./TokenTooltip"; // Asegúrate de importar el componente TokenTooltip

interface GridComponentProps {
  gridType: "square" | "octagonal";
  backgroundImage: string | null;
  tokens: Array<{
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
  }>;
  drawingData: Array<{ type: string; points: number[]; color: string }>;
  selectedTool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v";
  selectedColor: string;
  onDrawing: (drawingData: {
    type: string;
    points: number[];
    color: string;
  }) => void;
  onTokenMove: (id: string, x: number, y: number) => void;
  onTokenUpdate?: (id: string, data: any) => void;
  onTokenDelete?: (id: string) => void;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  draggedToken: string | null;
  setDraggedToken: React.Dispatch<React.SetStateAction<string | null>>;
  fogOfWar: Set<string>;
  onFogToggle: (x: number, y: number) => void;
  fogEnabled: boolean;
  doors: Map<string, { type: 'horizontal' | 'vertical'; isOpen: boolean }>;
  onDoorToggle: (x: number, y: number, type: 'horizontal' | 'vertical') => void;
  walls: Map<string, { type: 'horizontal' | 'vertical' }>;
  onWallToggle: (x: number, y: number, type: 'horizontal' | 'vertical') => void;
}

const getContrastColor = (hexcolor: string): string => {
  // Convertir el color hex a RGB
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);

  // Calcular el brillo usando la fórmula YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Retornar blanco o negro según el contraste
  return yiq >= 128 ? "#000000" : "#FFFFFF";
};

const GridComponent: React.FC<GridComponentProps> = ({
  gridType,
  backgroundImage,
  tokens,
  drawingData,
  selectedTool,
  selectedColor,
  onDrawing,
  onTokenMove,
  onTokenUpdate,
  onTokenDelete,
  isDragging,
  setIsDragging,
  draggedToken,
  setDraggedToken,
  fogOfWar,
  onFogToggle,
  fogEnabled,
  doors,
  onDoorToggle,
  walls,
  onWallToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [squareStart, setSquareStart] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const GRID_SIZE = 40;
  const CELL_SIZE = 30;
  const GRID_WIDTH = GRID_SIZE * CELL_SIZE;
  const GRID_HEIGHT = GRID_SIZE * CELL_SIZE;

  // Draw the canvas elements (lines, shapes, etc.)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved paths
    drawingData.forEach((item) => {
      if (item.type === "line") {
        drawLine(ctx, item.points, item.color);
      } else if (item.type === "square") {
        drawSquare(ctx, item.points, item.color);
      } else if (item.type === "fill") {
        const x = item.points[0];
        const y = item.points[1];
        fillCell(ctx, x, y, item.color);
      }
    });

    // Draw current path if drawing
    if (isDrawing && currentPath.length >= 2) {
      if (selectedTool === "draw") {
        drawLine(ctx, currentPath, selectedColor);
      } else if (selectedTool === "square" && squareStart) {
        const lastX = currentPath[currentPath.length - 2];
        const lastY = currentPath[currentPath.length - 1];
        const points = [squareStart.x, squareStart.y, lastX, lastY];
        drawSquare(ctx, points, selectedColor);
      }
    }
  }, [
    drawingData,
    isDrawing,
    currentPath,
    selectedTool,
    selectedColor,
    squareStart,
  ]);

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    points: number[],
    color: string
  ) => {
    if (points.length < 4) return;

    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);

    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const [hoveredToken, setHoveredToken] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    tokenId: string;
  } | null>(null);
  const [editingToken, setEditingToken] = useState<{
    id: string;
    field: 'name' | 'ac' | 'currentHp' | 'initiative';
    value: string;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para mostrar menú contextual
  const showContextMenu = (e: React.MouseEvent, tokenId: string) => {
    console.log('showContextMenu called for token:', tokenId);
    e.preventDefault();
    e.stopPropagation();
    const rect = gridRef.current?.getBoundingClientRect();
    if (rect) {
      const menuData = {
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        tokenId
      };
      console.log('Setting context menu:', menuData);
      setContextMenu(menuData);
    }
  };

  // Función para ocultar menú contextual
  const hideContextMenu = () => {
    setContextMenu(null);
    setEditingToken(null);
  };

  // Función para iniciar edición
  const startEditing = (tokenId: string, field: 'name' | 'ac' | 'currentHp' | 'initiative') => {
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      let value = '';
      switch (field) {
        case 'name':
          value = token.name || '';
          break;
        case 'ac':
          value = token.ac?.toString() || '';
          break;
        case 'currentHp':
          value = token.currentHp?.toString() || '';
          break;
        case 'initiative':
          value = token.initiative?.toString() || '';
          break;
      }
      setEditingToken({ id: tokenId, field, value });
      setContextMenu(null);
    }
  };

  // Función para guardar edición
  const saveEdit = () => {
    if (editingToken && onTokenUpdate) {
      const updateData: any = {};
      switch (editingToken.field) {
        case 'name':
          updateData.name = editingToken.value || undefined;
          break;
        case 'ac':
          updateData.ac = editingToken.value ? Number(editingToken.value) : undefined;
          break;
        case 'currentHp':
          updateData.currentHp = editingToken.value ? Number(editingToken.value) : undefined;
          break;
        case 'initiative':
          updateData.initiative = editingToken.value ? Number(editingToken.value) : undefined;
          break;
      }
      onTokenUpdate(editingToken.id, updateData);
      setEditingToken(null);
    }
  };

  // Función para eliminar token
  const deleteToken = (tokenId: string) => {
    if (onTokenDelete) {
      onTokenDelete(tokenId);
    }
    setContextMenu(null);
  };

  // Efecto para cerrar menú contextual al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && contextMenu.show) {
        hideContextMenu();
      }
    };

    if (contextMenu && contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const handleMouseEnterToken = (tokenId: string, x: number, y: number) => {
    // Limpiar el timeout anterior si existe
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Establecer un nuevo timeout para mostrar el tooltip después de 0.3 segundos
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredToken({ id: tokenId, x, y });
      setShowTooltip(true);
    }, 300); // 0.3 segundos de retraso
  };

  const handleMouseLeaveToken = () => {
    // Limpiar el timeout si el mouse sale del token antes de que se muestre el tooltip
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Esperar un pequeño retraso antes de ocultar el tooltip
    setTimeout(() => {
      setHoveredToken(null);
      setShowTooltip(false);
    }, 100); // 0.1 segundos de retraso para ocultar el tooltip
  };

  const drawSquare = (
    ctx: CanvasRenderingContext2D,
    points: number[],
    color: string
  ) => {
    if (points.length < 4) return;

    const startX = points[0];
    const startY = points[1];
    const endX = points[2];
    const endY = points[3];

    ctx.beginPath();
    ctx.rect(startX, startY, endX - startX, endY - startY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const fillCell = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) => {
    const cellX = Math.floor(x / CELL_SIZE) * CELL_SIZE;
    const cellY = Math.floor(y / CELL_SIZE) * CELL_SIZE;

    ctx.fillStyle = color;
    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === "move") {
      // Check if clicking on a token
      const clickedToken = tokens.find((token) => {
        const tokenX = token.x * CELL_SIZE + CELL_SIZE / 2;
        const tokenY = token.y * CELL_SIZE + CELL_SIZE / 2;
        const distance = Math.sqrt(
          Math.pow(tokenX - x, 2) + Math.pow(tokenY - y, 2)
        );
        return distance < CELL_SIZE / 2;
      });

      if (clickedToken) {
        setIsDragging(true);
        setDraggedToken(clickedToken.id);
      }
    } else if (selectedTool === "wall-h" || selectedTool === "wall-v") {
      // Handle wall placement
      const gridX = Math.floor(x / CELL_SIZE);
      const gridY = Math.floor(y / CELL_SIZE);
      
      // Ensure wall stays within grid bounds
      const boundedX = Math.max(0, Math.min(gridX, GRID_SIZE - 1));
      const boundedY = Math.max(0, Math.min(gridY, GRID_SIZE - 1));
      
      const wallType = selectedTool === "wall-h" ? "horizontal" : "vertical";
      onWallToggle(boundedX, boundedY, wallType);
    } else if (selectedTool === "door-h" || selectedTool === "door-v") {
      // Handle door placement
      const gridX = Math.floor(x / CELL_SIZE);
      const gridY = Math.floor(y / CELL_SIZE);
      
      // Ensure door stays within grid bounds
      const boundedX = Math.max(0, Math.min(gridX, GRID_SIZE - 1));
      const boundedY = Math.max(0, Math.min(gridY, GRID_SIZE - 1));
      
      const doorType = selectedTool === "door-h" ? "horizontal" : "vertical";
      onDoorToggle(boundedX, boundedY, doorType);
    } else {
      setIsDrawing(true);

      if (selectedTool === "square") {
        setSquareStart({ x, y });
      }

      setCurrentPath([x, y]);

      if (selectedTool === "fill") {
        onDrawing({
          type: "fill",
          points: [x, y],
          color: selectedColor,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedToken) {
      // Move token
      const gridX = Math.floor(x / CELL_SIZE);
      const gridY = Math.floor(y / CELL_SIZE);

      // Ensure token stays within grid bounds
      const boundedX = Math.max(0, Math.min(gridX, GRID_SIZE - 1));
      const boundedY = Math.max(0, Math.min(gridY, GRID_SIZE - 1));

      onTokenMove(draggedToken, boundedX, boundedY);
    } else if (isDrawing) {
      // Drawing
      if (
        selectedTool === "draw" ||
        selectedTool === "erase" ||
        selectedTool === "square"
      ) {
        setCurrentPath([...currentPath, x, y]);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedToken(null);
    }

    if (isDrawing) {
      setIsDrawing(false);

      if (selectedTool === "draw" && currentPath.length >= 4) {
        onDrawing({
          type: "line",
          points: currentPath,
          color: selectedTool === "erase" ? "rgba(0,0,0,0)" : selectedColor,
        });
      } else if (
        selectedTool === "square" &&
        squareStart &&
        currentPath.length >= 2
      ) {
        const lastX = currentPath[currentPath.length - 2];
        const lastY = currentPath[currentPath.length - 1];

        onDrawing({
          type: "square",
          points: [squareStart.x, squareStart.y, lastX, lastY],
          color: selectedColor,
        });

        setSquareStart(null);
      }

      setCurrentPath([]);
    }
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    setCurrentPath([]);
    setSquareStart(null);
  };

  // Render grid cells
  const renderGrid = () => {
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cellKey = `${x}-${y}`;
        const isRevealed = fogEnabled && fogOfWar.has(cellKey);
        const isFogged = fogEnabled && !isRevealed;
        
        let backgroundColor = "transparent";
        if (isFogged) {
          backgroundColor = "rgba(0, 0, 0, 0.95)"; // Niebla mucho más oscura
        }
        
        const cellStyle: React.CSSProperties = {
          width: `${CELL_SIZE}px`,
          height: `${CELL_SIZE}px`,
          position: "absolute",
          left: `${x * CELL_SIZE}px`,
          top: `${y * CELL_SIZE}px`,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          pointerEvents: "none",
          backgroundColor,
          cursor: "default",
          zIndex: isFogged ? 5 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          color: "white",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
        };

        if (gridType === "octagonal") {
          cellStyle.clipPath =
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
        }

        cells.push(
          <div 
            key={`cell-${x}-${y}`} 
            className="grid-cell" 
            style={cellStyle}
          >
          </div>
        );
      }
    }

    return cells;
  };

  // Render walls
  const renderWalls = () => {
    console.log('🧱 DEBUG: Rendering walls, count:', walls.size);
    const wallElements = [];
    
    walls.forEach((wall, key) => {
      console.log('🧱 DEBUG: Rendering wall at', key, wall);
      const [x, y] = key.split('-').map(Number);
      
      if (wall.type === 'horizontal') {
        // Pared horizontal en el borde superior de la celda
        const wallStyle: React.CSSProperties = {
          width: `${CELL_SIZE}px`,
          height: '8px',
          backgroundColor: '#8B4513',
          position: 'absolute',
          left: `${x * CELL_SIZE}px`,
          top: `${y * CELL_SIZE - 4}px`,
          zIndex: 15,
          pointerEvents: 'auto',
          cursor: 'pointer',
          border: '2px solid #654321',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        };
        
        wallElements.push(
          <div
            key={`wall-h-${key}`}
            style={wallStyle}
            onClick={() => onWallToggle(x, y, 'horizontal')}
            title="Horizontal Wall (click to remove)"
          />
        );
      } else if (wall.type === 'vertical') {
        // Pared vertical en el borde izquierdo de la celda
        const wallStyle: React.CSSProperties = {
          width: '8px',
          height: `${CELL_SIZE}px`,
          backgroundColor: '#8B4513',
          position: 'absolute',
          left: `${x * CELL_SIZE - 4}px`,
          top: `${y * CELL_SIZE}px`,
          zIndex: 15,
          pointerEvents: 'auto',
          cursor: 'pointer',
          border: '2px solid #654321',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        };
        
        wallElements.push(
          <div
            key={`wall-v-${key}`}
            style={wallStyle}
            onClick={() => onWallToggle(x, y, 'vertical')}
            title="Vertical Wall (click to remove)"
          />
        );
      }
    });
    
    return wallElements;
  };

  // Render doors
  const renderDoors = () => {
    console.log('🚪 DEBUG: Rendering doors, count:', doors.size);
    const doorElements = [];
    
    doors.forEach((door, key) => {
      console.log('🚪 DEBUG: Rendering door at', key, door);
      const [x, y] = key.split('-').map(Number);
      
      if (door.type === 'horizontal') {
        // Puerta horizontal en el borde superior de la celda
        const doorStyle: React.CSSProperties = {
          width: `${CELL_SIZE}px`,
          height: '10px',
          backgroundColor: door.isOpen ? '#4CAF50' : '#D2691E',
          position: 'absolute',
          left: `${x * CELL_SIZE}px`,
          top: `${y * CELL_SIZE - 5}px`,
          zIndex: 20,
          pointerEvents: 'auto',
          cursor: 'pointer',
          border: '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
        };
        
        doorElements.push(
          <div
            key={`door-h-${key}`}
            style={doorStyle}
            onClick={() => onDoorToggle(x, y, 'horizontal')}
            title={`Horizontal Door (${door.isOpen ? 'Open' : 'Closed'} - click to toggle)`}
          >
            {door.isOpen ? '⬜' : '🚪'}
          </div>
        );
      } else if (door.type === 'vertical') {
        // Puerta vertical en el borde izquierdo de la celda
        const doorStyle: React.CSSProperties = {
          width: '10px',
          height: `${CELL_SIZE}px`,
          backgroundColor: door.isOpen ? '#4CAF50' : '#D2691E',
          position: 'absolute',
          left: `${x * CELL_SIZE - 5}px`,
          top: `${y * CELL_SIZE}px`,
          zIndex: 20,
          pointerEvents: 'auto',
          cursor: 'pointer',
          border: '2px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white',
          writingMode: 'vertical-rl',
          boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
        };
        
        doorElements.push(
          <div
            key={`door-v-${key}`}
            style={doorStyle}
            onClick={() => onDoorToggle(x, y, 'vertical')}
            title={`Vertical Door (${door.isOpen ? 'Open' : 'Closed'} - click to toggle)`}
          >
            {door.isOpen ? '⬜' : '🚪'}
          </div>
        );
      }
    });
    
    return doorElements;
  };

  // Render tokens
  const renderTokens = () => {
    return tokens.map((token) => {
      // Verificar si el token está en un área revelada cuando hay niebla de guerra
      const tokenKey = `${token.x}-${token.y}`;
      const isRevealed = fogEnabled ? fogOfWar.has(tokenKey) : true;
      
      // Ocultar tokens enemigos y jefes si están en niebla de guerra
      if (fogEnabled && !isRevealed && (token.type === "enemy" || token.type === "boss")) {
        return null;
      }
      
      const isBoss = token.type === "boss";
      const tokenSize = isBoss ? CELL_SIZE * 2 : CELL_SIZE;
      const tokenColor =
        token.color ||
        (token.type === "ally"
          ? "#3498db"
          : token.type === "enemy"
          ? "#e74c3c"
          : "#f1c40f");
      const contrastColor = getContrastColor(tokenColor);

      const tokenStyle: React.CSSProperties = {
        width: `${tokenSize}px`,
        height: `${tokenSize}px`,
        borderRadius: isBoss ? "10%" : "50%",
        backgroundColor: tokenColor,
        position: "absolute",
        left: `${token.x * CELL_SIZE}px`,
        top: `${token.y * CELL_SIZE}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: contrastColor,
        fontWeight: "bold",
        fontSize: "12px",
        border: `2px solid ${contrastColor}`,
        boxShadow: `0 0 10px rgba(0, 0, 0, 0.3)`,
        zIndex: 10,
        cursor: selectedTool === "move" ? "grab" : "default",
        pointerEvents: selectedTool === "move" ? "auto" : "none",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
      };

      if (isDragging && token.id === draggedToken) {
        tokenStyle.cursor = "grabbing";
        tokenStyle.transform = "scale(1.1)";
        tokenStyle.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
      }

      return (
        <div
          key={token.id}
          className="token"
          data-type={token.type}
          style={{
            ...tokenStyle,
            pointerEvents: "auto", // Siempre permitir eventos para menú contextual
          }}
          onMouseEnter={() =>
            handleMouseEnterToken(
              token.id,
              token.x * CELL_SIZE,
              token.y * CELL_SIZE
            )
          }
          onMouseLeave={handleMouseLeaveToken}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showContextMenu(e, token.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // Evitar que el grid maneje este evento
            if (e.button === 0) { // Click izquierdo
              longPressTimeoutRef.current = setTimeout(() => {
                showContextMenu(e, token.id);
              }, 500); // 500ms para long press
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (longPressTimeoutRef.current) {
              clearTimeout(longPressTimeoutRef.current);
              longPressTimeoutRef.current = null;
            }
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            longPressTimeoutRef.current = setTimeout(() => {
              const touch = e.touches[0];
              const fakeEvent = {
                preventDefault: () => {},
                stopPropagation: () => {},
                clientX: touch.clientX,
                clientY: touch.clientY
              } as React.MouseEvent;
              showContextMenu(fakeEvent, token.id);
            }, 500);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            if (longPressTimeoutRef.current) {
              clearTimeout(longPressTimeoutRef.current);
              longPressTimeoutRef.current = null;
            }
          }}
        >
          {editingToken && editingToken.id === token.id ? (
            <input
              type={editingToken.field === 'name' ? 'text' : 'number'}
              value={editingToken.value}
              onChange={(e) => setEditingToken({...editingToken, value: e.target.value})}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') setEditingToken(null);
              }}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                fontSize: '10px',
                borderRadius: isBoss ? '10%' : '50%'
              }}
              autoFocus
            />
          ) : (
            token.name
              ? token.name.charAt(0).toUpperCase()
              : token.type === "ally"
              ? "A"
              : token.type === "enemy"
              ? "E"
              : "B"
          )}
        </div>
      );
    });
  };

  return (
    <div
      ref={gridRef}
      style={{
        width: `${GRID_WIDTH}px`,
        height: `${GRID_HEIGHT}px`,
        position: "relative",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: "0 auto",
        cursor: selectedTool === "move" ? "default" : "crosshair",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background layer */}
      {!backgroundImage && (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#2d3748",
            position: "absolute",
          }}
        />
      )}

      {/* Grid layer */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 1,
        }}
      >
        {renderGrid()}
      </div>

      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        width={GRID_WIDTH}
        height={GRID_HEIGHT}
        style={{
          position: "absolute",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Walls layer */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 6,
        }}
      >
        {renderWalls()}
      </div>

      {/* Doors layer */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 7,
        }}
      >
        {renderDoors()}
      </div>

      {/* Tokens layer */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 3,
        }}
      >
        {renderTokens()}
      </div>

      {/* Tooltip */}
      {showTooltip && hoveredToken && (
        <div
          style={{
            position: "absolute",
            left: `${hoveredToken.x + 20}px`, // Ajustar la posición del tooltip
            top: `${hoveredToken.y + 20}px`,
            zIndex: 20,
            pointerEvents: "none", // Evitar que el tooltip interfiera con los eventos del mouse
          }}
        >
          <TokenTooltip
            token={tokens.find((token) => token.id === hoveredToken.id)!}
          />
        </div>
      )}

      {/* Menú Contextual */}
      {contextMenu && contextMenu.show && (
        <div
          style={{
            position: "absolute",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 30,
            backgroundColor: "#2d3748",
            border: "1px solid #4a5568",
            borderRadius: "8px",
            padding: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            minWidth: "150px"
          }}
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => startEditing(contextMenu.tokenId, 'name')}
              className="text-left px-3 py-2 text-sm text-white hover:bg-gray-600 rounded transition-colors"
            >
              📝 Editar Nombre
            </button>
            <button
              onClick={() => startEditing(contextMenu.tokenId, 'ac')}
              className="text-left px-3 py-2 text-sm text-white hover:bg-gray-600 rounded transition-colors"
            >
              🛡️ Editar AC
            </button>
            <button
              onClick={() => startEditing(contextMenu.tokenId, 'currentHp')}
              className="text-left px-3 py-2 text-sm text-white hover:bg-gray-600 rounded transition-colors"
            >
              ❤️ Editar Vida
            </button>
            <button
              onClick={() => startEditing(contextMenu.tokenId, 'initiative')}
              className="text-left px-3 py-2 text-sm text-white hover:bg-gray-600 rounded transition-colors"
            >
              ⚡ Editar Iniciativa
            </button>
            <hr className="border-gray-600 my-1" />
            <button
              onClick={() => deleteToken(contextMenu.tokenId)}
              className="text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors"
            >
              🗑️ Eliminar Token
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar menú contextual */}
      {contextMenu && contextMenu.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 25
          }}
          onClick={hideContextMenu}
        />
      )}
    </div>
  );
};

export default GridComponent;

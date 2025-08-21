import React from "react";
import { Pencil, PaintBucket, Square, Move, Trash2, Eye, EyeOff, DoorOpen, Minus, RotateCcw, Type, Coins, Eraser, Shuffle } from "lucide-react";

interface DrawingToolsProps {
  selectedTool: "move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot";
  setSelectedTool: React.Dispatch<
    React.SetStateAction<"move" | "draw" | "erase" | "fill" | "square" | "fog" | "door-h" | "door-v" | "wall-h" | "wall-v" | "text" | "loot">
  >;
  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  fogEnabled: boolean;
  toggleFogOfWar: () => void;
  clearAll: () => void;
  generateRandomMap: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  selectedTool,
  setSelectedTool,
  selectedColor,
  setSelectedColor,
  fogEnabled,
  toggleFogOfWar,
  clearAll,
  generateRandomMap,
}) => {
  const colors = [
    "#e74c3c", // Red
    "#e67e22", // Orange
    "#f1c40f", // Yellow
    "#2ecc71", // Green
    "#3498db", // Blue
    "#9b59b6", // Purple
    "#1abc9c", // Teal
    "#ecf0f1", // White
    "#95a5a6", // Gray
    "#000000", // Black
  ];

  return (
    <div
      className="p-4 rounded-lg shadow-lg initiative-list"
      style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
    >
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4">
        Drawing Tools
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`tool-button ${selectedTool === "move" ? "active" : ""}`}
          onClick={() => setSelectedTool("move")}
          title="Move Tokens"
        >
          <Move size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "draw" ? "active" : ""}`}
          onClick={() => setSelectedTool("draw")}
          title="Draw Lines"
        >
          <Pencil size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "erase" ? "active" : ""}`}
          onClick={() => setSelectedTool("erase")}
          title="Eraser - Click to erase content from grid cells"
        >
          <Eraser size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "fill" ? "active" : ""}`}
          onClick={() => setSelectedTool("fill")}
          title="Fill"
        >
          <PaintBucket size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "square" ? "active" : ""}`}
          onClick={() => setSelectedTool("square")}
          title="Draw Square"
        >
          <Square size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "fog" ? "active" : ""}`}
          onClick={() => setSelectedTool("fog")}
          title="Fog of War (Auto-reveals around allies)"
        >
          <Eye size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "door-h" ? "active" : ""}`}
          onClick={() => setSelectedTool("door-h")}
          title="Horizontal Door"
        >
          <DoorOpen size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "door-v" ? "active" : ""}`}
          onClick={() => setSelectedTool("door-v")}
          title="Vertical Door"
        >
          <DoorOpen size={20} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <button
          className={`tool-button ${selectedTool === "wall-h" ? "active" : ""}`}
          onClick={() => setSelectedTool("wall-h")}
          title="Horizontal Wall"
        >
          <Minus size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "wall-v" ? "active" : ""}`}
          onClick={() => setSelectedTool("wall-v")}
          title="Vertical Wall"
        >
          <RotateCcw size={20} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <button
          className={`tool-button ${selectedTool === "text" ? "active" : ""}`}
          onClick={() => setSelectedTool("text")}
          title="Add Text/Signs"
        >
          <Type size={20} />
        </button>
        <button
          className={`tool-button ${selectedTool === "loot" ? "active" : ""}`}
          onClick={() => setSelectedTool("loot")}
          title="Add Loot Chest"
        >
          <Coins size={20} />
        </button>
        <button
          className="tool-button bg-red-600 hover:bg-red-700 border-red-500"
          onClick={clearAll}
          title="Clear Everything (Drawings, Texts, Loot, Doors, Walls, Fog)"
        >
          <Trash2 size={20} />
        </button>
        <button
          className="tool-button bg-purple-600 hover:bg-purple-700 border-purple-500"
          onClick={generateRandomMap}
          title="Generate Random Dungeon (Walls, Doors, Loot)"
        >
          <Shuffle size={20} />
        </button>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div
              key={color}
              className={`color-option ${
                selectedColor === color ? "selected" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Fog of War</h3>
        <div className="flex flex-col gap-2">
          <button
            className={`tool-button flex items-center justify-center gap-2 ${
              fogEnabled ? "bg-green-600" : "bg-gray-600"
            }`}
            onClick={toggleFogOfWar}
            title={fogEnabled ? "Disable Fog of War" : "Enable Fog of War"}
          >
            {fogEnabled ? <EyeOff size={16} /> : <Eye size={16} />}
            {fogEnabled ? "Disable Fog" : "Enable Fog"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          When enabled, covers entire grid. Only ally tokens reveal 2-cell radius when moved.
        </p>
      </div>
      </div>
    );
};

export default DrawingTools;

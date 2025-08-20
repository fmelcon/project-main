import React, { useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Upload,
  Edit,
  Palette,
  Users,
  ExternalLink,
  Map,
  FolderOpen,
} from "lucide-react";
import TokenEditModal from "./TokenEditModal";
import TokenManagerPopup from "./TokenManagerPopup";

// Helper function to get contrast color for text
const getContrastColor = (hexcolor: string): string => {
  // Remove # if present
  const color = hexcolor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return black or white based on brightness
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

interface TokenPanelProps {
  addToken: (type: "ally" | "enemy" | "boss", tokenData: unknown) => void;
  removeToken: (id: string) => void;
  resetGrid: () => void;
  saveGame: () => void;
  loadGame: () => void;
  saveMap: () => void;
  loadMap: () => void;
  updateToken: (id: string, newData: unknown) => void; // Nueva función para actualizar los datos del token
  tokens: Array<{
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
  }>;
}

const TokenPanel: React.FC<TokenPanelProps> = ({
  addToken,
  removeToken,
  resetGrid,
  saveGame,
  loadGame,
  saveMap,
  loadMap,
  updateToken,
  tokens,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<any>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isTokenManagerOpen, setIsTokenManagerOpen] = useState(false);

  const handleEditToken = (token: any) => {
    setEditingToken(token);
    setIsModalOpen(true);
  };

  const handleSaveToken = (tokenData: any) => {
    if (editingToken) {
      updateToken(editingToken.id, tokenData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingToken(null);
  };

  const handleColorChange = (tokenId: string, color: string) => {
    updateToken(tokenId, { color });
    setShowColorPicker(null);
  };

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
      className="w-full p-4 rounded-lg shadow-lg flex flex-col gap-4 initiative-list"
      style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
    >
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2">
        Token Management
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded flex items-center justify-center gap-1"
          onClick={() => addToken("ally", {})}
        >
          <Plus size={16} /> Add Ally
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 p-2 rounded flex items-center justify-center gap-1"
          onClick={() => addToken("enemy", {})}
        >
          <Plus size={16} /> Add Enemy
        </button>
        <button
          className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded flex items-center justify-center gap-1 col-span-2"
          onClick={() => addToken("boss", {})}
        >
          <Plus size={16} /> Add Large Boss
        </button>
        <p className="warning-message col-span-2">
          Remember to take the boss token from the top-left side to move it.
        </p>
      </div>

      {/* Token Management Button */}
      <div className="mt-4">
        <button
          onClick={() => setIsTokenManagerOpen(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
        >
          <Users size={18} />
          <span className="font-semibold">Token Manager</span>
          <ExternalLink size={16} />
          {tokens.length > 0 && (
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
              {tokens.length}
            </span>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Manage all tokens in a floating window
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button
          className="bg-purple-600 hover:bg-purple-700 p-2 rounded flex items-center justify-center gap-1"
          onClick={saveGame}
        >
          <Save size={16} /> Save Game
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 p-2 rounded flex items-center justify-center gap-1"
          onClick={loadGame}
        >
          <Upload size={16} /> Load Game
        </button>
        
        {/* Separador */}
        <div className="border-t border-gray-600 my-2"></div>
        
        {/* Botones de Mapa */}
        <button
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded flex items-center justify-center gap-1"
          onClick={saveMap}
        >
          <Map size={16} /> Save Map
        </button>
        <button
          className="bg-cyan-600 hover:bg-cyan-700 p-2 rounded flex items-center justify-center gap-1"
          onClick={loadMap}
        >
          <FolderOpen size={16} /> Load Map
        </button>
        <button
          className="p-2 rounded flex items-center justify-center gap-1 initiative-list"
          style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
          onClick={resetGrid}
        >
          <RefreshCw size={16} /> Reset Grid
        </button>

        {/* Botón de Cafecito */}
        <div className="p-2 rounded flex items-center justify-center gap-1">
          <a href="https://cafecito.app/fmelcon" rel="noopener" target="_blank">
            <img
              srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_1_3.75x.png 3.75x"
              src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
              alt="Invitame un café en cafecito.app"
            />
          </a>
        </div>
      </div>
      
      <TokenEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveToken}
        token={editingToken}
      />
      
      <TokenManagerPopup
        isOpen={isTokenManagerOpen}
        onClose={() => setIsTokenManagerOpen(false)}
        removeToken={removeToken}
        updateToken={updateToken}
        tokens={tokens}
      />
    </div>
  );
};

export default TokenPanel;

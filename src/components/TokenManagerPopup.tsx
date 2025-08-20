import React, { useState } from "react";
import {
  Users,
  Edit,
  Trash2,
  Heart,
  Shield,
  Zap,
  Minimize2,
  Maximize2,
  X,
  Move,
} from "lucide-react";
import TokenEditModal from "./TokenEditModal";

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

interface TokenManagerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  removeToken: (id: string) => void;
  updateToken: (id: string, newData: unknown) => void;
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

const TokenManagerPopup: React.FC<TokenManagerPopupProps> = ({
  isOpen,
  onClose,
  removeToken,
  updateToken,
  tokens,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<any>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <>
      {/* Popup Window */}
      <div
        className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 min-w-80 max-w-md"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          maxHeight: isMinimized ? 'auto' : '70vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 bg-gray-700 rounded-t-lg cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">Token Manager</h3>
            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
              {tokens.length} tokens
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-red-600 rounded transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-3">
            <div className="max-h-96 overflow-y-auto">
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-gray-500">No tokens on battlefield</p>
                  <p className="text-xs text-gray-600 mt-1">Add allies, enemies, or bosses to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      {/* Token Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                            style={{ 
                              backgroundColor: token.color,
                              color: getContrastColor(token.color)
                            }}
                          >
                            {token.name ? token.name.charAt(0).toUpperCase() : 
                             token.type === "ally" ? "A" : token.type === "enemy" ? "E" : "B"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">
                              {token.name || `${token.type.charAt(0).toUpperCase() + token.type.slice(1)} Token`}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {token.type.charAt(0).toUpperCase() + token.type.slice(1)} • ({token.x}, {token.y})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition-colors"
                            onClick={() => handleEditToken(token)}
                            title="Edit Token"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                            onClick={() => removeToken(token.id)}
                            title="Remove Token"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Token Stats */}
                      <div className="space-y-2">
                        {/* Health Bar */}
                        {token.maxHp && (
                          <div className="flex items-center gap-2">
                            <Heart size={12} className="text-red-400" />
                            <div className="flex-1 bg-gray-700 rounded-full h-3 relative overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                                style={{
                                  width: `${Math.max(0, Math.min(100, ((token.currentHp || token.maxHp) / token.maxHp) * 100))}%`
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-semibold text-white drop-shadow">
                                  {token.currentHp || token.maxHp}/{token.maxHp}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-3">
                          {token.ac && (
                            <div className="flex items-center gap-1">
                              <Shield size={12} className="text-blue-400" />
                              <span className="text-xs text-blue-300 font-semibold">{token.ac}</span>
                            </div>
                          )}
                          {token.initiative && (
                            <div className="flex items-center gap-1">
                              <Zap size={12} className="text-yellow-400" />
                              <span className="text-xs text-yellow-300 font-semibold">{token.initiative}</span>
                            </div>
                          )}
                          {token.statusMarkers && token.statusMarkers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-purple-300">🎭 {token.statusMarkers.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <TokenEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveToken}
        token={editingToken}
      />
    </>
  );
};

export default TokenManagerPopup;
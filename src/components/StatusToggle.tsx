import React, { useState } from "react";
import { Info, ChevronLeft, ChevronRight, Shield, Sword, Crown, DoorOpen, DoorClosed, Package, Heart, Zap } from "lucide-react";

interface StatusToggleProps {
  selectedElement: {
    type: 'token' | 'door' | 'loot' | null;
    data: any;
  } | null;
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
  loots: Array<{
    id: string;
    x: number;
    y: number;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      rarity: string;
      type: string;
    }>;
    isLooted: boolean;
  }>;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ selectedElement, tokens, loots }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTokenIcon = (type: string) => {
    switch (type) {
      case "ally": return <Shield size={16} className="text-blue-400" />;
      case "enemy": return <Sword size={16} className="text-red-400" />;
      case "boss": return <Crown size={16} className="text-yellow-400" />;
      default: return <Shield size={16} className="text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ally": return "Aliado";
      case "enemy": return "Enemigo";
      case "boss": return "Jefe";
      default: return type;
    }
  };

  const isAllyNearLoot = (loot: any) => {
    return tokens.some(token => {
      if (token.type !== 'ally') return false;
      const distance = Math.abs(token.x - loot.x) + Math.abs(token.y - loot.y);
      return distance <= 1; // Adyacente (incluye diagonales)
    });
  };

  const renderTokenInfo = (token: any) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {getTokenIcon(token.type)}
          <div>
            <h4 className="text-white font-bold text-sm">
              {token.name || getTypeLabel(token.type)}
            </h4>
            <p className="text-gray-400 text-xs">{getTypeLabel(token.type)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {token.currentHp !== undefined && token.maxHp !== undefined && (
            <div className="bg-gray-700 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <Heart size={12} className="text-red-400" />
                <span className="text-xs text-gray-300">HP</span>
              </div>
              <div className="text-white font-bold text-sm">
                {token.currentHp}/{token.maxHp}
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                <div 
                  className="bg-red-500 h-1 rounded-full transition-all"
                  style={{ width: `${(token.currentHp / token.maxHp) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {token.ac !== undefined && (
            <div className="bg-gray-700 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <Shield size={12} className="text-blue-400" />
                <span className="text-xs text-gray-300">AC</span>
              </div>
              <div className="text-white font-bold text-sm">{token.ac}</div>
            </div>
          )}
          
          {token.initiative !== undefined && (
            <div className="bg-gray-700 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-1">
                <Zap size={12} className="text-yellow-400" />
                <span className="text-xs text-gray-300">Iniciativa</span>
              </div>
              <div className="text-white font-bold text-sm">{token.initiative}</div>
            </div>
          )}
        </div>
        
        <div 
          className="h-1 rounded-full opacity-80"
          style={{ backgroundColor: token.color }}
        />
      </div>
    );
  };

  const renderDoorInfo = (door: any) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {door.isOpen ? (
            <DoorOpen size={16} className="text-green-400" />
          ) : (
            <DoorClosed size={16} className="text-red-400" />
          )}
          <div>
            <h4 className="text-white font-bold text-sm">Puerta</h4>
            <p className="text-gray-400 text-xs">
              {door.type === 'horizontal' ? 'Horizontal' : 'Vertical'}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Estado:</span>
            <span className={`font-bold text-sm ${
              door.isOpen ? 'text-green-400' : 'text-red-400'
            }`}>
              {door.isOpen ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderLootInfo = (loot: any) => {
    const canViewLoot = isAllyNearLoot(loot);
    
    if (!canViewLoot) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Package size={16} className="text-yellow-400" />
            <div>
              <h4 className="text-white font-bold text-sm">Tesoro</h4>
              <p className="text-gray-400 text-xs">Cofre misterioso</p>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-sm">
              🔒 Necesitas un aliado cerca para inspeccionar
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Package size={16} className="text-yellow-400" />
          <div>
            <h4 className="text-white font-bold text-sm">
              {loot.isLooted ? 'Cofre Vacío' : 'Cofre de Tesoro'}
            </h4>
            <p className="text-gray-400 text-xs">
              {loot.items.length} objetos
            </p>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Estado:</span>
            <span className={`font-bold text-sm ${
              loot.isLooted ? 'text-gray-400' : 'text-yellow-400'
            }`}>
              {loot.isLooted ? 'Saqueado' : 'Intacto'}
            </span>
          </div>
          
          {!loot.isLooted && loot.items.length > 0 && (
            <div className="space-y-1">
              <p className="text-gray-300 text-xs mb-1">Contenido:</p>
              {loot.items.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="text-xs text-gray-400">
                  • {item.name} ({item.quantity}x)
                </div>
              ))}
              {loot.items.length > 3 && (
                <div className="text-xs text-gray-500">
                  ... y {loot.items.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!selectedElement) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-r-lg shadow-lg transition-all duration-300 opacity-50 hover:opacity-100"
          title="No hay elemento seleccionado"
        >
          <Info size={20} className="text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
      {/* Botón Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onTouchStart={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        title="Toggle Element Info"
      >
        <Info size={20} />
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      {/* Panel Flotante */}
      <div className={`absolute right-full top-0 mr-2 transition-all duration-300 transform ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gray-800 backdrop-blur-sm bg-opacity-95 rounded-lg shadow-2xl border border-gray-700 min-w-[280px] max-w-[320px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Info size={20} />
              Información del Elemento
            </h3>
          </div>
          
          {/* Contenido */}
          <div className="p-4">
            {selectedElement.type === 'token' && renderTokenInfo(selectedElement.data)}
            {selectedElement.type === 'door' && renderDoorInfo(selectedElement.data)}
            {selectedElement.type === 'loot' && renderLootInfo(selectedElement.data)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusToggle;
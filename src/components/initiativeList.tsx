import React, { useState, useRef } from "react";
import { List, ChevronRight, ChevronDown, Sword, Shield, Crown } from "lucide-react";

interface InitiativeListProps {
  tokens: Array<{
    id: string;
    name?: string;
    initiative?: number;
    color: string;
    type: "ally" | "enemy" | "boss";
  }>;
}

const InitiativeList: React.FC<InitiativeListProps> = ({ tokens }) => {
  const [isOpen, setIsOpen] = useState(false);
  const touchHandledRef = useRef(false);
  
  // Ordenar los tokens por iniciativa (de mayor a menor)
  const sortedTokens = [...tokens].sort(
    (a, b) => (b.initiative || 0) - (a.initiative || 0)
  );

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

  return (
    <div className="hidden md:block fixed right-4 top-60 z-50">
      {/* Botón Toggle */}
      <button
        onClick={(e) => {
          if (!touchHandledRef.current) {
            setIsOpen(!isOpen);
          }
          touchHandledRef.current = false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          touchHandledRef.current = true;
          setIsOpen(!isOpen);
        }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        title="Toggle Initiative Order"
      >
        <List size={20} />
        {isOpen ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {/* Panel Flotante */}
      <div className={`absolute right-full top-0 mr-2 transition-all duration-300 transform ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gray-800 backdrop-blur-sm bg-opacity-95 rounded-lg shadow-2xl border border-gray-700 min-w-[280px] max-w-[320px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-lg">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <List size={20} />
              Orden de Iniciativa
            </h3>
            <p className="text-purple-100 text-sm mt-1">
              {sortedTokens.length} combatientes
            </p>
          </div>
          
          {/* Lista */}
          <div className="p-2 max-h-96 overflow-y-auto">
            {sortedTokens.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <List size={32} className="mx-auto mb-2 opacity-50" />
                <p>No hay tokens con iniciativa</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-all duration-200 border border-gray-600 hover:border-gray-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                            {index + 1}
                          </span>
                          {getTokenIcon(token.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {token.name || getTypeLabel(token.type)}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {getTypeLabel(token.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          {token.initiative || "--"}
                        </p>
                        <p className="text-gray-400 text-xs">Iniciativa</p>
                      </div>
                    </div>
                    
                    {/* Barra de color del token */}
                    <div 
                      className="h-1 rounded-full mt-2 opacity-80"
                      style={{ backgroundColor: token.color }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {sortedTokens.length > 0 && (
            <div className="bg-gray-750 p-3 rounded-b-lg border-t border-gray-700">
              <p className="text-gray-400 text-xs text-center">
                Ordenado por iniciativa (mayor a menor)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitiativeList;

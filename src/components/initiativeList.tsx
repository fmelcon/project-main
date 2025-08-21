import React, { useState, useRef } from "react";
import {
  List,
  ChevronRight,
  ChevronDown,
  Sword,
  Shield,
  Crown,
} from "lucide-react";

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
      case "ally":
        return <Shield size={10} className="text-blue-400" />;
      case "enemy":
        return <Sword size={10} className="text-red-400" />;
      case "boss":
        return <Crown size={12} className="text-yellow-400" />;
      default:
        return <Shield size={10} className="text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ally":
        return "Aliado";
      case "enemy":
        return "Enemigo";
      case "boss":
        return "Jefe";
      default:
        return type;
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
        <List size={15} />
        {isOpen ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Panel Flotante */}
      <div
        className={`absolute right-full top-0 mr-2 transition-all duration-300 transform ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gray-800 backdrop-blur-sm bg-opacity-95 rounded-lg shadow-2xl border border-gray-700 min-w-[200px] max-w-[220px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2.5 rounded-t-lg">
            <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
              <List size={14} />
              Iniciativa
            </h3>
            <p className="text-purple-100 text-xs mt-0.5">
              {sortedTokens.length} tokens
            </p>
          </div>

          {/* Lista */}
          <div className="p-2 max-h-80 overflow-y-auto">
            {sortedTokens.length === 0 ? (
              <div className="text-gray-400 text-center py-6">
                <List size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay tokens con iniciativa</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className="bg-gray-700 hover:bg-gray-600 rounded-md p-2 transition-all duration-200 border border-gray-600 hover:border-gray-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-1 py-0.5 rounded-full min-w-[18px] text-center">
                            {index + 1}
                          </span>
                          {getTokenIcon(token.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-xs leading-tight">
                            {token.name || getTypeLabel(token.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">
                          {token.initiative || "--"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Barra de color del token */}
                    <div 
                      className="h-0.5 rounded-full mt-1 opacity-80"
                      style={{ backgroundColor: token.color }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {sortedTokens.length > 0 && (
            <div className="bg-gray-750 p-2 rounded-b-lg border-t border-gray-700">
              <p className="text-gray-400 text-xs text-center">
                Ordenado por iniciativa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitiativeList;

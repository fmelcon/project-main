import React, { useRef } from "react";
import { Users, ExternalLink } from "lucide-react";

interface FloatingTokenManagerProps {
  onOpen: () => void;
  tokenCount: number;
}

const FloatingTokenManager: React.FC<FloatingTokenManagerProps> = ({ onOpen, tokenCount }) => {
  const touchHandledRef = useRef(false);
  
  return (
    <div className="fixed right-4 top-64 z-40">
      <button
        onClick={(e) => {
          if (!touchHandledRef.current) {
            onOpen();
          }
          touchHandledRef.current = false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          touchHandledRef.current = true;
          onOpen();
        }}
        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        title="Token Manager"
      >
        <Users size={20} />
        <ExternalLink size={16} />
        {tokenCount > 0 && (
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold min-w-[20px] text-center">
            {tokenCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingTokenManager;
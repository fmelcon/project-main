import React, { useRef } from "react";
import { UserPlus, Skull, Crown } from "lucide-react";

interface FloatingTokenButtonsProps {
  onAddAlly: () => void;
  onAddEnemy: () => void;
  onAddBoss: () => void;
}

const FloatingTokenButtons: React.FC<FloatingTokenButtonsProps> = ({ onAddAlly, onAddEnemy, onAddBoss }) => {
  const touchHandledRefAlly = useRef(false);
  const touchHandledRefEnemy = useRef(false);
  const touchHandledRefBoss = useRef(false);

  return (
    <div className="fixed right-4 top-12 z-40 flex flex-col gap-2">
      {/* Add Ally Button */}
      <button
        onClick={(e) => {
          if (!touchHandledRefAlly.current) {
            onAddAlly();
          }
          touchHandledRefAlly.current = false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          touchHandledRefAlly.current = true;
          onAddAlly();
        }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        title="Add Ally"
      >
        <UserPlus size={20} />
        <span className="text-sm font-semibold">Ally</span>
      </button>

      {/* Add Enemy Button */}
      <button
        onClick={(e) => {
          if (!touchHandledRefEnemy.current) {
            onAddEnemy();
          }
          touchHandledRefEnemy.current = false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          touchHandledRefEnemy.current = true;
          onAddEnemy();
        }}
        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        title="Add Enemy"
      >
        <Skull size={20} />
        <span className="text-sm font-semibold">Enemy</span>
      </button>

      {/* Add Boss Button */}
      <button
        onClick={(e) => {
          if (!touchHandledRefBoss.current) {
            onAddBoss();
          }
          touchHandledRefBoss.current = false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          touchHandledRefBoss.current = true;
          onAddBoss();
        }}
        className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        title="Add Large Boss"
      >
        <Crown size={20} />
        <span className="text-sm font-semibold">Boss</span>
      </button>
    </div>
  );
};

export default FloatingTokenButtons;
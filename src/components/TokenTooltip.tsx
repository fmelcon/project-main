import React from "react";

interface TokenTooltipProps {
  token: {
    id: string;
    name?: string;
    initiative?: number;
    maxHp?: number;
    currentHp?: number;
    type: "ally" | "enemy" | "boss";
    x: number;
    y: number;
    color: string;
  };
}

const TokenTooltip: React.FC<TokenTooltipProps> = ({ token }) => {
  return (
    <div className="token-tooltip bg-gray-800 text-white p-2 rounded shadow-lg border border-gray-600">
      <div className="font-bold text-lg">{token.name || `${token.type.charAt(0).toUpperCase() + token.type.slice(1)}`}</div>
      <div className="text-sm">
        <div>Type: {token.type.charAt(0).toUpperCase() + token.type.slice(1)}</div>
        <div>Position: ({token.x}, {token.y})</div>
        {token.initiative && <div>Initiative: {token.initiative}</div>}
        {token.maxHp && (
          <div>HP: {token.currentHp || token.maxHp}/{token.maxHp}</div>
        )}
      </div>
    </div>
  );
};

export default TokenTooltip;

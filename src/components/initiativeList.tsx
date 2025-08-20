import React from "react";

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
  // Ordenar los tokens por iniciativa (de mayor a menor)
  const sortedTokens = [...tokens].sort(
    (a, b) => (b.initiative || 0) - (a.initiative || 0)
  );

  return (
    <div className="initiative-list">
      <h2>Initiative Order</h2>
      <ul>
        {sortedTokens.map((token) => (
          <li
            key={token.id}
            style={{
              backgroundColor: token.color,
              opacity: 0.9,
            }}
          >
            <span>{token.name || token.type}</span>
            <span>{token.initiative || "N/A"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InitiativeList;

import React, { useState, useEffect } from "react";
import { X, Coins, Dice6, Plus, Trash2, Sparkles } from "lucide-react";

interface LootEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lootData: LootData) => void;
  initialData?: LootData;
}

export interface LootData {
  id: string;
  x: number;
  y: number;
  items: LootItem[];
  isLooted: boolean;
}

export interface LootItem {
  id: string;
  name: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'gem' | 'coin' | 'misc';
  description?: string;
}

const LootEditModal: React.FC<LootEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [items, setItems] = useState<LootItem[]>([]);
  const [isLooted, setIsLooted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setItems(initialData.items);
      setIsLooted(initialData.isLooted);
    } else {
      setItems([]);
      setIsLooted(false);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    const lootData: LootData = {
      id: initialData?.id || `loot-${Date.now()}`,
      x: initialData?.x || 0,
      y: initialData?.y || 0,
      items,
      isLooted,
    };
    onSave(lootData);
    onClose();
  };

  const addItem = (item: LootItem) => {
    setItems([...items, item]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<LootItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const generateRandomLoot = (tier: 'low' | 'medium' | 'high') => {
    const lootTables = {
      low: {
        items: [
          { name: "Monedas de Cobre", type: "coin", rarity: "common", minQty: 10, maxQty: 50 },
          { name: "Poción de Curación Menor", type: "potion", rarity: "common", minQty: 1, maxQty: 2 },
          { name: "Daga Oxidada", type: "weapon", rarity: "common", minQty: 1, maxQty: 1 },
          { name: "Armadura de Cuero", type: "armor", rarity: "common", minQty: 1, maxQty: 1 },
          { name: "Pergamino de Luz", type: "scroll", rarity: "common", minQty: 1, maxQty: 1 },
        ],
        count: { min: 1, max: 3 }
      },
      medium: {
        items: [
          { name: "Monedas de Plata", type: "coin", rarity: "uncommon", minQty: 20, maxQty: 100 },
          { name: "Poción de Curación", type: "potion", rarity: "uncommon", minQty: 1, maxQty: 3 },
          { name: "Espada Larga +1", type: "weapon", rarity: "uncommon", minQty: 1, maxQty: 1 },
          { name: "Escudo de Acero", type: "armor", rarity: "uncommon", minQty: 1, maxQty: 1 },
          { name: "Pergamino de Bola de Fuego", type: "scroll", rarity: "uncommon", minQty: 1, maxQty: 1 },
          { name: "Gema Menor", type: "gem", rarity: "uncommon", minQty: 1, maxQty: 2 },
        ],
        count: { min: 2, max: 4 }
      },
      high: {
        items: [
          { name: "Monedas de Oro", type: "coin", rarity: "rare", minQty: 50, maxQty: 200 },
          { name: "Poción de Curación Superior", type: "potion", rarity: "rare", minQty: 1, maxQty: 2 },
          { name: "Espada Mágica +2", type: "weapon", rarity: "rare", minQty: 1, maxQty: 1 },
          { name: "Armadura Élfica", type: "armor", rarity: "very-rare", minQty: 1, maxQty: 1 },
          { name: "Pergamino de Teletransporte", type: "scroll", rarity: "rare", minQty: 1, maxQty: 1 },
          { name: "Gema Preciosa", type: "gem", rarity: "rare", minQty: 1, maxQty: 3 },
          { name: "Anillo de Protección", type: "misc", rarity: "very-rare", minQty: 1, maxQty: 1 },
        ],
        count: { min: 3, max: 6 }
      }
    };

    const table = lootTables[tier];
    const itemCount = Math.floor(Math.random() * (table.count.max - table.count.min + 1)) + table.count.min;
    const newItems: LootItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const randomItem = table.items[Math.floor(Math.random() * table.items.length)];
      const quantity = Math.floor(Math.random() * (randomItem.maxQty - randomItem.minQty + 1)) + randomItem.minQty;
      
      newItems.push({
        id: `item-${Date.now()}-${i}`,
        name: randomItem.name,
        quantity,
        rarity: randomItem.rarity as any,
        type: randomItem.type as any,
        description: `Generado automáticamente (${tier})`
      });
    }

    setItems([...items, ...newItems]);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#9ca3af',
      uncommon: '#10b981',
      rare: '#3b82f6',
      'very-rare': '#8b5cf6',
      legendary: '#f59e0b',
      artifact: '#ef4444'
    };
    return colors[rarity as keyof typeof colors] || '#9ca3af';
  };

  const getRarityName = (rarity: string) => {
    const names = {
      common: 'Común',
      uncommon: 'Poco Común',
      rare: 'Raro',
      'very-rare': 'Muy Raro',
      legendary: 'Legendario',
      artifact: 'Artefacto'
    };
    return names[rarity as keyof typeof names] || 'Común';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-gray-800 rounded-xl p-6 w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-600"
        style={{ background: "linear-gradient(145deg, #1a1a1a, #2d2d2d)" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins size={24} className="text-yellow-400" />
            {initialData ? "Editar Botín" : "Nuevo Cofre de Botín"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Estado del cofre */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={isLooted}
              onChange={(e) => setIsLooted(e.target.checked)}
              className="rounded"
            />
            Cofre saqueado (vacío)
          </label>
        </div>

        {/* Generadores de loot */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            Generar Loot Aleatorio
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => generateRandomLoot('low')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Dice6 size={16} />
              Nivel Bajo
            </button>
            <button
              onClick={() => generateRandomLoot('medium')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Dice6 size={16} />
              Nivel Medio
            </button>
            <button
              onClick={() => generateRandomLoot('high')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Dice6 size={16} />
              Nivel Alto
            </button>
          </div>
        </div>

        {/* Lista de items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">Contenido del Cofre</h3>
            <button
              onClick={() => addItem({
                id: `item-${Date.now()}`,
                name: "Nuevo Item",
                quantity: 1,
                rarity: 'common',
                type: 'misc'
              })}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No hay items en este cofre</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        placeholder="Nombre del item"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-20 p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                          min="1"
                        />
                        <select
                          value={item.rarity}
                          onChange={(e) => updateItem(item.id, { rarity: e.target.value as any })}
                          className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        >
                          <option value="common">Común</option>
                          <option value="uncommon">Poco Común</option>
                          <option value="rare">Raro</option>
                          <option value="very-rare">Muy Raro</option>
                          <option value="legendary">Legendario</option>
                          <option value="artifact">Artefacto</option>
                        </select>
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(item.id, { type: e.target.value as any })}
                          className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        >
                          <option value="weapon">Arma</option>
                          <option value="armor">Armadura</option>
                          <option value="potion">Poción</option>
                          <option value="scroll">Pergamino</option>
                          <option value="gem">Gema</option>
                          <option value="coin">Moneda</option>
                          <option value="misc">Varios</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{ 
                            backgroundColor: getRarityColor(item.rarity) + '20',
                            color: getRarityColor(item.rarity),
                            border: `1px solid ${getRarityColor(item.rarity)}`
                          }}
                        >
                          {getRarityName(item.rarity)}
                        </span>
                        <span className="text-gray-400 text-xs">x{item.quantity}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Guardar Cofre
          </button>
        </div>
      </div>
    </div>
  );
};

export default LootEditModal;
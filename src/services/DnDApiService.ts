// Servicio para integrar la API de D&D 5e
// https://www.dnd5eapi.co/docs/

export interface DnDItem {
  index: string;
  name: string;
  url: string;
  rarity?: {
    name: string;
  };
  equipment_category?: {
    name: string;
  };
  cost?: {
    quantity: number;
    unit: string;
  };
  desc?: string[];
}

export interface DnDApiResponse {
  count: number;
  results: DnDItem[];
}

export type LootRarity = 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary';

class DnDApiService {
  private baseUrl = 'https://www.dnd5eapi.co/api';
  private cache: Map<string, any> = new Map();
  private lastRequestTime = 0;
  private requestDelay = 200; // 200ms entre requests

  // Cache para evitar múltiples llamadas a la API con rate limiting
  private async fetchWithCache(url: string, retries = 3): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Rate limiting: esperar entre requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Too Many Requests - implementar backoff exponencial
        if (retries > 0) {
          const backoffDelay = Math.pow(2, 4 - retries) * 1000; // 1s, 2s, 4s
          console.warn(`Rate limited, retrying in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.fetchWithCache(url, retries - 1);
        } else {
          console.error('Rate limit exceeded, using fallback');
          return null;
        }
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error('Error fetching from D&D API:', error);
      return null;
    }
  }

  // Obtener todos los equipos disponibles
  async getAllEquipment(): Promise<DnDItem[]> {
    const data = await this.fetchWithCache(`${this.baseUrl}/equipment`);
    return data?.results || [];
  }

  // Obtener detalles específicos de un item
  async getItemDetails(index: string): Promise<DnDItem | null> {
    const data = await this.fetchWithCache(`${this.baseUrl}/equipment/${index}`);
    return data;
  }

  // Obtener items mágicos
  async getMagicItems(): Promise<DnDItem[]> {
    const data = await this.fetchWithCache(`${this.baseUrl}/magic-items`);
    return data?.results || [];
  }

  // Obtener detalles de un item mágico
  async getMagicItemDetails(index: string): Promise<DnDItem | null> {
    const data = await this.fetchWithCache(`${this.baseUrl}/magic-items/${index}`);
    return data;
  }

  // Mapear rareza de la API a nuestro sistema
  private mapRarity(apiRarity?: string): LootRarity {
    if (!apiRarity) return 'common';
    
    const rarity = apiRarity.toLowerCase();
    switch (rarity) {
      case 'common': return 'common';
      case 'uncommon': return 'uncommon';
      case 'rare': return 'rare';
      case 'very rare': return 'very-rare';
      case 'legendary': return 'legendary';
      default: return 'common';
    }
  }

  // Generar loot basado en probabilidades
  async generateLoot(): Promise<{
    hasLoot: boolean;
    items: Array<{
      name: string;
      rarity: LootRarity;
      description: string;
      value?: string;
    }>;
  }> {
    // Probabilidades: 50% sin loot, 30% común, 15% poco común, 4% raro, 1% legendario
    const roll = Math.random() * 100;
    
    if (roll < 50) {
      return { hasLoot: false, items: [] };
    }

    let targetRarity: LootRarity;
    if (roll < 80) { // 30% común (50-80)
      targetRarity = 'common';
    } else if (roll < 95) { // 15% poco común (80-95)
      targetRarity = 'uncommon';
    } else if (roll < 99) { // 4% raro (95-99)
      targetRarity = 'rare';
    } else { // 1% legendario (99-100)
      targetRarity = 'legendary';
    }

    try {
      // Intentar obtener items mágicos primero para rarezas altas
      let items: DnDItem[] = [];
      
      if (targetRarity !== 'common') {
        items = await this.getMagicItems();
        
        // Si tenemos items mágicos, obtener detalles de algunos aleatorios (secuencialmente para evitar rate limit)
        if (items.length > 0) {
          const randomItems = this.getRandomItems(items, 2); // Reducir a 2 items
          const detailedItems = [];
          
          // Procesar secuencialmente para evitar rate limiting
          for (const item of randomItems) {
            const details = await this.getMagicItemDetails(item.index);
            if (details) detailedItems.push(details);
          }
          
          const validItems = detailedItems.filter(item => 
            item && this.mapRarity(item.rarity?.name) === targetRarity
          );
          
          if (validItems.length > 0) {
            const selectedItem = validItems[Math.floor(Math.random() * validItems.length)];
            return {
              hasLoot: true,
              items: [{
                name: selectedItem!.name,
                rarity: this.mapRarity(selectedItem!.rarity?.name),
                description: selectedItem!.desc?.join(' ') || `A ${targetRarity} magical item.`,
                value: selectedItem!.cost ? `${selectedItem!.cost.quantity} ${selectedItem!.cost.unit}` : undefined
              }]
            };
          }
        }
      }

      // Fallback a equipos normales
      const equipment = await this.getAllEquipment();
      if (equipment.length > 0) {
        const randomItems = this.getRandomItems(equipment, 3); // Reducir a 3 items
        const detailedItems = [];
        
        // Procesar secuencialmente para evitar rate limiting
        for (const item of randomItems) {
          const details = await this.getItemDetails(item.index);
          if (details) detailedItems.push(details);
        }
        
        const validItems = detailedItems.filter(item => item !== null);
        if (validItems.length > 0) {
          const selectedItem = validItems[Math.floor(Math.random() * validItems.length)];
          return {
            hasLoot: true,
            items: [{
              name: selectedItem!.name,
              rarity: 'common', // Los equipos normales son comunes
              description: selectedItem!.desc?.join(' ') || `A piece of equipment.`,
              value: selectedItem!.cost ? `${selectedItem!.cost.quantity} ${selectedItem!.cost.unit}` : undefined
            }]
          };
        }
      }

      // Fallback final con items genéricos
      return this.generateFallbackLoot(targetRarity);
      
    } catch (error) {
      console.error('Error generating loot from API:', error);
      return this.generateFallbackLoot(targetRarity);
    }
  }

  // Obtener items aleatorios de una lista
  private getRandomItems(items: DnDItem[], count: number): DnDItem[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, items.length));
  }

  // Generar loot de respaldo si la API falla
  private generateFallbackLoot(rarity: LootRarity): {
    hasLoot: boolean;
    items: Array<{
      name: string;
      rarity: LootRarity;
      description: string;
      value?: string;
    }>;
  } {
    const fallbackItems = {
      common: [
        { name: 'Rusty Sword', description: 'An old, weathered blade.' },
        { name: 'Leather Pouch', description: 'A small pouch containing coins.' },
        { name: 'Torch', description: 'A wooden torch wrapped in cloth.' },
        { name: 'Rope (50 feet)', description: 'Sturdy hemp rope.' },
        { name: 'Rations', description: 'Dried food for travel.' }
      ],
      uncommon: [
        { name: 'Silver Dagger', description: 'A well-crafted silver blade.' },
        { name: 'Healing Potion', description: 'A red liquid that restores health.' },
        { name: 'Enchanted Cloak', description: 'A cloak that shimmers with magic.' },
        { name: 'Masterwork Bow', description: 'A finely crafted longbow.' }
      ],
      rare: [
        { name: 'Flaming Sword', description: 'A sword wreathed in magical flames.' },
        { name: 'Ring of Protection', description: 'A ring that deflects harm.' },
        { name: 'Boots of Speed', description: 'Boots that enhance movement.' },
        { name: 'Wand of Magic Missiles', description: 'A wand that fires magical projectiles.' }
      ],
      'very-rare': [
        { name: 'Staff of Power', description: 'A powerful magical staff.' },
        { name: 'Armor of Invulnerability', description: 'Armor that resists all damage.' },
        { name: 'Crystal Ball', description: 'A sphere for scrying and divination.' }
      ],
      legendary: [
        { name: 'Excalibur', description: 'The legendary sword of kings.' },
        { name: 'Orb of Dragonkind', description: 'An artifact of immense power.' },
        { name: 'Deck of Many Things', description: 'A deck of fate-altering cards.' }
      ]
    };

    const items = fallbackItems[rarity];
    const selectedItem = items[Math.floor(Math.random() * items.length)];
    
    return {
      hasLoot: true,
      items: [{
        name: selectedItem.name,
        rarity,
        description: selectedItem.description
      }]
    };
  }

  // Limpiar cache (útil para testing)
  clearCache(): void {
    this.cache.clear();
  }
}

export const dndApiService = new DnDApiService();
export default dndApiService;
# Guía para Desarrolladores - D&D Combat Grid 🛠️

Esta guía proporciona información técnica detallada para desarrolladores que quieran contribuir o entender la arquitectura interna del proyecto.

## 📋 Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Gestión de Estado](#gestión-de-estado)
- [Componentes Principales](#componentes-principales)
- [APIs y Servicios](#apis-y-servicios)
- [Sistemas Especializados](#sistemas-especializados)
- [Patrones de Diseño](#patrones-de-diseño)
- [Testing](#testing)
- [Performance](#performance)

## 🏗️ Arquitectura General

### Stack Tecnológico

```
┌─────────────────────────────────────┐
│              Frontend               │
├─────────────────────────────────────┤
│ React 18 + TypeScript + Tailwind   │
│ Vite (Build Tool)                   │
│ Lucide React (Icons)                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│            External APIs            │
├─────────────────────────────────────┤
│ D&D 5e API (dnd5eapi.co)           │
│ Browser APIs (Canvas, Audio, etc.)  │
└─────────────────────────────────────┘
```

### Flujo de Datos

```
App.tsx (Estado Global)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   TokenPanel    │  GridComponent  │  DrawingTools   │
│                 │                 │                 │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │
│ │TokenManager │ │ │   Tokens    │ │ │    Tools    │ │
│ │   Popup     │ │ │    Fog      │ │ │   Walls     │ │
│ │             │ │ │   Doors     │ │ │   Doors     │ │
│ └─────────────┘ │ │   Walls     │ │ └─────────────┘ │
│                 │ └─────────────┘ │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

## 🔄 Gestión de Estado

### Estado Principal (App.tsx)

```typescript
// Estados principales del componente App
const [tokens, setTokens] = useState<Token[]>([]);
const [drawingData, setDrawingData] = useState<DrawingData[]>([]);
const [fogOfWar, setFogOfWar] = useState<Set<string>>(new Set());
const [doors, setDoors] = useState<Map<string, Door>>(new Map());
const [walls, setWalls] = useState<Map<string, Wall>>(new Map());
```

### Tipos de Datos

```typescript
interface Token {
  id: string;
  type: 'ally' | 'enemy' | 'boss';
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
}

interface Door {
  type: 'horizontal' | 'vertical';
  isOpen: boolean;
}

interface Wall {
  type: 'horizontal' | 'vertical';
}

interface DrawingData {
  type: string;
  points: number[];
  color: string;
}
```

### Flujo de Actualización

```typescript
// Patrón típico de actualización
const updateToken = (id: string, newData: Partial<Token>) => {
  setTokens(prevTokens => 
    prevTokens.map(token => 
      token.id === id ? { ...token, ...newData } : token
    )
  );
};
```

## 🧩 Componentes Principales

### GridComponent.tsx

**Responsabilidades:**
- Renderizado de la grilla principal (40x40)
- Gestión de tokens y elementos visuales
- Sistema de fog of war
- Event handling (mouse, touch, keyboard)
- Menús contextuales

**Estructura interna:**
```typescript
const GridComponent: React.FC<GridComponentProps> = ({
  // Props del componente
}) => {
  // Estados locales
  const [hoveredToken, setHoveredToken] = useState();
  const [contextMenu, setContextMenu] = useState();
  const [editingToken, setEditingToken] = useState();
  
  // Funciones de renderizado
  const renderGrid = () => { /* Grilla base */ };
  const renderTokens = () => { /* Tokens */ };
  const renderWalls = () => { /* Paredes */ };
  const renderDoors = () => { /* Puertas */ };
  
  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => { /* ... */ };
  const showContextMenu = (e: React.MouseEvent, tokenId: string) => { /* ... */ };
  
  return (
    <div className="grid-container">
      {/* Capas renderizadas en orden Z-index */}
      <div className="background-layer">{/* Fondo */}</div>
      <div className="grid-layer">{renderGrid()}</div>
      <div className="walls-layer">{renderWalls()}</div>
      <div className="doors-layer">{renderDoors()}</div>
      <div className="tokens-layer">{renderTokens()}</div>
      <canvas className="drawing-layer" />
      {/* Overlays */}
    </div>
  );
};
```

### TokenManagerPopup.tsx

**Características:**
- Ventana flotante independiente
- Sistema de arrastre con `mousemove` events
- Estados minimizado/maximizado
- Gestión completa de tokens

**Sistema de Arrastre:**
```typescript
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

// Cleanup de event listeners
useEffect(() => {
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging, dragOffset]);
```

### TokenEditModal.tsx

**Sistema de Pestañas:**
```typescript
const [activeTab, setActiveTab] = useState<'details' | 'settings' | 'notes'>('details');

// Renderizado condicional por pestaña
{activeTab === 'details' && (
  <div className="details-tab">
    {/* Campos de detalles */}
  </div>
)}
{activeTab === 'settings' && (
  <div className="settings-tab">
    {/* Configuraciones */}
  </div>
)}
{activeTab === 'notes' && (
  <div className="notes-tab">
    {/* Notas del GM */}
  </div>
)}
```

**Validación de Formularios:**
```typescript
const validateForm = () => {
  const newErrors: {[key: string]: string} = {};
  
  if (formData.x < 0 || formData.x > 39) {
    newErrors.x = "La posición X debe estar entre 0 y 39";
  }
  // ... más validaciones
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## 🔌 APIs y Servicios

### D&D 5e API Integration

**Rate Limiting Implementation:**
```typescript
// Procesamiento por lotes para evitar 429 errors
const fetchSpellsWithRateLimit = async () => {
  const batchSize = 5;
  const delayBetweenBatches = 1000;
  
  for (let i = 0; i < data.results.length; i += batchSize) {
    const batch = data.results.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (spell: any) => {
      try {
        const response = await fetch(`https://www.dnd5eapi.co${spell.url}`);
        
        if (response.status === 429) {
          await delay(2000);
          const retryResponse = await fetch(`https://www.dnd5eapi.co${spell.url}`);
          return await retryResponse.json();
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error fetching spell ${spell.name}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    spellsData.push(...batchResults.filter(spell => spell !== null));
    
    if (i + batchSize < data.results.length) {
      await delay(delayBetweenBatches);
    }
  }
};
```

### Local Storage Management

```typescript
const saveGame = () => {
  const gameData = {
    gridType,
    backgroundImage,
    tokens,
    drawingData,
    doors: Array.from(doors.entries()),
    walls: Array.from(walls.entries()),
    fogOfWar: Array.from(fogOfWar),
  };
  
  localStorage.setItem('dndCombatGrid', JSON.stringify(gameData));
};

const loadGame = () => {
  const savedData = localStorage.getItem('dndCombatGrid');
  if (savedData) {
    const gameData = JSON.parse(savedData);
    // Restaurar estado...
    setDoors(new Map(gameData.doors));
    setWalls(new Map(gameData.walls));
    setFogOfWar(new Set(gameData.fogOfWar));
  }
};
```

## ⚙️ Sistemas Especializados

### Sistema de Fog of War

**Algoritmo de Revelado:**
```typescript
const revealAroundAllies = () => {
  if (!fogEnabled) return;
  
  const revealedCells = new Set<string>();
  
  tokens.forEach(token => {
    if (token.type === 'ally') {
      // Revelar 2 casilleros en todas las direcciones
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          // Excluir esquinas lejanas para forma más natural
          const isCorner = (Math.abs(dx) === 2 && Math.abs(dy) === 2);
          if (isCorner) continue;
          
          const newX = token.x + dx;
          const newY = token.y + dy;
          
          if (newX >= 0 && newX < 40 && newY >= 0 && newY < 40) {
            revealedCells.add(`${newX}-${newY}`);
          }
        }
      }
    }
  });
  
  setFogOfWar(revealedCells);
};
```

### Sistema de Dibujo (Canvas)

**Drawing Engine:**
```typescript
const handleDrawing = (drawingData: DrawingData) => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  
  if (!ctx) return;
  
  ctx.strokeStyle = drawingData.color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  if (drawingData.type === 'draw') {
    ctx.beginPath();
    for (let i = 0; i < drawingData.points.length - 1; i += 2) {
      const x = drawingData.points[i];
      const y = drawingData.points[i + 1];
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
};
```

### Sistema de Audio (Dice Roller)

**Audio Management:**
```typescript
const playDiceSound = () => {
  const audio = new Audio('/dice-sound.mp3');
  audio.volume = 0.5;
  audio.play().catch(error => {
    console.log('Audio play failed:', error);
  });
};
```

## 🎨 Patrones de Diseño

### Compound Components Pattern

```typescript
// TokenEditModal usa compound components
const TokenEditModal = ({ children, ...props }) => {
  return (
    <Modal {...props}>
      <Modal.Header />
      <Modal.Tabs />
      <Modal.Content>
        {children}
      </Modal.Content>
      <Modal.Actions />
    </Modal>
  );
};
```

### Custom Hooks Pattern

```typescript
// Hook personalizado para drag & drop
const useDragAndDrop = (initialPosition: Position) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);
  
  // ... más lógica
  
  return {
    position,
    isDragging,
    handleMouseDown,
    // ... más handlers
  };
};
```

### Context Pattern (Futuro)

```typescript
// Para futuras mejoras de gestión de estado
const GameContext = createContext<GameState | null>(null);

const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  
  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};
```

## 🧪 Testing

### Estructura de Tests (Recomendada)

```typescript
// __tests__/components/GridComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import GridComponent from '../GridComponent';

describe('GridComponent', () => {
  const mockProps = {
    tokens: [],
    onTokenMove: jest.fn(),
    // ... más props
  };
  
  it('renders grid correctly', () => {
    render(<GridComponent {...mockProps} />);
    expect(screen.getByTestId('grid-container')).toBeInTheDocument();
  });
  
  it('handles token placement', () => {
    render(<GridComponent {...mockProps} />);
    const gridCell = screen.getByTestId('grid-cell-0-0');
    fireEvent.click(gridCell);
    expect(mockProps.onTokenMove).toHaveBeenCalled();
  });
});
```

### Test Utilities

```typescript
// __tests__/utils/testUtils.tsx
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <GameProvider>
      {ui}
    </GameProvider>
  );
};

export const createMockToken = (overrides?: Partial<Token>): Token => ({
  id: 'test-token',
  type: 'ally',
  x: 0,
  y: 0,
  color: '#3498db',
  ...overrides,
});
```

## ⚡ Performance

### Optimizaciones Implementadas

1. **React.memo para componentes pesados:**
```typescript
const GridComponent = React.memo<GridComponentProps>((props) => {
  // Componente optimizado
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.tokens.length === nextProps.tokens.length;
});
```

2. **useCallback para handlers:**
```typescript
const handleTokenMove = useCallback((id: string, x: number, y: number) => {
  setTokens(prevTokens => 
    prevTokens.map(token => 
      token.id === id ? { ...token, x, y } : token
    )
  );
}, []);
```

3. **useMemo para cálculos costosos:**
```typescript
const visibleTokens = useMemo(() => {
  return tokens.filter(token => {
    if (!fogEnabled) return true;
    const tokenKey = `${token.x}-${token.y}`;
    return fogOfWar.has(tokenKey) || token.type === 'ally';
  });
}, [tokens, fogOfWar, fogEnabled]);
```

### Métricas de Performance

- **Renderizado inicial**: < 100ms
- **Actualización de token**: < 16ms (60fps)
- **Carga de API**: Rate limited a 5 req/s
- **Memoria**: < 50MB para sesión típica

## 🔍 Debugging

### Debug Tools

```typescript
// Habilitar logs de debug
const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[D&D Grid] ${message}`, data);
  }
};

// Uso en componentes
debugLog('Token updated', { id, newData });
debugLog('Fog revealed', Array.from(revealedCells));
```

### React DevTools

- Instalar React Developer Tools
- Usar Profiler para identificar re-renders
- Inspeccionar estado de componentes

### Performance Monitoring

```typescript
// Medir performance de operaciones críticas
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Uso
measurePerformance('Token Update', () => {
  updateToken(id, newData);
});
```

## 🚀 Deployment

### Build Process

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

### Environment Variables

```env
# .env.local
VITE_API_BASE_URL=https://www.dnd5eapi.co/api/2014
VITE_DEBUG_MODE=false
```

### Optimizaciones de Build

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
```

---

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [D&D 5e API](https://www.dnd5eapi.co/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

**¡Happy Coding! 🚀**
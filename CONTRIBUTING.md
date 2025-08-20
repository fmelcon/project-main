# Guía de Contribución - D&D Combat Grid 🤝

¡Gracias por tu interés en contribuir al proyecto D&D Combat Grid! Esta guía te ayudará a empezar y entender cómo puedes aportar al desarrollo.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

## 🤝 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de:

- Edad, tamaño corporal, discapacidad visible o invisible
- Etnia, características sexuales, identidad y expresión de género
- Nivel de experiencia, educación, estatus socioeconómico
- Nacionalidad, apariencia personal, raza, religión
- Identidad y orientación sexual

### Comportamiento Esperado

- **Sé respetuoso**: Trata a todos con respeto y consideración
- **Sé constructivo**: Proporciona feedback constructivo y útil
- **Sé colaborativo**: Trabaja en equipo y ayuda a otros
- **Sé paciente**: Entiende que todos tienen diferentes niveles de experiencia

### Comportamiento Inaceptable

- Lenguaje o imágenes sexualizadas
- Comentarios despectivos, insultos o ataques personales
- Acoso público o privado
- Publicar información privada de otros sin permiso
- Cualquier conducta que sea inapropiada en un entorno profesional

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

1. **🐛 Reportar Bugs**
   - Encuentra y reporta errores
   - Proporciona información detallada para reproducir

2. **✨ Nuevas Funcionalidades**
   - Propone nuevas características
   - Implementa features del roadmap

3. **📚 Documentación**
   - Mejora la documentación existente
   - Traduce documentación
   - Crea tutoriales y guías

4. **🎨 Diseño y UX**
   - Mejora la interfaz de usuario
   - Optimiza la experiencia de usuario
   - Crea assets visuales

5. **⚡ Performance**
   - Optimiza el rendimiento
   - Reduce el tamaño del bundle
   - Mejora la accesibilidad

## 🛠️ Configuración del Entorno

### Prerrequisitos

```bash
# Versiones requeridas
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.0.0
```

### Setup Inicial

1. **Fork del Repositorio**
   ```bash
   # En GitHub, haz click en "Fork"
   # Luego clona tu fork
   git clone https://github.com/TU_USERNAME/project-main.git
   cd project-main
   ```

2. **Configurar Remote Upstream**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/project-main.git
   git remote -v
   ```

3. **Instalar Dependencias**
   ```bash
   npm install
   ```

4. **Verificar Instalación**
   ```bash
   npm run dev
   # Debería abrir http://localhost:5173
   ```

### Herramientas de Desarrollo

```bash
# Scripts disponibles
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting
npm run lint:fix     # Fix automático de linting
npm run type-check   # Verificación de tipos TypeScript
```

## 🔄 Proceso de Desarrollo

### Workflow de Git

1. **Sincronizar con Upstream**
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   git push origin main
   ```

2. **Crear Rama de Feature**
   ```bash
   # Nomenclatura: tipo/descripcion-corta
   git checkout -b feature/token-animations
   git checkout -b bugfix/fog-rendering-issue
   git checkout -b docs/api-documentation
   ```

3. **Desarrollar y Commitear**
   ```bash
   # Hacer cambios...
   git add .
   git commit -m "feat: add token animation system"
   ```

4. **Push y Pull Request**
   ```bash
   git push origin feature/token-animations
   # Crear PR en GitHub
   ```

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>[scope opcional]: <descripción>

# Tipos
feat:     # Nueva funcionalidad
fix:      # Bug fix
docs:     # Documentación
style:    # Formateo, punto y coma faltante, etc.
refactor: # Refactoring de código
perf:     # Mejora de performance
test:     # Agregar tests
chore:    # Tareas de mantenimiento

# Ejemplos
feat(tokens): add drag and drop functionality
fix(fog): resolve rendering issue with large maps
docs(readme): update installation instructions
style(grid): improve component spacing
refactor(api): extract rate limiting logic
perf(canvas): optimize drawing performance
test(tokens): add unit tests for token creation
chore(deps): update dependencies
```

### Branching Strategy

```
main
├── feature/nueva-funcionalidad
├── bugfix/corregir-error
├── docs/documentacion
└── hotfix/arreglo-urgente
```

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Buenas prácticas
interface TokenProps {
  id: string;
  type: 'ally' | 'enemy' | 'boss';
  position: { x: number; y: number };
  onMove?: (newPosition: { x: number; y: number }) => void;
}

const Token: React.FC<TokenProps> = ({ 
  id, 
  type, 
  position, 
  onMove 
}) => {
  const handleMove = useCallback((newPos: { x: number; y: number }) => {
    onMove?.(newPos);
  }, [onMove]);
  
  return (
    <div 
      className={`token token--${type}`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)` 
      }}
    >
      {/* Contenido del token */}
    </div>
  );
};

// ❌ Evitar
const BadToken = (props: any) => {
  return <div style={{left: props.x + 'px'}}>{props.children}</div>;
};
```

### React Components

```typescript
// ✅ Estructura recomendada
const ComponentName: React.FC<ComponentProps> = ({
  // Destructuring de props
  prop1,
  prop2,
  onAction,
}) => {
  // 1. Estados locales
  const [localState, setLocalState] = useState(initialValue);
  
  // 2. Refs
  const elementRef = useRef<HTMLDivElement>(null);
  
  // 3. Efectos
  useEffect(() => {
    // Lógica de efectos
  }, [dependencies]);
  
  // 4. Handlers (con useCallback si es necesario)
  const handleAction = useCallback(() => {
    // Lógica del handler
    onAction?.();
  }, [onAction]);
  
  // 5. Render helpers
  const renderContent = () => {
    return <div>Content</div>;
  };
  
  // 6. Early returns
  if (!prop1) {
    return <div>Loading...</div>;
  }
  
  // 7. Main render
  return (
    <div className="component-name">
      {renderContent()}
    </div>
  );
};

// Exportar con memo si es necesario
export default React.memo(ComponentName);
```

### CSS/Tailwind

```typescript
// ✅ Clases organizadas
const className = [
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-4 m-2',
  // Sizing
  'w-full h-auto',
  // Colors
  'bg-gray-800 text-white',
  // States
  'hover:bg-gray-700 focus:outline-none',
  // Responsive
  'md:p-6 lg:p-8',
].join(' ');

// ✅ Componentes condicionales
const buttonClass = `
  px-4 py-2 rounded font-medium transition-colors
  ${variant === 'primary' 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
  }
  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
`;
```

### Naming Conventions

```typescript
// Componentes: PascalCase
const TokenManager = () => {};
const GridComponent = () => {};

// Funciones: camelCase
const handleTokenMove = () => {};
const calculateDistance = () => {};

// Constantes: UPPER_SNAKE_CASE
const MAX_TOKENS = 100;
const DEFAULT_GRID_SIZE = 40;

// Interfaces: PascalCase con sufijo
interface TokenProps {}
interface GridState {}
interface ApiResponse {}

// Tipos: PascalCase
type TokenType = 'ally' | 'enemy' | 'boss';
type GridPosition = { x: number; y: number };
```

## 🧪 Testing

### Estructura de Tests

```
__tests__/
├── components/
│   ├── GridComponent.test.tsx
│   ├── TokenManager.test.tsx
│   └── TokenEditModal.test.tsx
├── utils/
│   ├── gameLogic.test.ts
│   └── apiHelpers.test.ts
├── hooks/
│   └── useDragAndDrop.test.ts
└── setup.ts
```

### Escribir Tests

```typescript
// __tests__/components/Token.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Token } from '../Token';

describe('Token Component', () => {
  const defaultProps = {
    id: 'test-token',
    type: 'ally' as const,
    position: { x: 0, y: 0 },
    onMove: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders token correctly', () => {
    render(<Token {...defaultProps} />);
    expect(screen.getByTestId('token-test-token')).toBeInTheDocument();
  });
  
  it('calls onMove when dragged', () => {
    render(<Token {...defaultProps} />);
    const token = screen.getByTestId('token-test-token');
    
    fireEvent.mouseDown(token, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(document);
    
    expect(defaultProps.onMove).toHaveBeenCalledWith({ x: 50, y: 50 });
  });
  
  it('applies correct CSS classes for token type', () => {
    render(<Token {...defaultProps} type="enemy" />);
    const token = screen.getByTestId('token-test-token');
    expect(token).toHaveClass('token--enemy');
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Tests con coverage
npm test -- --coverage

# Test específico
npm test -- Token.test.tsx
```

## 📚 Documentación

### JSDoc Comments

```typescript
/**
 * Calcula la distancia entre dos posiciones en la grilla
 * @param pos1 - Primera posición
 * @param pos2 - Segunda posición
 * @returns Distancia en casilleros
 * @example
 * ```typescript
 * const distance = calculateGridDistance(
 *   { x: 0, y: 0 }, 
 *   { x: 3, y: 4 }
 * ); // returns 5
 * ```
 */
const calculateGridDistance = (
  pos1: GridPosition, 
  pos2: GridPosition
): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};
```

### README Updates

Cuando agregues nuevas funcionalidades:

1. Actualiza la sección de características
2. Agrega ejemplos de uso si es necesario
3. Actualiza screenshots si hay cambios visuales
4. Documenta nuevas configuraciones

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
## 🐛 Descripción del Bug
Descripción clara y concisa del problema.

## 🔄 Pasos para Reproducir
1. Ve a '...'
2. Haz click en '...'
3. Desplázate hacia '...'
4. Ve el error

## ✅ Comportamiento Esperado
Descripción de lo que esperabas que pasara.

## 📱 Screenshots
Si es aplicable, agrega screenshots para explicar el problema.

## 🖥️ Información del Entorno
- OS: [e.g. Windows 10, macOS 12.0]
- Navegador: [e.g. Chrome 95, Firefox 94]
- Versión: [e.g. 1.2.0]

## 📝 Contexto Adicional
Cualquier otra información relevante sobre el problema.
```

### Información Útil para Bugs

- **Console errors**: Abre DevTools y copia errores de consola
- **Network issues**: Revisa la pestaña Network en DevTools
- **Reproducibilidad**: ¿Pasa siempre o solo a veces?
- **Datos de prueba**: ¿Qué tokens/configuración estabas usando?

## ✨ Solicitar Features

### Template de Feature Request

```markdown
## 🚀 Descripción del Feature
Descripción clara y concisa de lo que quieres que se agregue.

## 🎯 Problema que Resuelve
¿Qué problema resuelve este feature? ¿Por qué es útil?

## 💡 Solución Propuesta
Descripción de cómo te gustaría que funcionara.

## 🔄 Alternativas Consideradas
¿Consideraste otras soluciones? ¿Por qué esta es mejor?

## 📝 Contexto Adicional
Cualquier otra información, mockups, o ejemplos.
```

### Priorización de Features

**Alta Prioridad:**
- Mejoras de accesibilidad
- Fixes de performance críticos
- Funcionalidades core de D&D

**Media Prioridad:**
- Mejoras de UX
- Nuevas herramientas de dibujo
- Integraciones con APIs

**Baja Prioridad:**
- Features experimentales
- Personalizaciones avanzadas
- Optimizaciones menores

## 🎯 Áreas que Necesitan Ayuda

### 🔥 High Priority
- **Accesibilidad**: ARIA labels, keyboard navigation
- **Testing**: Aumentar coverage de tests
- **Performance**: Optimizar renderizado de grilla grande
- **Mobile UX**: Mejorar experiencia táctil

### 📋 Medium Priority
- **Documentación**: Más ejemplos y tutoriales
- **Internacionalización**: Soporte multi-idioma
- **Themes**: Sistema de temas personalizables
- **Export/Import**: Formatos adicionales

### 💡 Ideas para Contribuir
- **Nuevos Status Effects**: Más efectos de estado
- **Sound Effects**: Más efectos de audio
- **Animations**: Animaciones de tokens
- **Templates**: Plantillas de mapas

## 🏆 Reconocimiento

Todos los contribuidores serán reconocidos en:

- **README.md**: Lista de contribuidores
- **CHANGELOG.md**: Créditos por versión
- **About page**: En la aplicación
- **GitHub**: Contributors page

### Tipos de Contribución

- 🐛 **Bug fixes**
- ✨ **Features**
- 📚 **Documentation**
- 🎨 **Design**
- 💡 **Ideas**
- 🔍 **Testing**
- 🌍 **Translation**
- 📢 **Outreach**

## 📞 Contacto y Soporte

- **GitHub Issues**: Para bugs y feature requests
- **GitHub Discussions**: Para preguntas y discusiones
- **Discord**: [Link al servidor] (si existe)
- **Email**: [email de contacto] (si aplica)

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia que el proyecto (MIT License).

---

**¡Gracias por contribuir al D&D Combat Grid! 🎲⚔️**

Tu ayuda hace que este proyecto sea mejor para toda la comunidad de D&D. ¡Esperamos tus contribuciones!
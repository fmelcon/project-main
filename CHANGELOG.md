# Changelog - D&D Combat Grid 📝

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planeado
- Modo multijugador en tiempo real
- Importación de mapas desde Roll20
- Sistema de macros personalizables
- Integración con D&D Beyond
- Sistema de chat integrado

## [1.0.0] - 2024-01-15

### 🎉 Lanzamiento Inicial

Primera versión completa del D&D Combat Grid con todas las funcionalidades principales implementadas.

### ✨ Added

#### 🗺️ Sistema de Grilla
- Grilla expandida de 40x40 casilleros
- Modo pantalla completa con controles de entrada/salida
- Soporte para imágenes de fondo personalizadas
- Tipos de grilla: cuadrada y octagonal
- Zoom y navegación fluida

#### 🎭 Gestión de Tokens
- **Token Manager Popup**: Ventana flotante, arrastrable y minimizable
- **Tipos de tokens**: Aliados, Enemigos y Jefes (2x2)
- **Sistema de edición completo** con modal de 3 pestañas:
  - **Details**: Nombre, stats de combate, status effects
  - **Settings**: Visibilidad, nameplate, health bar, posición, color
  - **Notes**: Notas privadas del GM
- **10 Status Effects**: Poisoned, Stunned, Paralyzed, Charmed, Frightened, Restrained, Blinded, Deafened, Unconscious, Dead
- **Barras de vida visuales** con gradientes y texto superpuesto
- **Menús contextuales**: Click derecho (desktop) y long press (móvil)
- **Personalización completa**: Colores, nombres, estadísticas

#### 🌫️ Sistema de Niebla de Guerra
- **Revelado automático**: Los tokens aliados disipan niebla en radio de 2 casilleros
- **Forma inteligente**: Excluye esquinas lejanas para apariencia natural
- **Ocultación selectiva**: Solo enemigos y jefes se ocultan
- **Control manual**: Botón para activar/desactivar
- **Actualización dinámica**: Se actualiza al mover tokens

#### 🚪 Elementos Arquitectónicos
- **Puertas interactivas**: Horizontales y verticales
- **Estados visuales**: Abiertas (verde) y cerradas (marrón)
- **Sistema de paredes**: Horizontales y verticales
- **Colocación precisa**: En bordes de casilleros
- **Interacción simple**: Click para cambiar estados

#### 🎲 Sistema de Dados
- **Roller visual**: Animaciones 3D realistas
- **Efectos de sonido**: Audio inmersivo para cada tirada
- **Múltiples dados**: d4, d6, d8, d10, d12, d20, d100
- **Historial de tiradas**: Registro completo
- **Texturas realistas**: Imágenes de dados físicos

#### 📋 Lista de Iniciativa
- **Ordenamiento automático**: Por valor de iniciativa
- **Gestión de turnos**: Seguimiento del orden de combate
- **Integración con tokens**: Sincronización automática
- **Interfaz intuitiva**: Fácil de usar durante combate

#### 🔍 Integración API D&D 5e
- **Base de datos completa**: Hechizos y clases oficiales
- **Búsqueda avanzada**: Filtros por clase, nivel, escuela
- **Rate limiting inteligente**: Evita errores 429
- **Procesamiento por lotes**: 5 requests por segundo
- **Retry automático**: Manejo robusto de errores
- **Información detallada**: Descripciones, componentes, duración

#### 🎨 Herramientas de Dibujo
- **Move**: Mover tokens y elementos
- **Draw**: Dibujar líneas libres en canvas
- **Erase**: Borrar dibujos específicos
- **Fill**: Rellenar áreas con color
- **Square**: Dibujar rectángulos
- **Walls**: Crear paredes horizontales/verticales
- **Doors**: Colocar puertas interactivas
- **Fog**: Activar/desactivar niebla de guerra

#### 💾 Persistencia de Datos
- **Guardado automático**: En localStorage
- **Carga de partidas**: Restaurar estado completo
- **Export/Import**: Funcionalidad básica
- **Reset completo**: Limpiar grilla y empezar de nuevo

### 🛠️ Technical Features

#### ⚡ Performance
- **React.memo**: Optimización de re-renders
- **useCallback**: Handlers optimizados
- **useMemo**: Cálculos costosos cacheados
- **Lazy loading**: Carga diferida de componentes
- **Bundle optimization**: Chunks separados por funcionalidad

#### 📱 Responsive Design
- **Desktop**: Experiencia completa con mouse
- **Tablet**: Interfaz táctil optimizada
- **Mobile**: Adaptación para pantallas pequeñas
- **Touch events**: Soporte completo para gestos

#### 🎯 Accessibility
- **Keyboard navigation**: Navegación por teclado
- **Screen reader support**: Etiquetas ARIA
- **High contrast**: Colores accesibles
- **Focus management**: Manejo correcto del foco

#### 🔧 Developer Experience
- **TypeScript**: Tipado estricto en todo el proyecto
- **ESLint**: Linting automático
- **Prettier**: Formateo consistente
- **Hot reload**: Desarrollo rápido con Vite
- **Component architecture**: Estructura modular y mantenible

### 🏗️ Architecture

#### 📁 Project Structure
```
src/
├── components/           # Componentes React
│   ├── ApiSection.tsx   # Integración D&D 5e API
│   ├── DrawingTools.tsx # Herramientas de dibujo
│   ├── GridComponent.tsx # Grilla principal
│   ├── TokenEditModal.tsx # Modal de edición
│   ├── TokenManagerPopup.tsx # Popup flotante
│   ├── TokenPanel.tsx   # Panel lateral
│   ├── TokenTooltip.tsx # Tooltips
│   ├── diceRoller.tsx   # Sistema de dados
│   └── initiativeList.tsx # Lista de iniciativa
├── App.tsx              # Componente principal
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

#### 🔄 State Management
- **Local state**: useState para estados de componente
- **Prop drilling**: Para comunicación entre componentes
- **Event handlers**: Callbacks para acciones
- **LocalStorage**: Persistencia de datos

#### 🎨 Styling
- **Tailwind CSS**: Framework de utilidades
- **Custom CSS**: Estilos específicos cuando necesario
- **CSS Variables**: Para temas y personalización
- **Responsive utilities**: Breakpoints móviles

### 🐛 Bug Fixes

#### Token Management
- Corregido problema de tokens que no se actualizaban visualmente
- Solucionado error de posicionamiento en grillas grandes
- Arreglado problema de menú contextual que no aparecía
- Corregido conflicto entre event handlers de tokens y grilla

#### Fog of War
- Solucionado problema de revelado que no se actualizaba
- Corregido cálculo de distancia para revelado
- Arreglado problema de tokens que no se ocultaban correctamente

#### API Integration
- Implementado rate limiting para evitar errores 429
- Corregido manejo de errores de red
- Solucionado problema de carga infinita
- Arreglado parsing de datos de hechizos

#### UI/UX
- Corregido problema de responsive en dispositivos móviles
- Solucionado overflow en listas largas
- Arreglado z-index de modales y popups
- Corregido problema de scroll en contenedores

### 🔄 Changed

#### Token System Redesign
- **Antes**: Sistema básico con edición limitada
- **Después**: Sistema completo estilo Roll20 con popup flotante
- **Mejoras**: 
  - Modal con pestañas
  - 10 status effects
  - Configuración avanzada
  - Notas del GM

#### Grid System Enhancement
- **Antes**: Grilla 20x20 básica
- **Después**: Grilla 40x40 con funcionalidades avanzadas
- **Mejoras**:
  - Pantalla completa
  - Fondos personalizados
  - Mejor navegación

#### API Integration Overhaul
- **Antes**: Requests simples sin control
- **Después**: Sistema robusto con rate limiting
- **Mejoras**:
  - Procesamiento por lotes
  - Retry automático
  - Mejor manejo de errores

### 📊 Statistics

- **Líneas de código**: ~8,000
- **Componentes**: 9 principales
- **Funcionalidades**: 15+ sistemas completos
- **Tipos TypeScript**: 20+ interfaces
- **Tiempo de desarrollo**: 3 meses
- **Performance**: <100ms tiempo de carga inicial

### 🙏 Contributors

- **Franco** - Desarrollo principal, arquitectura, todas las funcionalidades
- **Claude (Anthropic)** - Asistencia en desarrollo, debugging, optimizaciones

### 📚 Documentation

- **README.md**: Guía completa de usuario
- **DEVELOPER_GUIDE.md**: Documentación técnica detallada
- **CONTRIBUTING.md**: Guía para contribuidores
- **CHANGELOG.md**: Este archivo de cambios

---

## Formato de Versiones

### Semantic Versioning

Este proyecto usa [SemVer](https://semver.org/) para versionado:

- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles
- **PATCH** (0.0.X): Bug fixes compatibles

### Tipos de Cambios

- **Added**: Nuevas funcionalidades
- **Changed**: Cambios en funcionalidades existentes
- **Deprecated**: Funcionalidades que serán removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Bug fixes
- **Security**: Vulnerabilidades de seguridad

### Convenciones

- Fechas en formato ISO (YYYY-MM-DD)
- Enlaces a issues y PRs cuando aplique
- Créditos a contribuidores
- Categorización clara de cambios
- Descripción del impacto en usuarios

---

**¡Gracias por usar D&D Combat Grid! 🎲⚔️**

Para más información sobre versiones futuras, revisa nuestro [roadmap](README.md#roadmap-futuro) en el README.
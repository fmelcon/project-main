# D&D Combat Grid 🎲⚔️

Una aplicación web moderna y completa para gestionar combates de Dungeons & Dragons con funcionalidades avanzadas de tablero virtual (VTT).

![D&D Combat Grid](https://img.shields.io/badge/D%26D-Combat%20Grid-red?style=for-the-badge&logo=dungeonsanddragons)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Características Principales

### 🗺️ **Sistema de Grilla Avanzado**
- **Grilla expandida**: 40x40 casilleros para mapas grandes
- **Modo pantalla completa**: Experiencia inmersiva sin distracciones
- **Fondo personalizable**: Sube imágenes de mapas como fondo
- **Zoom y navegación**: Controles intuitivos para explorar el mapa

### 🎭 **Gestión de Tokens Profesional**
- **Token Manager Popup**: Ventana flotante, arrastrable y minimizable
- **Tipos de tokens**: Aliados, Enemigos y Jefes con características únicas
- **Edición completa**: Modal con pestañas (Details, Settings, Notes)
- **Estadísticas de combate**: HP, AC, Initiative con barras visuales
- **10 Status Effects**: Poisoned, Stunned, Paralyzed, Charmed, etc.
- **Personalización total**: Colores, nombres, posiciones

### 🌫️ **Sistema de Niebla de Guerra**
- **Revelado automático**: Los tokens aliados disipan la niebla
- **Radio inteligente**: 2 casilleros alrededor de cada aliado
- **Ocultación de enemigos**: Los enemigos se ocultan en la niebla
- **Control manual**: Activar/desactivar según necesidad

### 🚪 **Elementos Arquitectónicos**
- **Puertas interactivas**: Horizontales y verticales
- **Estados visuales**: Abiertas (verde) y cerradas (marrón)
- **Paredes**: Sistema completo horizontal y vertical
- **Colocación precisa**: En bordes de casilleros para realismo

### 📝 **Sistema de Texto y Letreros**
- **Herramienta de texto**: Coloca letreros informativos en el mapa
- **Editor avanzado**: Modal con opciones de personalización
- **Estilos configurables**: Tamaño, color, fondo y transparencia
- **Posicionamiento libre**: Coloca texto en cualquier casillero
- **Sincronización multijugador**: Textos visibles para todos los jugadores

### 💰 **Sistema de Loot y Tesoros**
- **Cofres interactivos**: Coloca cofres de tesoro en el mapa
- **Generador automático**: Loot aleatorio con raridades mágicas
- **Editor de contenido**: Personaliza items, cantidades y raridades
- **Estados visuales**: Cofres intactos vs saqueados
- **Efectos especiales**: Brillo dorado para items raros
- **Proximidad realista**: Solo visible el contenido con aliado cerca

### 🧹 **Goma Selectiva Avanzada**
- **Borrado inteligente**: Elimina elementos específicos por celda
- **Múltiples tipos**: Textos, loot, puertas, muros y dibujos
- **Precisión quirúrgica**: Borra solo lo que necesitas
- **Sincronización**: Cambios reflejados en tiempo real

### 🎲 **Sistema de Dados Inmersivo**
- **Roller visual**: Animaciones 3D realistas y aceleradas
- **Efectos de sonido**: Audio inmersivo para cada tirada
- **Múltiples dados**: d4, d6, d8, d10, d12, d20, d100
- **Animaciones rápidas**: 60% más veloces para combates ágiles
- **Texturas espectaculares**: Patrones únicos por tipo de dado
- **Historial**: Registro de todas las tiradas

### 📋 **Lista de Iniciativa Flotante**
- **Panel flotante**: Toggle en margen derecho, siempre accesible
- **Ordenamiento automático**: Por valor de iniciativa
- **Gestión de turnos**: Seguimiento del orden de combate
- **Integración con tokens**: Sincronización automática
- **Diseño profesional**: Gradientes y efectos visuales premium
- **Soporte touch**: Funciona perfectamente en tablets y móviles

### 👥 **Token Manager Flotante**
- **Acceso rápido**: Botón flotante con contador de tokens
- **Siempre visible**: No se oculta con scroll o cambios de vista
- **Diseño distintivo**: Gradiente verde-teal para fácil identificación
- **Compatibilidad total**: Mouse y touch optimizado

### 🔍 **Integración API D&D 5e**
- **Base de datos completa**: Hechizos y clases oficiales
- **Búsqueda avanzada**: Filtros por clase, nivel, escuela
- **Rate limiting**: Optimizado para evitar errores de API
- **Información detallada**: Descripciones, componentes, duración

### 🌐 **Multijugador en Tiempo Real**
- **Sesiones online**: Crear y unirse a sesiones multijugador
- **Sincronización automática**: Todos los cambios se sincronizan en tiempo real
- **Roles de usuario**: Game Master y Players con permisos diferenciados
- **WebSocket**: Comunicación bidireccional de baja latencia
- **Gestión de sesiones**: Sistema robusto de salas con IDs únicos
- **Reconexión automática**: Manejo inteligente de desconexiones
- **Estado persistente**: Las sesiones se mantienen activas entre reconexiones

### 📱 **Compatibilidad Móvil y Touch**
- **Soporte touch completo**: Todos los controles optimizados para dispositivos táctiles
- **Long press**: Edición de tokens con mantener presionado en móviles
- **Prevención de doble activación**: Sistema inteligente para evitar clicks múltiples
- **Controles flotantes**: Initiative List y Token Manager accesibles en touch
- **Interfaz adaptativa**: Diseño responsivo para tablets y smartphones
- **Gestos optimizados**: Navegación natural en dispositivos táctiles

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Navegador web moderno

### Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd project-main

# Instalar dependencias del cliente
npm install

# Instalar dependencias del servidor WebSocket
npm run server:install

# Opción 1: Solo cliente (modo offline)
npm run dev

# Opción 2: Cliente + Servidor (modo multijugador)
npm run dev:full

# Abrir en el navegador
# http://localhost:5173
```

### Scripts Disponibles

```bash
# Cliente
npm run dev          # Servidor de desarrollo (solo cliente)
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción
npm run lint         # Verificar código

# Servidor WebSocket
npm run server       # Ejecutar servidor WebSocket
npm run server:dev   # Servidor WebSocket con auto-restart
npm run server:install # Instalar dependencias del servidor

# Desarrollo completo
npm run dev:full     # Cliente + Servidor simultáneamente
```

## 🎮 Guía de Uso

### Configuración Inicial

1. **Configurar Grilla**
   - Selecciona tipo de grilla (cuadrada/octagonal)
   - Sube una imagen de fondo si deseas
   - Activa pantalla completa para mejor experiencia

2. **Crear Tokens**
   - Usa "+ Add Ally" para personajes jugadores
   - Usa "+ Add Enemy" para enemigos
   - Usa "+ Add Large Boss" para jefes (2x2 casilleros)

### Gestión de Combate

1. **Token Manager**
   - Click en "Token Manager" para abrir el popup
   - Arrastra la ventana donde prefieras
   - Minimiza cuando no la necesites

2. **Editar Tokens**
   - Click derecho en cualquier token (desktop)
   - Long press en dispositivos táctiles
   - O usa el botón de edición en Token Manager

3. **Niebla de Guerra**
   - Activa con el botón "Eye" en Drawing Tools
   - Los aliados revelan automáticamente su área
   - Los enemigos se ocultan en la niebla

### Herramientas de Dibujo

- **Move**: Mover tokens y elementos
- **Draw**: Dibujar líneas libres
- **Erase**: Goma selectiva inteligente (borra por tipo de elemento)
- **Fill**: Rellenar áreas
- **Square**: Dibujar rectángulos
- **Walls**: Paredes horizontales/verticales
- **Doors**: Puertas interactivas
- **Text**: Colocar letreros y texto informativo
- **Loot**: Cofres de tesoro con generador automático
- **Fog**: Activar niebla de guerra

### Multijugador Online

1. **Iniciar Servidor**
   - Ejecuta `npm run dev:full` para cliente + servidor
   - O ejecuta `npm run server:dev` en una terminal separada

2. **Crear Sesión (Game Master)**
   - Click en "Connect to Server" en el panel Multiplayer
   - Click en "Create New Session"
   - Ingresa nombre de sesión y tu nombre
   - Comparte el Session ID con los jugadores

3. **Unirse a Sesión (Players)**
   - Click en "Connect to Server"
   - Click en "Join Session"
   - Ingresa el Session ID y tu nombre
   - ¡Listo para jugar!

4. **Durante el Juego**
   - **GM**: Puede modificar todo (fog, paredes, puertas, fondo)
   - **Players**: Pueden mover tokens y dibujar
   - **Sincronización**: Todos los cambios se ven en tiempo real
   - **Reconexión**: Si se desconecta, reconecta automáticamente

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos

```
src/
├── components/
│   ├── ApiSection.tsx          # Integración API D&D 5e
│   ├── DrawingTools.tsx        # Herramientas de dibujo
│   ├── FloatingTokenManager.tsx # Token Manager flotante
│   ├── GridComponent.tsx       # Componente principal de grilla
│   ├── LootEditModal.tsx       # Modal de edición de loot
│   ├── MultiplayerPanel.tsx    # Panel multijugador
│   ├── TextEditModal.tsx       # Modal de edición de texto
│   ├── TokenEditModal.tsx      # Modal de edición de tokens
│   ├── TokenManagerPopup.tsx   # Popup flotante de gestión
│   ├── TokenPanel.tsx          # Panel lateral de tokens
│   ├── TokenTooltip.tsx        # Tooltips informativos
│   ├── diceRoller.tsx          # Sistema de dados
│   └── initiativeList.tsx      # Lista de iniciativa flotante
├── hooks/
│   └── useMultiplayerSync.ts   # Hook de sincronización
├── services/
│   ├── FirebaseService.ts      # Servicio Firebase
│   ├── MultiplayerService.ts   # Servicio multijugador
│   └── WebSocketService.ts     # Servicio WebSocket
├── App.tsx                     # Componente principal
├── main.tsx                    # Punto de entrada
└── index.css                   # Estilos globales
```

### Tecnologías Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **Lucide React**: Iconografía
- **Vite**: Herramienta de build
- **D&D 5e API**: Datos oficiales

### Componentes Clave

#### `GridComponent.tsx`
- Renderizado de la grilla principal
- Gestión de tokens y elementos
- Sistema de fog of war
- Menús contextuales
- Event handling para interacciones

#### `TokenManagerPopup.tsx`
- Ventana flotante independiente
- Sistema de arrastre
- Estados minimizado/maximizado
- Gestión completa de tokens

#### `TokenEditModal.tsx`
- Modal con sistema de pestañas
- Formularios de edición completos
- Validación de datos
- Status effects management

## 🎯 Funcionalidades Detalladas

### Sistema de Tokens

#### Tipos de Token
- **Ally**: Personajes jugadores, revelan niebla
- **Enemy**: Enemigos, se ocultan en niebla
- **Boss**: Jefes grandes (2x2), mecánicas especiales

#### Propiedades Editables
- **Básicas**: Nombre, color, posición
- **Combate**: HP máximo/actual, AC, iniciativa
- **Visuales**: Visibilidad, nameplate, health bar
- **Estados**: 10 status effects diferentes
- **Notas**: Notas privadas del GM

#### Edición Móvil
- **Long press**: Mantener presionado para editar en dispositivos táctiles
- **Prompt nativo**: Interfaz simple para cambio rápido de nombres
- **Touch optimizado**: Área de toque ampliada para mejor precisión

### Sistema de Texto y Letreros

#### Funcionalidades
- **Colocación libre**: Click en cualquier casillero para agregar texto
- **Editor completo**: Modal con opciones avanzadas de personalización
- **Estilos configurables**: Tamaño (12-48px), colores personalizables
- **Fondos opcionales**: Transparente, semi-transparente o sólido
- **Sincronización**: Visible para todos los jugadores en multijugador

### Sistema de Loot y Tesoros

#### Generador Automático
- **Raridades**: Common, Uncommon, Rare, Very Rare, Legendary
- **Tipos variados**: Armas, armaduras, pociones, pergaminos, gemas
- **Cantidades aleatorias**: 1-5 items por cofre
- **Efectos visuales**: Brillo dorado para items raros

#### Mecánicas de Juego
- **Proximidad realista**: Solo visible con aliado adyacente
- **Estados visuales**: Cofre intacto vs saqueado
- **Edición manual**: Personaliza contenido completamente
- **Sincronización**: Estado compartido en multijugador

### Sistema de Niebla de Guerra

#### Mecánicas
- **Revelado automático**: 2 casilleros de radio por ally
- **Forma inteligente**: Excluye esquinas lejanas
- **Actualización dinámica**: Al mover tokens
- **Ocultación selectiva**: Solo enemigos y jefes

### Elementos Arquitectónicos

#### Puertas
- **Tipos**: Horizontales y verticales
- **Estados**: Abierta (verde) / Cerrada (marrón)
- **Interacción**: Click para cambiar estado
- **Posicionamiento**: En bordes de casilleros

#### Paredes
- **Tipos**: Horizontales y verticales
- **Colocación**: Bordes de casilleros
- **Visual**: Líneas sólidas negras
- **Funcional**: Bloqueo visual y mecánico

## 🔧 Desarrollo y Contribución

### Configuración de Desarrollo

1. **Fork del repositorio**
2. **Crear rama de feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrollar y testear**
4. **Commit con mensajes descriptivos**
5. **Push y crear Pull Request**

### Estándares de Código

- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo consistente
- **Componentes funcionales**: Hooks de React
- **Tailwind CSS**: Clases utilitarias

### Estructura de Componentes

```typescript
// Ejemplo de estructura típica
interface ComponentProps {
  // Props tipadas
}

const Component: React.FC<ComponentProps> = ({
  // Destructuring de props
}) => {
  // Estados locales
  const [state, setState] = useState();
  
  // Efectos
  useEffect(() => {
    // Lógica de efectos
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Lógica de manejo
  };
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
```

## 🐛 Resolución de Problemas

### Problemas Comunes

#### Error de API Rate Limit
```
Error 429: Too Many Requests
```
**Solución**: El sistema tiene rate limiting automático, espera unos segundos.

#### Tokens no aparecen
**Solución**: Verifica que estés en modo "Move" para ver los tokens.

#### Niebla no se revela
**Solución**: Asegúrate de que:
- La niebla esté activada
- Los tokens sean de tipo "ally"
- Los tokens estén en posiciones válidas

### Logs de Debug

El sistema incluye logs en consola para debugging:
```javascript
console.log('Token data:', token);
console.log('Fog revealed cells:', revealedCells);
```

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos
- **Desktop**: Experiencia completa
- **Tablet**: Funcionalidad táctil optimizada
- **Mobile**: Interfaz adaptativa

### Plataformas de Deployment
- **Netlify**: Soporte completo con Functions para multijugador
- **Vercel**: Compatible con adaptaciones
- **Heroku**: Soporte para servidor WebSocket
- **Desarrollo local**: Funcionalidad completa

## 🚀 Deployment en Netlify

### Configuración Automática

La aplicación está configurada para deployment automático en Netlify:

1. **Fork del repositorio** en GitHub
2. **Conectar a Netlify**:
   - Ir a [netlify.com](https://netlify.com)
   - "New site from Git" → Seleccionar tu fork
   - Build settings se configuran automáticamente desde `netlify.toml`
3. **Deploy automático**: Cada push a main despliega automáticamente

### Funcionalidad Multijugador en Netlify

**Detección Automática:**
- La app detecta automáticamente si está en Netlify
- Usa HTTP polling en lugar de WebSockets para compatibilidad serverless
- Funcionalidad completa mantenida con adaptaciones

**Configuración:**
```bash
# El sistema detecta automáticamente:
# - netlify.app domains
# - Netlify Functions endpoints
# - Usa polling cada 2 segundos para sincronización
```

### Variables de Entorno (Opcional)

En Netlify Dashboard → Site settings → Environment variables:

```bash
# Opcional: URL personalizada del servidor
REACT_APP_WEBSOCKET_URL=wss://tu-servidor-websocket.com

# Opcional: Intervalo de polling (ms)
REACT_APP_POLLING_INTERVAL=2000
```

## 🔮 Roadmap Futuro

### Funcionalidades Completadas ✅
- [x] Modo multijugador en tiempo real
- [x] Deployment en Netlify
- [x] Sistema de texto y letreros
- [x] Sistema de loot y tesoros
- [x] Goma selectiva avanzada
- [x] Controles flotantes (Initiative List, Token Manager)
- [x] Soporte touch completo para móviles
- [x] Animaciones de dados aceleradas
- [x] Prevención de doble activación en touch
- [x] Long press para edición en móviles

### Funcionalidades Planificadas 🚀
- [ ] Importación de mapas desde Roll20
- [ ] Sistema de macros personalizables
- [ ] Integración con D&D Beyond
- [ ] Efectos de sonido ambientales
- [ ] Sistema de chat integrado
- [ ] Guardado en la nube con base de datos
- [ ] Medición de distancias y áreas
- [ ] Efectos de área (AoE) visuales
- [ ] Sistema de condiciones automáticas

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features:
- Abre un Issue en GitHub
- Incluye pasos para reproducir
- Adjunta screenshots si es relevante

---

**¡Que disfrutes tus aventuras épicas! 🐉⚔️🎲**
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

### 🎲 **Sistema de Dados Inmersivo**
- **Roller visual**: Animaciones 3D realistas
- **Efectos de sonido**: Audio inmersivo para cada tirada
- **Múltiples dados**: d4, d6, d8, d10, d12, d20, d100
- **Historial**: Registro de todas las tiradas

### 📋 **Lista de Iniciativa**
- **Ordenamiento automático**: Por valor de iniciativa
- **Gestión de turnos**: Seguimiento del orden de combate
- **Integración con tokens**: Sincronización automática

### 🔍 **Integración API D&D 5e**
- **Base de datos completa**: Hechizos y clases oficiales
- **Búsqueda avanzada**: Filtros por clase, nivel, escuela
- **Rate limiting**: Optimizado para evitar errores de API
- **Información detallada**: Descripciones, componentes, duración

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

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción
npm run lint         # Verificar código
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
- **Erase**: Borrar dibujos
- **Fill**: Rellenar áreas
- **Square**: Dibujar rectángulos
- **Walls**: Paredes horizontales/verticales
- **Doors**: Puertas interactivas
- **Fog**: Activar niebla de guerra

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos

```
src/
├── components/
│   ├── ApiSection.tsx          # Integración API D&D 5e
│   ├── DrawingTools.tsx        # Herramientas de dibujo
│   ├── GridComponent.tsx       # Componente principal de grilla
│   ├── TokenEditModal.tsx      # Modal de edición de tokens
│   ├── TokenManagerPopup.tsx   # Popup flotante de gestión
│   ├── TokenPanel.tsx          # Panel lateral de tokens
│   ├── TokenTooltip.tsx        # Tooltips informativos
│   ├── diceRoller.tsx          # Sistema de dados
│   └── initiativeList.tsx      # Lista de iniciativa
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

## 🔮 Roadmap Futuro

### Funcionalidades Planificadas
- [ ] Modo multijugador en tiempo real
- [ ] Importación de mapas desde Roll20
- [ ] Sistema de macros personalizables
- [ ] Integración con D&D Beyond
- [ ] Efectos de sonido ambientales
- [ ] Sistema de chat integrado
- [ ] Guardado en la nube

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
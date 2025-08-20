# 🔍 TEST REAL DE SINCRONIZACIÓN

## INSTRUCCIONES PASO A PASO

### 🔥 SETUP INICIAL
1. Abrir DOS ventanas del navegador en http://localhost:5173/
2. En AMBAS ventanas: F12 → Console
3. Ventana 1 (GM): Connect to Firebase → Create Session
4. Ventana 2 (Player): Connect to Firebase → Join Session con token

### 🧪 TEST 1: VERIFICAR CONEXIÓN BÁSICA

**En Console de GM:**
```javascript
console.log('=== TEST CONEXIÓN GM ===');
console.log('Connected:', multiplayerService.isConnected());
console.log('Session ID:', multiplayerService.getCurrentSessionId());
console.log('Is GM:', multiplayerService.isGameMaster());
```

**En Console de Player:**
```javascript
console.log('=== TEST CONEXIÓN PLAYER ===');
console.log('Connected:', multiplayerService.isConnected());
console.log('Session ID:', multiplayerService.getCurrentSessionId());
console.log('Is GM:', multiplayerService.isGameMaster());
```

**RESULTADO ESPERADO:**
- GM: Connected: true, Session ID: [TOKEN], Is GM: true
- Player: Connected: true, Session ID: [MISMO TOKEN], Is GM: false

---

### 🎨 TEST 2: DRAWING TOOLS - SELECTED TOOL

**Acción:** GM click en herramienta "Draw" (lápiz)

**Logs esperados en GM:**
```
🎨 Syncing selected tool: "draw"
🎨 MultiplayerService.syncSelectedToolUpdate called: "draw"
🎨 FirebaseService.syncSelectedToolUpdate called: "draw"
🚀 Updating game state in Firebase: {type: "selected_tool_update", ...}
✅ Game update sent successfully to Firebase
```

**Logs esperados en Player:**
```
🔥 Firebase gameState changed, processing...
🎨 Syncing selected tool: "draw"
Received game update: selected_tool_update {selectedTool: "draw"}
🔄 Applying remote update: selected_tool_update {selectedTool: "draw"}
```

**Verificación Visual:** Player debería ver "Draw" seleccionado

---

### 🎨 TEST 3: DRAWING TOOLS - SELECTED COLOR

**Acción:** GM cambiar color a ROJO

**Logs esperados en GM:**
```
🎨 Syncing selected color: "#ff0000"
🎨 MultiplayerService.syncSelectedColorUpdate called: "#ff0000"
🎨 FirebaseService.syncSelectedColorUpdate called: "#ff0000"
🚀 Updating game state in Firebase: {type: "selected_color_update", ...}
✅ Game update sent successfully to Firebase
```

**Logs esperados en Player:**
```
🔥 Firebase gameState changed, processing...
🎨 Syncing selected color: "#ff0000"
Received game update: selected_color_update {selectedColor: "#ff0000"}
🔄 Applying remote update: selected_color_update {selectedColor: "#ff0000"}
```

**Verificación Visual:** Player debería ver color ROJO seleccionado

---

### 🌫️ TEST 4: FOG OF WAR

**Acción:** GM click "Toggle Fog of War" (ojo)

**Logs esperados en GM:**
```
🌫️ Syncing fog enabled: true
🌫️ MultiplayerService.syncFogEnabledUpdate called: true
🌫️ FirebaseService.syncFogEnabledUpdate called: true
🚀 Updating game state in Firebase: {type: "fog_enabled_update", ...}
✅ Game update sent successfully to Firebase
```

**Logs esperados en Player:**
```
🔥 Firebase gameState changed, processing...
🌫️ Syncing fog enabled: true
Received game update: fog_enabled_update {fogEnabled: true}
🔄 Applying remote update: fog_enabled_update {fogEnabled: true}
```

**Verificación Visual:** Player debería ver botón fog activado

---

### 🚪 TEST 5: PUERTAS

**Acción:** GM seleccionar "Door H" → Click en grilla

**Logs esperados en GM:**
```
🚪 Syncing door update: [cellKey] {type: "horizontal", isOpen: false}
🚪 MultiplayerService.syncUpdateDoor called
🚪 FirebaseService.syncDoorUpdate called
🚀 Updating game state in Firebase: {type: "door_update", ...}
✅ Game update sent successfully to Firebase
```

**Logs esperados en Player:**
```
🔥 Firebase gameState changed, processing...
🚪 Syncing doors: [número]
Received game update: doors_sync_all
🔄 Applying remote update: doors_sync_all
```

**Verificación Visual:** Player debería ver puerta en grilla

---

### 🧱 TEST 6: PAREDES

**Acción:** GM seleccionar "Wall H" → Click en grilla

**Logs esperados en GM:**
```
🧱 Syncing wall update: [cellKey] {type: "horizontal"}
🧱 MultiplayerService.syncUpdateWall called
🧱 FirebaseService.syncWallUpdate called
🚀 Updating game state in Firebase: {type: "wall_update", ...}
✅ Game update sent successfully to Firebase
```

**Logs esperados en Player:**
```
🔥 Firebase gameState changed, processing...
🧱 Syncing walls: [número]
Received game update: walls_sync_all
🔄 Applying remote update: walls_sync_all
```

**Verificación Visual:** Player debería ver pared en grilla

---

### 🎨 TEST 7: DIBUJOS

**Acción:** GM seleccionar "Draw" → Dibujar línea en grilla

**Logs esperados en GM:**
```
🎨 Syncing drawing: {type: "line", points: [...], color: "..."}
🎨 MultiplayerService.syncAddDrawing called
🎨 FirebaseService.syncDrawingAdd called
🚀 Updating game state in Firebase: {type: "drawing_add", ...}
✅ Game update sent successfully to Firebase
```

**Logs esperados en Player:**
```
🔥 Firebase gameState changed, processing...
🎨 Syncing drawings: [número]
Received game update: drawing_sync_all
🔄 Applying remote update: drawing_sync_all
```

**Verificación Visual:** Player debería ver línea dibujada

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### ❌ SI NO APARECEN LOGS DE GM:
**Problema:** Los métodos sync no se están llamando
**Causa:** handleSelectedToolChange/handleSelectedColorChange no están conectados
**Solución:** Verificar que DrawingTools use las funciones wrapper

### ❌ SI APARECEN LOGS DE GM PERO NO DE PLAYER:
**Problema:** Firebase no está propagando cambios
**Causa:** processGameStateChanges no está procesando los tipos de update
**Solución:** Verificar que processGameStateChanges tenga todos los casos

### ❌ SI APARECEN LOGS PERO NO HAY CAMBIO VISUAL:
**Problema:** applyRemoteUpdate no está aplicando cambios
**Causa:** handleGameUpdate no está pasando updates al hook
**Solución:** Verificar multiplayerSync.applyRemoteUpdate?.(update)

---

## 📋 CHECKLIST DE VERIFICACIÓN

**Antes de reportar:**
- [ ] Ejecuté TEST 1 (conexión básica)
- [ ] Ejecuté TEST 2 (selected tool)
- [ ] Ejecuté TEST 3 (selected color)
- [ ] Ejecuté TEST 4 (fog of war)
- [ ] Ejecuté TEST 5 (puertas)
- [ ] Ejecuté TEST 6 (paredes)
- [ ] Ejecuté TEST 7 (dibujos)
- [ ] Copié TODOS los logs de console
- [ ] Anoté exactamente en qué test falla

**Formato de reporte:**
```
TEST [número]: [NOMBRE]
ACCIÓN: [lo que hice]
LOGS GM: [copiar logs completos]
LOGS PLAYER: [copiar logs completos]
RESULTADO VISUAL: [qué pasó visualmente]
FALLA EN: [dónde se rompe la cadena]
```

---

**¡EJECUTA ESTOS TESTS Y REPORTA EXACTAMENTE DÓNDE FALLA!**
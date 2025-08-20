# 🔧 TROUBLESHOOTING SINCRONIZACIÓN - PASO A PASO

## 🚨 DIAGNÓSTICO COMPLETO

### ⚡ PASO 1: VERIFICAR CONEXIÓN BÁSICA

**1.1 Abrir dos ventanas del navegador:**
- Ventana 1: http://localhost:5173/
- Ventana 2: http://localhost:5173/

**1.2 En AMBAS ventanas, abrir F12 → Console**

**1.3 En Ventana 1 (GM):**
- Click "Connect to Firebase"
- ¿Aparece "Connected to Firebase"? ✅/❌
- ¿Hay errores rojos en console? ✅/❌

**1.4 En Ventana 2 (Player):**
- Click "Connect to Firebase"
- ¿Aparece "Connected to Firebase"? ✅/❌
- ¿Hay errores rojos en console? ✅/❌

**SI FALLA AQUÍ:** Problema de configuración Firebase

---

### 🎮 PASO 2: VERIFICAR CREACIÓN DE SESIÓN

**2.1 En Ventana 1 (GM):**
- Llenar "Session Name": "Test123"
- Llenar "Your Name": "GM"
- Click "Create Session"

**2.2 Verificar en Console (Ventana 1):**
```
¿Aparece "🔥 FirebaseService.createSession called"? ✅/❌
¿Aparece "✅ Session created successfully"? ✅/❌
¿Aparece un TOKEN (ej: "ABC123")? ✅/❌
```

**2.3 En Ventana 2 (Player):**
- Llenar "Session Token": [TOKEN del GM]
- Llenar "Your Name": "Player1"
- Click "Join Session"

**2.4 Verificar en Console (Ventana 2):**
```
¿Aparece "🔥 FirebaseService.joinSession called"? ✅/❌
¿Aparece "✅ Joined session successfully"? ✅/❌
¿Aparece "Session state changed: {inSession: true}"? ✅/❌
```

**SI FALLA AQUÍ:** Problema de sesiones Firebase

---

### 🎭 PASO 3: TEST CRÍTICO - TOKENS

**3.1 En Ventana 1 (GM):**
- Click "Add Token" → "Add Ally"
- Llenar nombre: "TestToken"
- Click "Add"

**3.2 Verificar Logs GM (Console Ventana 1):**
```
¿Aparece "🔥 syncAddToken called"? ✅/❌
¿Aparece "🚀 Calling multiplayerService.syncTokenAdd"? ✅/❌
¿Aparece "🔥 FirebaseService.syncTokenAdd called"? ✅/❌
¿Aparece "🚀 Updating game state in Firebase"? ✅/❌
¿Aparece "✅ Game update sent successfully"? ✅/❌
```

**3.3 Verificar Logs Player (Console Ventana 2):**
```
¿Aparece "🔥 Firebase gameState changed, processing"? ✅/❌
¿Aparece "🔄 Processing game state changes"? ✅/❌
¿Aparece "📦 Syncing tokens: 1"? ✅/❌
¿Aparece "🔄 Applying remote update: token_sync_all"? ✅/❌
```

**3.4 Verificar Visual:**
- ¿El Player VE el token en la grilla? ✅/❌

**SI FALLA AQUÍ:** Problema en cadena de sincronización

---

### 🔍 PASO 4: VERIFICAR FIREBASE CONSOLE

**4.1 Ir a Firebase Console:**
- https://console.firebase.google.com/project/dyd5e-battle-grid/database

**4.2 Navegar a:**
- `sessions` → `[TOKEN]` → `gameState` → `tokens`

**4.3 Verificar:**
- ¿Existe el nodo `tokens`? ✅/❌
- ¿Hay un token con el nombre "TestToken"? ✅/❌
- ¿Tiene propiedades como `id`, `type`, `x`, `y`? ✅/❌

**SI FALLA AQUÍ:** Problema de escritura Firebase

---

### 🎨 PASO 5: TEST HERRAMIENTAS

**5.1 En Ventana 1 (GM):**
- Click herramienta "Draw" (lápiz)
- Cambiar color a ROJO

**5.2 Verificar Logs GM:**
```
¿Aparece "🎨 Syncing selected tool: draw"? ✅/❌
¿Aparece "🎨 Syncing selected color: #ff0000"? ✅/❌
```

**5.3 Verificar Visual Player:**
- ¿El Player ve "Draw" seleccionado? ✅/❌
- ¿El Player ve color ROJO seleccionado? ✅/❌

---

### 🌫️ PASO 6: TEST FOG OF WAR

**6.1 En Ventana 1 (GM):**
- Click "Toggle Fog of War" (ojo)
- Click "Clear Fog of War"

**6.2 Verificar Logs:**
```
¿Aparece "🌫️ Syncing fog of war"? ✅/❌
```

**6.3 Verificar Visual:**
- ¿El Player ve los cambios de fog? ✅/❌

---

## 🚨 DIAGNÓSTICO DE ERRORES

### ❌ ERROR 1: "Not connected to Firebase"

**Causa:** Configuración Firebase incorrecta

**Solución:**
1. Verificar `src/config/firebase.ts`
2. Verificar que las credenciales sean correctas
3. Verificar reglas de Firebase Database

### ❌ ERROR 2: "Session not found"

**Causa:** Token incorrecto o sesión expirada

**Solución:**
1. Crear nueva sesión
2. Copiar token exacto (sin espacios)
3. Verificar que GM esté conectado

### ❌ ERROR 3: Logs aparecen pero no hay sincronización visual

**Causa:** Problema en `useMultiplayerSync` o `applyRemoteUpdate`

**Solución:**
1. Verificar que `isApplyingRemoteUpdate.current` no esté bloqueado
2. Verificar que los setters (`setTokens`, etc.) funcionen
3. Verificar que los tipos de update coincidan

### ❌ ERROR 4: "🔥 Firebase gameState changed" no aparece

**Causa:** Listener no configurado o Firebase no actualiza

**Solución:**
1. Verificar `setupSessionListeners`
2. Verificar permisos Firebase
3. Verificar que `updateGameState` escriba correctamente

---

## 🔧 COMANDOS DE DEBUG MANUAL

**En Console del Navegador (F12):**

```javascript
// 1. Verificar estado de conexión
console.log('=== ESTADO CONEXIÓN ===');
console.log('Connected:', multiplayerService.isConnected());
console.log('Session ID:', multiplayerService.getCurrentSessionId());
console.log('Player ID:', multiplayerService.getCurrentPlayerId());
console.log('Is GM:', multiplayerService.isGameMaster());

// 2. Test manual de token
console.log('=== TEST MANUAL TOKEN ===');
const testToken = {
  id: 'manual-test-' + Date.now(),
  type: 'ally',
  x: 10,
  y: 10,
  color: '#00ff00',
  name: 'Manual Test'
};
multiplayerService.syncTokenAdd(testToken);
console.log('Token manual enviado:', testToken);

// 3. Verificar listeners
console.log('=== VERIFICAR LISTENERS ===');
// Esto debería mostrar si los callbacks están configurados
console.log('Callbacks configurados:', {
  onGameUpdate: !!multiplayerService.onGameUpdateCallback,
  onSessionJoined: !!multiplayerService.onSessionJoinedCallback
});
```

---

## 🎯 SOLUCIONES RÁPIDAS

### 🔄 Solución 1: Reset Completo

1. **Refresh ambas ventanas** (F5)
2. **GM**: Crear nueva sesión con nombre diferente
3. **Player**: Unirse con nuevo token
4. **Probar** agregar token inmediatamente

### 🔄 Solución 2: Limpiar Firebase

1. **Firebase Console** → Database
2. **Eliminar** nodo `sessions` completo
3. **Refresh** aplicación
4. **Crear** nueva sesión

### 🔄 Solución 3: Verificar Reglas Firebase

**En Firebase Console → Database → Rules:**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## 📞 REPORTE DE PROBLEMA

**Si nada funciona, reportar:**

1. **Resultados de PASO 1-6** (✅/❌ para cada punto)
2. **Logs completos** de Console (copiar/pegar)
3. **Screenshots** de Firebase Console
4. **Errores específicos** (texto exacto)

**Ejemplo de reporte:**
```
PASO 1: ✅ Ambas ventanas conectan
PASO 2: ✅ Sesión se crea, ❌ Player no puede unirse
PASO 3: ❌ No aparece "syncAddToken called"
ERROR: "Session not found" en Player
LOGS: [pegar logs aquí]
```

---

## 🎯 CHECKLIST FINAL

**Antes de reportar problema:**
- [ ] Probé con dos ventanas diferentes
- [ ] Verifiqué logs en F12 → Console
- [ ] Probé crear nueva sesión
- [ ] Verifiqué Firebase Console
- [ ] Ejecuté comandos de debug manual
- [ ] Probé reset completo

**¡Con este diagnóstico deberíamos encontrar exactamente dónde está el problema! 🔍🔥**
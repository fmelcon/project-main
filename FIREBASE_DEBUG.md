# 🔥 Firebase Debug - Sincronización en Tiempo Real

## 🐛 Problema Actual

**Síntoma:** Los cambios del GM no se ven en los Players y viceversa.

**Estado:** 
- ✅ Firebase conecta correctamente
- ✅ Sesiones se crean y jugadores se unen
- ❌ Cambios no se sincronizan en tiempo real

## 🔍 Diagnóstico Paso a Paso

### 1. 🧪 Test Manual de Sincronización

**Abrir dos ventanas del navegador:**

**Ventana 1 (GM):**
1. F12 → Console
2. Connect to Firebase
3. Create Session (Become GM)
4. Agregar un token
5. **Verificar logs:**
   ```
   ¿Aparece "syncTokenAdd called"?
   ¿Aparece "Firebase: token added to database"?
   ```

**Ventana 2 (Player):**
1. F12 → Console
2. Connect to Firebase
3. Join as Player (usar token del GM)
4. **Verificar logs:**
   ```
   ¿Aparece "Game state updated"?
   ¿Aparece "Applying remote update: token_sync_all"?
   ¿Ve el token del GM?
   ```

### 2. 🔍 Verificar Firebase Console

**Ve a:** https://console.firebase.google.com/project/dyd5e-battle-grid/database

**Navega a:** `sessions/[TOKEN]/gameState/tokens`

**Verificar:**
- ✅ ¿Aparecen tokens cuando GM los agrega?
- ✅ ¿Se actualizan en tiempo real?
- ✅ ¿Tienen la estructura correcta?

### 3. 🔧 Posibles Problemas

#### A. Problema en App.tsx
**Síntoma:** Los métodos sync* no se llaman
**Verificar:**
```typescript
// En addToken, moveToken, etc.
multiplayerSync.syncAddToken(newToken); // ¿Se ejecuta?
```

#### B. Problema en useMultiplayerSync
**Síntoma:** Los métodos sync* no llegan a FirebaseService
**Verificar:**
```typescript
// En useMultiplayerSync.ts
syncAddToken: (token: any) => {
  console.log('syncAddToken called:', token); // ¿Aparece?
  multiplayerService.syncTokenAdd(token);
}
```

#### C. Problema en MultiplayerService
**Síntoma:** Las llamadas no llegan a Firebase
**Verificar:**
```typescript
// En MultiplayerService.ts
syncTokenAdd(token: any): void {
  console.log('MultiplayerService.syncTokenAdd:', token); // ¿Aparece?
  this.service.syncTokenAdd(token);
}
```

#### D. Problema en FirebaseService
**Síntoma:** Los datos no se guardan en Firebase
**Verificar:**
```typescript
// En FirebaseService.ts
syncTokenAdd(token: any): void {
  console.log('FirebaseService.syncTokenAdd:', token); // ¿Aparece?
  this.sendGameUpdate({ type: 'token_add', data: token });
}
```

#### E. Problema en updateGameState
**Síntoma:** Los datos no se escriben correctamente
**Verificar:**
```typescript
case 'token_add':
  console.log('Writing token to Firebase:', update.data); // ¿Aparece?
  const tokenRef = ref(this.database, `sessions/${this.currentSessionId}/gameState/tokens/${update.data.id}`);
  await set(tokenRef, update.data);
```

### 4. 🛠️ Debug Commands

**En Console del Navegador (F12):**

```javascript
// Test 1: Verificar servicio activo
console.log('Multiplayer service type:', window.multiplayerService?.getServiceType());

// Test 2: Verificar conexión
console.log('Is connected:', window.multiplayerService?.isConnected());

// Test 3: Verificar sesión
console.log('Current session:', window.multiplayerService?.getCurrentSessionId());

// Test 4: Test manual de sync
window.multiplayerService?.syncTokenAdd({
  id: 'test-token',
  type: 'ally',
  x: 5,
  y: 5,
  color: '#ff0000',
  name: 'Test Token'
});
```

### 5. 🔧 Soluciones Rápidas

#### A. Si no aparecen logs de sync:
**Problema:** Los métodos sync no se están llamando
**Solución:** Verificar que App.tsx llame a multiplayerSync.sync*

#### B. Si los logs aparecen pero no llegan a Firebase:
**Problema:** FirebaseService no está escribiendo
**Solución:** Verificar updateGameState y permisos de Firebase

#### C. Si los datos llegan a Firebase pero no se sincronizan:
**Problema:** Los listeners no están funcionando
**Solución:** Verificar setupSessionListeners y processGameStateChanges

#### D. Si aparecen loops infinitos:
**Problema:** Los updates se re-envían constantemente
**Solución:** Verificar que playerId: 'firebase-sync' se ignore correctamente

### 6. 📊 Estructura Esperada en Firebase

```json
{
  "sessions": {
    "XO3LUI": {
      "gameState": {
        "tokens": {
          "token-123": {
            "id": "token-123",
            "type": "ally",
            "x": 5,
            "y": 5,
            "color": "#ff0000",
            "name": "Test Token"
          }
        },
        "drawingData": {},
        "fogOfWar": [],
        "doors": {},
        "walls": {},
        "version": 1703123456789
      },
      "players": {
        "gm-id": {
          "name": "GM",
          "role": "gm"
        },
        "player-id": {
          "name": "Player",
          "role": "player"
        }
      }
    }
  }
}
```

### 7. 🚨 Checklist de Debugging

**Antes de reportar problema:**
- [ ] Verificar logs en Console (F12)
- [ ] Verificar datos en Firebase Console
- [ ] Probar con dos ventanas diferentes
- [ ] Verificar que ambos usen el mismo token
- [ ] Verificar que ambos estén "Connected to Firebase"
- [ ] Probar agregar token simple
- [ ] Verificar estructura de datos en Firebase

### 8. 🆘 Información para Debug

**Si el problema persiste, proporcionar:**
1. **Logs de Console** (ambas ventanas)
2. **Screenshot de Firebase Console** (gameState)
3. **Token de sesión** usado
4. **Pasos exactos** para reproducir
5. **Navegador y versión** usados

---

## 🎯 Próximos Pasos

1. **Ejecutar diagnóstico** paso a paso
2. **Identificar** dónde se rompe la cadena
3. **Aplicar solución** específica
4. **Verificar** que funciona en tiempo real

**¡Con este diagnóstico deberíamos identificar exactamente dónde está el problema! 🔍🔥**
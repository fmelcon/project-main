# 🔥 Firebase Configurado - D&D Combat Grid

¡Tu proyecto Firebase ya está configurado y listo para usar!

## ✅ Configuración Actual

**Proyecto Firebase:** `dyd5e-battle-grid`

**Servicios Configurados:**
- 🔐 **Authentication**: Autenticación anónima
- 💾 **Realtime Database**: Base de datos en tiempo real
- 🌐 **Hosting**: Opcional para deployment

## 🚀 Pasos Restantes

### 1. Habilitar Authentication

1. Ve a [Firebase Console](https://console.firebase.google.com/project/dyd5e-battle-grid)
2. Click en **"Authentication"** en el menú lateral
3. Click en **"Get started"**
4. Ve a la pestaña **"Sign-in method"**
5. Click en **"Anonymous"**
6. **Habilita** el toggle "Enable"
7. Click **"Save"**

### 2. Crear Realtime Database

1. En Firebase Console, click en **"Realtime Database"**
2. Click en **"Create Database"**
3. **Ubicación**: Selecciona la más cercana:
   - `us-central1` (Estados Unidos)
   - `europe-west1` (Europa)
4. **Reglas**: Selecciona **"Start in test mode"**
5. Click **"Enable"**

### 3. Configurar Reglas de Seguridad

1. En **Realtime Database**, ve a **"Rules"**
2. Reemplaza con estas reglas:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['id', 'name', 'gmId', 'players', 'gameState'])"
      }
    },
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid",
        ".validate": "newData.hasChildren(['online', 'lastSeen'])"
      }
    }
  }
}
```

3. Click **"Publish"**

## 🧪 Probar la Configuración

1. **Ejecuta tu aplicación:**
   ```bash
   npm run dev
   ```

2. **Ve al panel Multiplayer**

3. **Click "Connect to Firebase"**

4. **Si todo está bien configurado:**
   - Verás "Connected to Firebase"
   - Badge "🔥 Realtime" aparecerá

5. **Crear sesión de prueba:**
   - Click "Create Session (Become GM)"
   - Ingresa nombre de sesión y tu nombre
   - Deberías ver el token generado

6. **Verificar en Firebase Console:**
   - Ve a Realtime Database → Data
   - Deberías ver aparecer datos en `sessions/`

## 🌐 Para Deployment

### Netlify/Vercel

Los valores ya están configurados por defecto en el código, así que tu app funcionará inmediatamente al hacer deploy.

### Variables de Entorno (Opcional)

Si quieres usar variables de entorno:

1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Los valores ya están configurados correctamente

## 🔒 Seguridad

**Para Desarrollo:**
- ✅ Las credenciales están en el código (OK para desarrollo)
- ✅ Reglas de test mode (permisivas pero funcionales)

**Para Producción:**
- 🔐 Usar variables de entorno
- 🛡️ Configurar reglas más restrictivas
- 🌐 Configurar dominios autorizados

## 📊 Monitoreo

**Ver Actividad en Tiempo Real:**
1. Firebase Console → Authentication → Users (usuarios anónimos)
2. Realtime Database → Data (datos de sesiones)
3. Analytics → Dashboard (si habilitaste Analytics)

## 🐛 Troubleshooting

**Si ves "Firebase not configured":**
- ✅ Verifica que Authentication esté habilitado
- ✅ Verifica que Realtime Database esté creado
- ✅ Revisa la consola del navegador para errores

**Si no se conecta:**
- ✅ Verifica las reglas de Realtime Database
- ✅ Asegúrate que la URL de database sea correcta

**Si los datos no se sincronizan:**
- ✅ Abre Firebase Console → Realtime Database → Data
- ✅ Verifica que aparezcan datos ahí
- ✅ Revisa la consola del navegador

## 🎯 URLs Importantes

- **Firebase Console:** https://console.firebase.google.com/project/dyd5e-battle-grid
- **Authentication:** https://console.firebase.google.com/project/dyd5e-battle-grid/authentication
- **Realtime Database:** https://console.firebase.google.com/project/dyd5e-battle-grid/database
- **Project Settings:** https://console.firebase.google.com/project/dyd5e-battle-grid/settings/general

## 💰 Costos

**Plan Spark (Gratuito):**
- 💾 1GB almacenamiento Realtime Database
- 📡 10GB/mes transferencia
- 🔐 Authentication ilimitado

**Para tu uso típico de D&D:**
- 👥 50-100 sesiones simultáneas sin problemas
- 📊 1-5MB por sesión
- 💸 **Plan gratuito es más que suficiente**

---

## 🎮 ¡Listo para Jugar!

Una vez completados los pasos 1-3, tu D&D Combat Grid tendrá:

- 🔥 **Multijugador en tiempo real**
- 👑 **Roles GM/Player automáticos**
- 🎫 **Tokens simples para unirse**
- ⚡ **Sincronización instantánea**
- 🛡️ **Infraestructura confiable de Google**

**¡Disfruta tus aventuras épicas! 🎲⚔️🐉**
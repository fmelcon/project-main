# 🔥 Guía de Configuración Firebase para D&D Combat Grid

Esta guía te ayudará a configurar Firebase para habilitar el multijugador en tiempo real.

## 📋 Pasos de Configuración

### 1. 🚀 Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Click en **"Crear un proyecto"** o **"Add project"**
3. Ingresa el nombre: `dnd-combat-grid` (o el que prefieras)
4. **Opcional**: Habilita Google Analytics (recomendado)
5. Click **"Crear proyecto"**
6. Espera a que se complete la configuración

### 2. 🔐 Configurar Authentication

1. En el panel izquierdo, click en **"Authentication"**
2. Click en **"Get started"** si es la primera vez
3. Ve a la pestaña **"Sign-in method"**
4. Click en **"Anonymous"**
5. **Habilita** el toggle "Enable"
6. Click **"Save"**

### 3. 💾 Configurar Realtime Database

1. En el panel izquierdo, click en **"Realtime Database"**
2. Click en **"Create Database"**
3. **Ubicación**: Elige la más cercana a tus usuarios:
   - `us-central1` (Estados Unidos)
   - `europe-west1` (Europa)
   - `asia-southeast1` (Asia)
4. **Reglas de seguridad**: Selecciona **"Start in test mode"**
5. Click **"Enable"**

### 4. 🛡️ Configurar Reglas de Seguridad

1. En **Realtime Database**, ve a la pestaña **"Rules"**
2. Reemplaza las reglas con:

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

### 5. 🔑 Obtener Credenciales

1. Click en el ⚙️ **Settings** (configuración) en el panel izquierdo
2. Selecciona **"Project settings"**
3. Scroll hacia abajo hasta **"Your apps"**
4. Click en **"</> Web"** (icono de código)
5. **Nombre de la app**: `D&D Combat Grid`
6. **Opcional**: Habilita Firebase Hosting
7. Click **"Register app"**
8. **¡IMPORTANTE!** Copia la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};
```

## 🔧 Configurar en tu Aplicación

### Opción 1: Variables de Entorno (Recomendado)

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu-proyecto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
```

2. **¡IMPORTANTE!** Agrega `.env.local` a tu `.gitignore`:

```gitignore
# Environment variables
.env.local
.env.*.local
```

### Opción 2: Configuración Directa (Solo para Testing)

1. Edita `src/config/firebase.ts`
2. Reemplaza los valores demo con tus credenciales reales

## 🧪 Probar la Configuración

1. Ejecuta tu aplicación: `npm run dev`
2. Ve al panel **Multiplayer**
3. Click **"Connect to Firebase"**
4. Si todo está bien configurado, verás **"Connected to Firebase"**
5. Crea una sesión de prueba
6. En Firebase Console → Realtime Database, deberías ver los datos aparecer en tiempo real

## 🌐 Deployment en Producción

### Netlify

1. En Netlify Dashboard → Site settings → Environment variables
2. Agrega todas las variables `VITE_FIREBASE_*`
3. Redeploy tu sitio

### Vercel

1. En Vercel Dashboard → Project → Settings → Environment Variables
2. Agrega todas las variables `VITE_FIREBASE_*`
3. Redeploy

### Firebase Hosting (Opción nativa)

1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Inicializa: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 🔒 Seguridad en Producción

### Reglas Más Restrictivas (Opcional)

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && (data.child('gmId').val() === auth.uid || !data.exists())",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || data.parent().child('gmId').val() === auth.uid"
          }
        }
      }
    },
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

### Configurar Dominios Autorizados

1. Authentication → Settings → Authorized domains
2. Agrega tu dominio de producción: `tu-app.netlify.app`

## 📊 Monitoreo y Analytics

### Ver Usuarios en Tiempo Real

1. Firebase Console → Authentication → Users
2. Verás usuarios anónimos conectados

### Ver Datos en Tiempo Real

1. Realtime Database → Data
2. Expande `sessions` para ver sesiones activas
3. Los datos se actualizan en tiempo real

### Métricas de Uso

1. Analytics → Dashboard (si habilitaste Analytics)
2. Ve usuarios activos, sesiones, etc.

## 🐛 Troubleshooting

### Error: "Firebase not configured"

- ✅ Verifica que las variables de entorno estén correctas
- ✅ Reinicia el servidor de desarrollo
- ✅ Revisa la consola del navegador para errores

### Error: "Permission denied"

- ✅ Verifica las reglas de Realtime Database
- ✅ Asegúrate que Anonymous auth esté habilitado

### Error: "Network request failed"

- ✅ Verifica la URL de databaseURL
- ✅ Revisa que el proyecto esté activo en Firebase

### Datos no se sincronizan

- ✅ Abre Firebase Console → Realtime Database → Data
- ✅ Verifica que los datos aparezcan ahí
- ✅ Revisa la consola del navegador

## 💰 Costos y Límites

### Plan Spark (Gratuito)

- **Realtime Database**: 1GB almacenamiento, 10GB/mes transferencia
- **Authentication**: Ilimitado
- **Hosting**: 10GB almacenamiento, 360MB/día transferencia

### Para Uso Normal de D&D

- **Sesiones simultáneas**: ~50-100 sin problemas
- **Datos por sesión**: ~1-5MB
- **Transferencia**: Muy baja, principalmente updates pequeños

**¡El plan gratuito es más que suficiente para uso normal!**

## 🎯 Resumen de Credenciales Necesarias

Para que tu aplicación funcione, necesitas estos 7 valores de Firebase:

```bash
VITE_FIREBASE_API_KEY=          # Clave API
VITE_FIREBASE_AUTH_DOMAIN=      # Dominio de autenticación  
VITE_FIREBASE_DATABASE_URL=     # URL de Realtime Database
VITE_FIREBASE_PROJECT_ID=       # ID del proyecto
VITE_FIREBASE_STORAGE_BUCKET=   # Bucket de almacenamiento
VITE_FIREBASE_MESSAGING_SENDER_ID= # ID del remitente
VITE_FIREBASE_APP_ID=           # ID de la aplicación
```

**¡Con estos datos tu D&D Combat Grid tendrá multijugador en tiempo real! 🔥🎲⚔️**
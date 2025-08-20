# 🔥 Firebase Troubleshooting - Connection Failed

## 🚨 Error: "Connection failed"

### 🔍 Diagnóstico Paso a Paso

#### 1. 🌐 Verificar Consola del Navegador

**Abrir DevTools:**
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña **"Console"**
- Busca errores en rojo relacionados con Firebase

**Errores Comunes:**

```javascript
// Error 1: Authentication no habilitado
"auth/operation-not-allowed"
"Anonymous sign-in is disabled"

// Error 2: Realtime Database no existe
"database/permission-denied"
"Database not found"

// Error 3: Reglas restrictivas
"permission-denied"
"Client doesn't have permission"

// Error 4: Configuración incorrecta
"app/invalid-api-key"
"app/project-not-found"
```

#### 2. ✅ Verificar Configuración Firebase

**En Firebase Console:**

**A. Authentication:**
1. Ve a: https://console.firebase.google.com/project/dyd5e-battle-grid/authentication
2. ¿Dice "Get started" o ya está configurado?
3. Si está configurado, ve a **"Sign-in method"**
4. ¿"Anonymous" está **ENABLED** (verde)?

**B. Realtime Database:**
1. Ve a: https://console.firebase.google.com/project/dyd5e-battle-grid/database
2. ¿Existe la base de datos o dice "Create Database"?
3. Si existe, ¿hay una URL como `https://dyd5e-battle-grid-default-rtdb.firebaseio.com`?

**C. Reglas de Database:**
1. En Realtime Database → **"Rules"**
2. ¿Las reglas son estas?

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    },
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

#### 3. 🔧 Soluciones por Error

### 🔐 Error: Authentication

**Síntomas:**
- "Anonymous sign-in is disabled"
- "auth/operation-not-allowed"

**Solución:**
1. Firebase Console → Authentication
2. Click **"Get started"** (si aparece)
3. Pestaña **"Sign-in method"**
4. Click **"Anonymous"**
5. Toggle **"Enable"** → **Save**

### 💾 Error: Database No Existe

**Síntomas:**
- "Database not found"
- "permission-denied"

**Solución:**
1. Firebase Console → Realtime Database
2. Click **"Create Database"**
3. Ubicación: **us-central1** (o la más cercana)
4. Reglas: **"Start in test mode"**
5. Click **"Enable"**

### 🛡️ Error: Reglas Restrictivas

**Síntomas:**
- "permission-denied"
- "Client doesn't have permission"

**Solución:**
1. Realtime Database → **"Rules"**
2. Reemplazar con:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. Click **"Publish"**
4. **Nota:** Estas son reglas de desarrollo, muy permisivas

### ⚙️ Error: Configuración

**Síntomas:**
- "app/invalid-api-key"
- "app/project-not-found"

**Solución:**
1. Verificar que el proyecto ID sea correcto: `dyd5e-battle-grid`
2. Verificar que la API key sea correcta
3. En Firebase Console → Project Settings → General
4. Comparar con `src/config/firebase.ts`

## 🧪 Test de Conexión Manual

### Método 1: Console del Navegador

1. Abre DevTools → Console
2. Pega este código:

```javascript
// Test básico de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBeO8XCs8HVGkrGtpPJ-LCSx6NDIxHIwQ0",
  authDomain: "dyd5e-battle-grid.firebaseapp.com",
  databaseURL: "https://dyd5e-battle-grid-default-rtdb.firebaseio.com",
  projectId: "dyd5e-battle-grid",
  storageBucket: "dyd5e-battle-grid.firebasestorage.app",
  messagingSenderId: "414308320347",
  appId: "1:414308320347:web:67780b5edd74ccfa56eb7e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Test de autenticación
signInAnonymously(auth)
  .then((userCredential) => {
    console.log('✅ Authentication OK:', userCredential.user.uid);
    
    // Test de database
    const testRef = ref(database, 'test');
    return set(testRef, { message: 'Hello Firebase!', timestamp: Date.now() });
  })
  .then(() => {
    console.log('✅ Database write OK');
  })
  .catch((error) => {
    console.error('❌ Firebase Error:', error.code, error.message);
  });
```

### Método 2: Verificación Visual

1. **En la app**, click **"Connect to Firebase"**
2. **Abre Firebase Console** → Realtime Database → Data
3. **Refresca** la página del console
4. ¿Aparecen datos nuevos en tiempo real?

## 📋 Checklist de Verificación

### ✅ Firebase Console

- [ ] **Proyecto existe**: `dyd5e-battle-grid`
- [ ] **Authentication habilitado**: Anonymous = ON
- [ ] **Realtime Database creado**: URL existe
- [ ] **Reglas configuradas**: Permisivas para desarrollo
- [ ] **Sin errores** en Firebase Console

### ✅ Aplicación

- [ ] **Servidor corriendo**: `npm run dev` activo
- [ ] **Sin errores** en terminal
- [ ] **Firebase config correcto**: `src/config/firebase.ts`
- [ ] **Dependencias instaladas**: `firebase` en package.json

### ✅ Navegador

- [ ] **Sin errores** en Console (F12)
- [ ] **Network tab**: Requests a Firebase exitosos
- [ ] **Application tab**: Firebase SDK cargado

## 🚀 Solución Rápida (Reset Completo)

Si nada funciona, prueba esto:

### 1. Reglas Ultra-Permisivas

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 2. Test con Configuración Mínima

Crea `test-firebase.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Firebase Test</title>
</head>
<body>
    <h1>Firebase Connection Test</h1>
    <button id="testBtn">Test Connection</button>
    <div id="result"></div>

    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

        const firebaseConfig = {
            apiKey: "AIzaSyBeO8XCs8HVGkrGtpPJ-LCSx6NDIxHIwQ0",
            authDomain: "dyd5e-battle-grid.firebaseapp.com",
            databaseURL: "https://dyd5e-battle-grid-default-rtdb.firebaseio.com",
            projectId: "dyd5e-battle-grid",
            storageBucket: "dyd5e-battle-grid.firebasestorage.app",
            messagingSenderId: "414308320347",
            appId: "1:414308320347:web:67780b5edd74ccfa56eb7e"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const database = getDatabase(app);

        document.getElementById('testBtn').onclick = async () => {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing...';
            
            try {
                const userCredential = await signInAnonymously(auth);
                result.innerHTML += '<br>✅ Auth OK: ' + userCredential.user.uid;
                
                const testRef = ref(database, 'test');
                await set(testRef, { test: true, time: Date.now() });
                result.innerHTML += '<br>✅ Database OK';
                
                result.innerHTML += '<br><strong>🎉 Firebase Working!</strong>';
            } catch (error) {
                result.innerHTML = '❌ Error: ' + error.code + ' - ' + error.message;
            }
        };
    </script>
</body>
</html>
```

### 3. Verificar en Firebase Console

Después del test, ve a:
- **Authentication → Users**: ¿Aparece un usuario anónimo?
- **Realtime Database → Data**: ¿Aparece el nodo "test"?

## 📞 Contacto de Emergencia

Si nada funciona:

1. **Copia el error exacto** de la consola del navegador
2. **Screenshot** de Firebase Console (Authentication + Database)
3. **Verifica** que el proyecto `dyd5e-battle-grid` sea tuyo

---

**¡La mayoría de problemas se resuelven habilitando Authentication y creando la Realtime Database! 🔥✅**
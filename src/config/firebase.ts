/**
 * Configuración de Firebase
 * Para usar en producción, configura las variables de entorno
 */

export const firebaseConfig = {
  // Configuración real del proyecto Firebase
  // En producción, usar variables de entorno para mayor seguridad
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBeO8XCs8HVGkrGtpPJ-LCSx6NDIxHIwQ0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dyd5e-battle-grid.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://dyd5e-battle-grid-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dyd5e-battle-grid",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dyd5e-battle-grid.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "414308320347",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:414308320347:web:67780b5edd74ccfa56eb7e"
};

// Verificar si Firebase está configurado correctamente
export const isFirebaseConfigured = (): boolean => {
  // En desarrollo, siempre retornar true para usar la configuración demo
  if (import.meta.env.DEV) {
    return true;
  }
  
  // En producción, verificar que todas las variables estén configuradas
  return !!(import.meta.env.VITE_FIREBASE_API_KEY &&
           import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
           import.meta.env.VITE_FIREBASE_DATABASE_URL &&
           import.meta.env.VITE_FIREBASE_PROJECT_ID);
};

// Instrucciones para configurar Firebase
export const firebaseSetupInstructions = `
🔥 CONFIGURACIÓN DE FIREBASE:

1. Crear proyecto en Firebase Console (https://console.firebase.google.com)
2. Habilitar Authentication > Sign-in method > Anonymous
3. Habilitar Realtime Database
4. Configurar reglas de seguridad:

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

5. Agregar variables de entorno:

VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu_proyecto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
`;

console.log('🔥 Firebase config loaded:', {
  configured: isFirebaseConfigured(),
  environment: import.meta.env.DEV ? 'development' : 'production',
  projectId: firebaseConfig.projectId
});

if (!isFirebaseConfigured() && !import.meta.env.DEV) {
  console.warn('⚠️ Firebase not configured for production!');
  console.log(firebaseSetupInstructions);
}
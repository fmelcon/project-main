/**
 * Servidor WebSocket para D&D Combat Grid
 * Maneja sesiones multijugador y sincronización en tiempo real
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Configuración del servidor
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

// Almacenamiento en memoria (en producción usar base de datos)
const sessions = new Map();
const clients = new Map();

// Estructura de datos
class GameSession {
  constructor(id, name, gmId, gmName) {
    this.id = id;
    this.name = name;
    this.gmId = gmId;
    this.players = [{
      id: gmId,
      name: gmName,
      role: 'gm',
      isConnected: true,
      joinedAt: new Date()
    }];
    this.gameState = {
      tokens: [],
      drawingData: [],
      fogOfWar: [],
      doors: [],
      walls: [],
      gridType: 'square',
      backgroundImage: null,
      lastUpdated: new Date(),
      version: 1
    };
    this.createdAt = new Date();
    this.isActive = true;
  }

  addPlayer(playerId, playerName) {
    const existingPlayer = this.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      return existingPlayer;
    }

    const newPlayer = {
      id: playerId,
      name: playerName,
      role: 'player',
      isConnected: true,
      joinedAt: new Date()
    };
    this.players.push(newPlayer);
    return newPlayer;
  }

  removePlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.isConnected = false;
    }
    // No eliminar completamente para mantener historial
  }

  updateGameState(update) {
    this.gameState.lastUpdated = new Date();
    this.gameState.version++;

    switch (update.type) {
      case 'token_add':
        this.gameState.tokens.push(update.data);
        break;
      case 'token_update':
        const tokenIndex = this.gameState.tokens.findIndex(t => t.id === update.data.id);
        if (tokenIndex !== -1) {
          this.gameState.tokens[tokenIndex] = { ...this.gameState.tokens[tokenIndex], ...update.data.updates };
        }
        break;
      case 'token_remove':
        this.gameState.tokens = this.gameState.tokens.filter(t => t.id !== update.data.id);
        break;
      case 'drawing_add':
        this.gameState.drawingData.push(update.data);
        break;
      case 'drawing_clear':
        this.gameState.drawingData = [];
        break;
      case 'fog_update':
        this.gameState.fogOfWar = update.data;
        break;
      case 'door_update':
        const doorIndex = this.gameState.doors.findIndex(d => d[0] === update.data.key);
        if (doorIndex !== -1) {
          this.gameState.doors[doorIndex] = [update.data.key, update.data.door];
        } else {
          this.gameState.doors.push([update.data.key, update.data.door]);
        }
        break;
      case 'wall_update':
        const wallIndex = this.gameState.walls.findIndex(w => w[0] === update.data.key);
        if (wallIndex !== -1) {
          this.gameState.walls[wallIndex] = [update.data.key, update.data.wall];
        } else {
          this.gameState.walls.push([update.data.key, update.data.wall]);
        }
        break;
      case 'background_update':
        this.gameState.backgroundImage = update.data.backgroundImage;
        break;
    }
  }
}

class ClientConnection {
  constructor(ws, id) {
    this.ws = ws;
    this.id = id;
    this.playerId = null;
    this.sessionId = null;
    this.isAlive = true;
    this.lastPing = new Date();
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  joinSession(sessionId, playerId) {
    this.sessionId = sessionId;
    this.playerId = playerId;
  }

  leaveSession() {
    if (this.sessionId && this.playerId) {
      const session = sessions.get(this.sessionId);
      if (session) {
        session.removePlayer(this.playerId);
        broadcastToSession(this.sessionId, {
          type: 'player_left',
          playerId: this.playerId,
          timestamp: new Date()
        }, this.id);
      }
    }
    this.sessionId = null;
    this.playerId = null;
  }
}

// Utilidades
function broadcastToSession(sessionId, message, excludeClientId = null) {
  clients.forEach((client, clientId) => {
    if (client.sessionId === sessionId && clientId !== excludeClientId) {
      client.send(message);
    }
  });
}

function generateSessionId() {
  // Generar un token simple de 6 caracteres alfanuméricos
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function cleanupInactiveSessions() {
  const now = new Date();
  const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 horas

  sessions.forEach((session, sessionId) => {
    const hasActiveConnections = session.players.some(player => {
      return Array.from(clients.values()).some(client => 
        client.playerId === player.id && client.sessionId === sessionId
      );
    });

    if (!hasActiveConnections && (now - session.gameState.lastUpdated) > maxInactiveTime) {
      console.log(`Cleaning up inactive session: ${sessionId}`);
      sessions.delete(sessionId);
    }
  });
}

// Manejo de conexiones
server.on('connection', (ws) => {
  const clientId = uuidv4();
  const client = new ClientConnection(ws, clientId);
  clients.set(clientId, client);

  console.log(`Client connected: ${clientId}`);

  // Manejo de mensajes
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(client, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      client.send({
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: new Date()
      });
    }
  });

  // Manejo de desconexión
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    client.leaveSession();
    clients.delete(clientId);
  });

  // Manejo de errores
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });

  // Ping/Pong para mantener conexión
  ws.on('pong', () => {
    client.isAlive = true;
    client.lastPing = new Date();
  });
});

// Manejo de mensajes
function handleMessage(client, message) {
  console.log(`Message from ${client.id}:`, message.type);

  switch (message.type) {
    case 'join_session':
      handleJoinSession(client, message);
      break;
    case 'leave_session':
      handleLeaveSession(client, message);
      break;
    case 'game_update':
      handleGameUpdate(client, message);
      break;
    case 'ping':
      client.send({
        type: 'pong',
        timestamp: new Date()
      });
      break;
    default:
      client.send({
        type: 'error',
        data: { message: `Unknown message type: ${message.type}` },
        timestamp: new Date()
      });
  }
}

function handleJoinSession(client, message) {
  const { sessionId, playerId, playerName, data } = message;

  try {
    let session;
    let isNewSession = false;

    if (sessionId === 'create_new') {
      // Crear nueva sesión
      const newSessionId = generateSessionId();
      session = new GameSession(newSessionId, data.sessionName, playerId, playerName);
      sessions.set(newSessionId, session);
      isNewSession = true;
      console.log(`Created new session: ${newSessionId}`);
    } else {
      // Unirse a sesión existente
      session = sessions.get(sessionId);
      if (!session) {
        client.send({
          type: 'error',
          data: { message: 'Session not found' },
          timestamp: new Date()
        });
        return;
      }
      session.addPlayer(playerId, playerName);
      console.log(`Player ${playerName} joined session: ${sessionId}`);
    }

    // Actualizar cliente
    client.joinSession(session.id, playerId);

    // Enviar confirmación al cliente
    client.send({
      type: isNewSession ? 'session_created' : 'join_session',
      data: { session },
      timestamp: new Date()
    });

    // Notificar a otros jugadores (solo si no es nueva sesión)
    if (!isNewSession) {
      const newPlayer = session.players.find(p => p.id === playerId);
      broadcastToSession(session.id, {
        type: 'player_joined',
        data: { player: newPlayer },
        timestamp: new Date()
      }, client.id);
    }

  } catch (error) {
    console.error('Error handling join session:', error);
    client.send({
      type: 'error',
      data: { message: 'Failed to join session' },
      timestamp: new Date()
    });
  }
}

function handleLeaveSession(client, message) {
  client.leaveSession();
  client.send({
    type: 'leave_session',
    data: { success: true },
    timestamp: new Date()
  });
}

function handleGameUpdate(client, message) {
  if (!client.sessionId || !client.playerId) {
    client.send({
      type: 'error',
      data: { message: 'Not in a session' },
      timestamp: new Date()
    });
    return;
  }

  const session = sessions.get(client.sessionId);
  if (!session) {
    client.send({
      type: 'error',
      data: { message: 'Session not found' },
      timestamp: new Date()
    });
    return;
  }

  try {
    // Actualizar estado del juego
    session.updateGameState(message.data);

    // Retransmitir a otros clientes en la sesión
    broadcastToSession(client.sessionId, {
      type: 'game_update',
      sessionId: client.sessionId,
      playerId: client.playerId,
      data: message.data,
      timestamp: new Date()
    }, client.id);

    console.log(`Game update in session ${client.sessionId}: ${message.data.type}`);

  } catch (error) {
    console.error('Error handling game update:', error);
    client.send({
      type: 'error',
      data: { message: 'Failed to process game update' },
      timestamp: new Date()
    });
  }
}

// Ping interval para mantener conexiones vivas
const pingInterval = setInterval(() => {
  clients.forEach((client, clientId) => {
    if (!client.isAlive) {
      console.log(`Terminating inactive client: ${clientId}`);
      client.ws.terminate();
      clients.delete(clientId);
      return;
    }

    client.isAlive = false;
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.ping();
    }
  });
}, 30000); // Cada 30 segundos

// Limpieza periódica de sesiones inactivas
const cleanupInterval = setInterval(cleanupInactiveSessions, 60 * 60 * 1000); // Cada hora

// Manejo de cierre del servidor
process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  clearInterval(pingInterval);
  clearInterval(cleanupInterval);
  server.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

console.log(`D&D Combat Grid WebSocket Server running on port ${PORT}`);
console.log('Waiting for connections...');

// Estadísticas del servidor
setInterval(() => {
  console.log(`Stats - Active connections: ${clients.size}, Active sessions: ${sessions.size}`);
}, 5 * 60 * 1000); // Cada 5 minutos
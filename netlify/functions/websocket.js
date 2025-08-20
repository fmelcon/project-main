/**
 * Netlify Function para WebSocket Server
 * Maneja las conexiones WebSocket usando serverless functions
 */

const { Server } = require('ws');
const { v4: uuidv4 } = require('uuid');

// Para Netlify Functions, necesitamos usar un approach diferente
// ya que las functions son stateless

// En lugar de WebSocket tradicional, usamos Server-Sent Events o polling
// para compatibilidad con serverless

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { httpMethod, path, body } = event;
    const data = body ? JSON.parse(body) : {};

    // Simular diferentes endpoints para el WebSocket
    switch (path) {
      case '/.netlify/functions/websocket/connect':
        return handleConnect(data, headers);
      
      case '/.netlify/functions/websocket/join':
        return handleJoinSession(data, headers);
      
      case '/.netlify/functions/websocket/update':
        return handleGameUpdate(data, headers);
      
      case '/.netlify/functions/websocket/leave':
        return handleLeaveSession(data, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Handlers para diferentes operaciones
function handleConnect(data, headers) {
  const playerId = uuidv4();
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      playerId,
      message: 'Connected to serverless WebSocket alternative',
    }),
  };
}

function handleJoinSession(data, headers) {
  const { sessionId, playerId, playerName, sessionName } = data;
  
  // En un entorno real, esto se almacenaría en una base de datos
  // como FaunaDB, Supabase, o similar
  
  const session = {
    id: sessionId === 'create_new' ? generateSessionId() : sessionId,
    name: sessionName || 'Unnamed Session',
    players: [{
      id: playerId,
      name: playerName,
      role: sessionId === 'create_new' ? 'gm' : 'player',
      isConnected: true,
      joinedAt: new Date().toISOString(),
    }],
    gameState: {
      tokens: [],
      drawingData: [],
      fogOfWar: [],
      doors: [],
      walls: [],
      version: 1,
    },
    createdAt: new Date().toISOString(),
  };
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      session,
      type: sessionId === 'create_new' ? 'session_created' : 'join_session',
    }),
  };
}

function handleGameUpdate(data, headers) {
  const { sessionId, playerId, update } = data;
  
  // En un entorno real, esto actualizaría la base de datos
  // y notificaría a otros clientes via webhooks o polling
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Game update processed',
      update,
    }),
  };
}

function handleLeaveSession(data, headers) {
  const { sessionId, playerId } = data;
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Left session successfully',
    }),
  };
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
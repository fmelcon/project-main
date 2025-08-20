import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  LogIn,
  LogOut,
  Crown,
  User,
  Wifi,
  WifiOff,
  Copy,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import multiplayerService from "../services/MultiplayerService";
import { GameSession, Player, GameUpdate } from "../services/WebSocketService";

interface MultiplayerPanelProps {
  onGameUpdate: (update: GameUpdate) => void;
  onSessionStateChange: (isInSession: boolean, isGM: boolean) => void;
}

// Firebase se configura automáticamente, no necesita detección de URL

const MultiplayerPanel: React.FC<MultiplayerPanelProps> = ({
  onGameUpdate,
  onSessionStateChange,
}) => {
  // Estados de conexión
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Estados de sesión
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isInSession, setIsInSession] = useState(false);
  const [isGM, setIsGM] = useState(false);

  // Estados de UI
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [sessionIdToJoin, setSessionIdToJoin] = useState("");
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  // Firebase no necesita configuración manual de URL

  // Configurar callbacks del servicio multijugador
  useEffect(() => {
    multiplayerService.onConnected(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    multiplayerService.onDisconnected(() => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsInSession(false);
      setCurrentSession(null);
      setPlayers([]);
      onSessionStateChange(false, false);
    });

    multiplayerService.onSessionJoined((session) => {
      setCurrentSession(session);
      setPlayers(session.players);
      setIsInSession(true);
      setIsGM(multiplayerService.isGameMaster());
      setShowCreateForm(false);
      setShowJoinForm(false);
      onSessionStateChange(true, multiplayerService.isGameMaster());
    });

    multiplayerService.onPlayerJoined((player) => {
      setPlayers(prev => [...prev.filter(p => p.id !== player.id), player]);
    });

    multiplayerService.onPlayerLeft((playerId) => {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    });

    multiplayerService.onGameUpdate((update) => {
      onGameUpdate(update);
    });

    multiplayerService.onError((error) => {
      setConnectionError(error);
      setIsConnecting(false);
    });

    // Cargar configuración guardada
    const savedPlayerName = localStorage.getItem('dnd-grid-player-name');
    if (savedPlayerName) setPlayerName(savedPlayerName);

    return () => {
      // Cleanup si es necesario
    };
  }, [onGameUpdate, onSessionStateChange]);

  // Conectar al servidor
  const handleConnect = async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Firebase se conecta automáticamente
      await multiplayerService.connect();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
    }
  };

  // Desconectar del servidor
  const handleDisconnect = () => {
    multiplayerService.disconnect();
  };

  // Crear nueva sesión
  const handleCreateSession = async () => {
    if (!playerName.trim() || !sessionName.trim()) {
      setConnectionError('Please enter both session name and your name');
      return;
    }

    // Verificar si está conectado, si no, conectar primero
    if (!isConnected) {
      console.log('Not connected, connecting first...');
      setIsConnecting(true);
      try {
        await multiplayerService.connect();
      } catch (error) {
        setConnectionError('Failed to connect to Firebase');
        setIsConnecting(false);
        return;
      }
    }

    localStorage.setItem('dnd-grid-player-name', playerName);
    multiplayerService.createSession(sessionName, playerName);
  };

  // Unirse a sesión
  const handleJoinSession = async () => {
    if (!playerName.trim() || !sessionIdToJoin.trim()) {
      setConnectionError('Please enter both session token and your name');
      return;
    }

    if (sessionIdToJoin.length < 4) {
      setConnectionError('Session token must be at least 4 characters');
      return;
    }

    // Verificar si está conectado, si no, conectar primero
    if (!isConnected) {
      console.log('Not connected, connecting first...');
      setIsConnecting(true);
      try {
        await multiplayerService.connect();
      } catch (error) {
        setConnectionError('Failed to connect to Firebase');
        setIsConnecting(false);
        return;
      }
    }

    localStorage.setItem('dnd-grid-player-name', playerName);
    multiplayerService.joinSession(sessionIdToJoin, playerName);
  };

  // Abandonar sesión
  const handleLeaveSession = () => {
    multiplayerService.leaveSession();
    setIsInSession(false);
    setCurrentSession(null);
    setPlayers([]);
    setIsGM(false);
    onSessionStateChange(false, false);
  };

  // Copiar token de sesión
  const handleCopySessionId = async () => {
    if (!currentSession?.id) return;

    try {
      await navigator.clipboard.writeText(currentSession.id);
      setCopiedSessionId(true);
      setTimeout(() => setCopiedSessionId(false), 3000);
    } catch (error) {
      console.error('Failed to copy session token:', error);
    }
  };

  // Renderizar estado de conexión
  const renderConnectionStatus = () => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {isConnected ? (
          <Wifi size={16} className="text-green-400" />
        ) : (
          <WifiOff size={16} className="text-red-400" />
        )}
        <span className="text-sm font-medium">
          {isConnecting ? 'Connecting to Firebase...' : isConnected ? 'Connected to Firebase' : 'Disconnected'}
        </span>
        {isConnected && (
          <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">
            🔥 Realtime
          </span>
        )}
      </div>

      {connectionError && (
        <div className="bg-red-900/50 border border-red-600 rounded p-2 mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-sm text-red-300">{connectionError}</span>
          </div>
        </div>
      )}

      {!isConnected && (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 p-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <span className="text-lg">🔥</span>
          {isConnecting ? 'Connecting to Firebase...' : 'Connect to Firebase'}
        </button>
      )}

      {isConnected && !isInSession && (
        <button
          onClick={handleDisconnect}
          className="w-full bg-red-600 hover:bg-red-700 p-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <WifiOff size={16} />
          Disconnect
        </button>
      )}
    </div>
  );

  // Renderizar controles de sesión
  const renderSessionControls = () => {
    if (!isConnected || isInSession) return null;

    return (
      <div className="space-y-3">
        {/* Información sobre Firebase y roles */}
        <div className="bg-gray-800 rounded p-3 mb-3 border border-gray-600">
          <h5 className="font-medium text-white mb-2 flex items-center gap-2">
            <span className="text-orange-400">🔥</span>
            Firebase Realtime
          </h5>
          <div className="space-y-1 text-xs text-gray-300 mb-3">
            <div>✅ <strong>Instant sync:</strong> Changes appear immediately</div>
            <div>✅ <strong>No servers:</strong> Cloud-based, always available</div>
            <div>✅ <strong>Reliable:</strong> Google's infrastructure</div>
          </div>
          
          <h6 className="font-medium text-white mb-1 flex items-center gap-2">
            <Crown size={14} className="text-yellow-400" />
            Roles
          </h6>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Crown size={10} className="text-yellow-400" />
              <span><strong>GM:</strong> Creates session, full control</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={10} className="text-blue-400" />
              <span><strong>Players:</strong> Join with token, limited access</span>
            </div>
          </div>
        </div>

        {/* Crear sesión */}
        <div>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowJoinForm(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 p-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Crown size={16} />
            Create Session (Become GM)
          </button>

          {showCreateForm && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Session name"
              />
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Your name (Game Master)"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateSession}
                  className="flex-1 bg-green-600 hover:bg-green-700 p-2 rounded text-sm transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 bg-gray-600 hover:bg-gray-700 p-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Unirse a sesión */}
        <div>
          <button
            onClick={() => {
              setShowJoinForm(!showJoinForm);
              setShowCreateForm(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <User size={16} />
            Join as Player
          </button>

          {showJoinForm && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={sessionIdToJoin}
                onChange={(e) => setSessionIdToJoin(e.target.value.toUpperCase())}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                placeholder="Enter Session Token (e.g. ABC123)"
                maxLength={8}
              />
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Your name (Player)"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleJoinSession}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition-colors"
                >
                  Join
                </button>
                <button
                  onClick={() => setShowJoinForm(false)}
                  className="px-3 bg-gray-600 hover:bg-gray-700 p-2 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar información de sesión activa
  const renderActiveSession = () => {
    if (!isInSession || !currentSession) return null;

    return (
      <div className="space-y-3">
        {/* Info de sesión */}
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">{currentSession.name}</h4>
            {isGM && <Crown size={16} className="text-yellow-400" title="Game Master" />}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">Session Token:</span>
            <code className="text-sm bg-gray-700 px-3 py-1 rounded font-mono font-bold text-green-400">
              {currentSession.id}
            </code>
            <button
              onClick={handleCopySessionId}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Copy Session Token"
            >
              {copiedSessionId ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </button>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-600/50 rounded p-2 mb-2">
            <p className="text-xs text-blue-300">
              💡 <strong>Share this token</strong> with your players so they can join your session!
            </p>
          </div>

          <div className="text-xs text-gray-400">
            Players: {players.length} • Created: {new Date(currentSession.createdAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Lista de jugadores */}
        <div className="bg-gray-800 rounded p-3 border border-gray-600">
          <h5 className="font-medium text-white mb-2 flex items-center gap-2">
            <Users size={16} />
            Players ({players.length})
          </h5>
          
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  player.isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                {player.role === 'gm' ? (
                  <Crown size={14} className="text-yellow-400" />
                ) : (
                  <User size={14} className="text-blue-400" />
                )}
                <span className="text-sm text-white flex-1">{player.name}</span>
                {player.role === 'gm' ? (
                  <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded font-medium">
                    🎯 Game Master
                  </span>
                ) : (
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                    🎮 Player
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botón para abandonar sesión */}
        <button
          onClick={handleLeaveSession}
          className="w-full bg-red-600 hover:bg-red-700 p-2 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={16} />
          Leave Session
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          Multiplayer
        </h3>
        {isInSession && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        )}
      </div>

      {renderConnectionStatus()}
      {renderSessionControls()}
      {renderActiveSession()}
    </div>
  );
};

export default MultiplayerPanel;
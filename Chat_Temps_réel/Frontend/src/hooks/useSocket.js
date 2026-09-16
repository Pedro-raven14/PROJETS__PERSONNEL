import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../Config/api';

const useSocket = ({
  token,
  onMessage, onHistory, onTyping,
  onUserOnline, onUserOffline,
  onRoomCreated, onMessageUpdated, onDmRoomCreated,
}) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Connexion unique — ne se reconnecte que si le token change
  useEffect(() => {
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect',       ()    => setConnected(true));
    socket.on('disconnect',    ()    => setConnected(false));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    if (onMessage)        socket.on('message:new',     onMessage);
    if (onHistory)        socket.on('room:history',    onHistory);
    if (onTyping)         socket.on('typing',          onTyping);
    if (onUserOnline)     socket.on('user:online',     onUserOnline);
    if (onUserOffline)    socket.on('user:offline',    onUserOffline);
    if (onRoomCreated)    socket.on('room:created',    onRoomCreated);
    if (onMessageUpdated) socket.on('message:updated', onMessageUpdated);
    if (onDmRoomCreated)  socket.on('dm:room_created', onDmRoomCreated);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Actions exposées ──────────────────────────────────────────────────────

  // Rejoindre un salon (émet room:join → reçoit room:history)
  const joinRoom = useCallback((roomId) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('room:join', { roomId });
    }
  }, []);

  const sendMessage = useCallback((roomId, content) => {
    socketRef.current?.emit('message:send', { roomId, content });
  }, []);

  const sendTyping = useCallback((roomId, isTyping) => {
    socketRef.current?.emit('typing', { roomId, isTyping });
  }, []);

  const sendReaction = useCallback((messageId, emoji, roomId) => {
    socketRef.current?.emit('message:react', { messageId, emoji, roomId });
  }, []);

  const sendDm = useCallback((convId, content) => {
    socketRef.current?.emit('dm:send', { convId, content });
  }, []);

  const joinDmRoom = useCallback((convId) => {
    socketRef.current?.emit('dm:join', { convId });
  }, []);

  return {
    connected,
    joinRoom,
    sendMessage,
    sendTyping,
    sendReaction,
    sendDm,
    joinDmRoom,
  };
};

export default useSocket;

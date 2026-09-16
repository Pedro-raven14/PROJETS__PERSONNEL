import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import ChatArea from '../layouts/ChatArea';
import RightPanel from '../layouts/RightPanel';
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Config/api';

const Room = () => {
  const { user, token } = useAuth();
  const navigate        = useNavigate();

  const [rooms, setRooms]         = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null); // ID du salon actif

  const [dmConversations, setDmConversations] = useState([]);
  const [activeDmConvId, setActiveDmConvId]   = useState(null); // ID de la conv DM active
  const [activeDmRoomId, setActiveDmRoomId]   = useState(null); // ID de la room DM (si existe)

  const [messagesByRoom, setMessagesByRoom] = useState(new Map());
  const [typingUsers, setTypingUsers]       = useState(new Map());
  const [onlineUsers, setOnlineUsers]       = useState(new Map());
  const [allUsers, setAllUsers]             = useState([]);
  const typingTimersRef = useRef(new Map());

  // ── Données dérivées ─────────────────────────────────────────────────────────
  const activeRoom    = rooms.find(r => r.id === activeRoomId) ?? null;
  const activeDmConv  = dmConversations.find(c => c.id === activeDmConvId) ?? null;
  const activeDmUser  = activeDmConv
    ? (String(activeDmConv.user1?.id) !== String(user?.id) ? activeDmConv.user1 : activeDmConv.user2)
    : null;
  const isDmMode      = activeDmConvId !== null;

  // Messages à afficher selon le mode
  const currentMessages = isDmMode
    ? (activeDmRoomId ? (messagesByRoom.get(activeDmRoomId) || []) : [])
    : (activeRoomId   ? (messagesByRoom.get(activeRoomId)   || []) : []);

  // ── Auth guard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !token) navigate('/login', { replace: true });
  }, [user, token, navigate]);

  // ── Chargement initial ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    Promise.all([api.get('/rooms'), api.get('/users'), api.get('/dm/conversations')])
      .then(([roomsRes, usersRes, dmsRes]) => {
        const roomList = roomsRes.data;
        setRooms(roomList);
        setAllUsers(usersRes.data);
        setDmConversations(dmsRes.data);
        if (roomList.length > 0) setActiveRoomId(roomList[0].id);
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Handlers Socket.io ────────────────────────────────────────────────────────
  const handleMessage = useCallback((data) => {
    setMessagesByRoom(prev => {
      const next = new Map(prev);
      const msgs = next.get(data.roomId) || [];
      if (msgs.some(m => m.id === data.id)) return prev;
      next.set(data.roomId, [...msgs, data]);
      return next;
    });
  }, []);

  const handleHistory = useCallback(({ roomId, messages }) => {
    setMessagesByRoom(prev => {
      const next = new Map(prev);
      next.set(roomId, messages);
      return next;
    });
  }, []);

  const handleTyping = useCallback(({ userId, username, isTyping }) => {
    setTypingUsers(prev => {
      const next = new Map(prev);
      if (isTyping) {
        next.set(userId, username);
        clearTimeout(typingTimersRef.current.get(userId));
        typingTimersRef.current.set(userId, setTimeout(() => {
          setTypingUsers(p => { const n = new Map(p); n.delete(userId); return n; });
        }, 3000));
      } else {
        next.delete(userId);
      }
      return next;
    });
  }, []);

  const handleUserOnline  = useCallback(({ userId, username, avatarColor }) => {
    setOnlineUsers(prev => new Map(prev).set(userId, { id: userId, username, avatarColor, status: 'online' }));
  }, []);

  const handleUserOffline = useCallback(({ userId }) => {
    setOnlineUsers(prev => { const n = new Map(prev); n.delete(userId); return n; });
  }, []);

  const handleRoomCreated = useCallback((room) => {
    if (!room.isDm) setRooms(prev => [...prev, room]);
  }, []);

  const handleMessageUpdated = useCallback(({ id, reactions }) => {
    setMessagesByRoom(prev => {
      const next = new Map(prev);
      next.forEach((msgs, rId) => next.set(rId, msgs.map(m => m.id === id ? { ...m, reactions } : m)));
      return next;
    });
  }, []);

  const handleDmRoomCreated = useCallback(({ convId, room }) => {
    setDmConversations(prev => prev.map(c => c.id === convId ? { ...c, room } : c));
    // Si c'est la conv active, on met à jour la room DM
    setActiveDmConvId(prev => {
      if (prev === convId) setActiveDmRoomId(room.id);
      return prev;
    });
  }, []);

  // ── Socket ────────────────────────────────────────────────────────────────────
  const { connected, joinRoom, sendMessage, sendTyping, sendReaction, sendDm, joinDmRoom } = useSocket({
    token,
    onMessage:        handleMessage,
    onHistory:        handleHistory,
    onTyping:         handleTyping,
    onUserOnline:     handleUserOnline,
    onUserOffline:    handleUserOffline,
    onRoomCreated:    handleRoomCreated,
    onMessageUpdated: handleMessageUpdated,
    onDmRoomCreated:  handleDmRoomCreated,
  });

  // ── Rejoindre automatiquement un salon quand il change ────────────────────────
  useEffect(() => {
    if (!connected || !activeRoomId || isDmMode) return;
    joinRoom(activeRoomId);
  }, [connected, activeRoomId, isDmMode, joinRoom]);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const handleSelectRoom = useCallback((room) => {
    setActiveRoomId(room.id);
    setActiveDmConvId(null);
    setActiveDmRoomId(null);
    setTypingUsers(new Map());
    // joinRoom sera appelé par l'effect ci-dessus
  }, []);

  const handleSelectDmConv = useCallback((conv, targetUser) => {
    setActiveDmConvId(conv.id);
    setActiveDmRoomId(conv.room?.id ?? null);
    setActiveRoomId(null);
    setTypingUsers(new Map());

    if (conv.room?.id) {
      joinDmRoom(conv.id);
    }
  }, [joinDmRoom]);

  // ── Envoi ─────────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback((_ignored, content) => {
    if (isDmMode && activeDmConvId) {
      sendDm(activeDmConvId, content);
    } else if (activeRoomId) {
      sendMessage(activeRoomId, content);
    }
  }, [isDmMode, activeDmConvId, activeRoomId, sendDm, sendMessage]);

  // ── Objets d'affichage ────────────────────────────────────────────────────────
  const roomMembers = allUsers.map(u => ({
    ...u,
    status: onlineUsers.has(u.id) ? 'online' : (u.status || 'offline'),
  }));

  const dmParticipants = isDmMode && user && activeDmUser
    ? [
        { ...user,       status: 'online' },
        { ...activeDmUser, status: onlineUsers.has(activeDmUser.id) ? 'online' : (activeDmUser.status || 'offline') },
      ]
    : null;

  const currentRoomDisplay = isDmMode
    ? {
        id:          activeDmRoomId ?? `dm_${activeDmConvId}`,
        name:        activeDmUser?.username ?? 'Message direct',
        isPrivate:   true,
        isDm:        true,
        description: activeDmUser ? `Conversation avec ${activeDmUser.username}` : 'Conversation privée',
      }
    : activeRoom;

  if (!user) return null;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#1a1a2e' }}>

      {!connected && (
        <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50, padding: '8px 16px', borderRadius: 20, backgroundColor: '#e17055', color: 'white', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white', animation: 'spin 1s linear infinite' }} />
          Reconnexion en cours...
        </div>
      )}

      <Sidebar
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        currentUser={user}
        onlineUsers={onlineUsers}
        rooms={rooms}
        onRoomsUpdate={setRooms}
        activeDmConvId={activeDmConvId}
        onSelectDmConv={handleSelectDmConv}
        dmConversations={dmConversations}
        onDmConvsUpdate={setDmConversations}
      />

      <ChatArea
        room={currentRoomDisplay}
        currentUser={user}
        messages={currentMessages}
        typingUsers={typingUsers}
        onSendMessage={handleSendMessage}
        onSendTyping={(_, isTyping) => {
          const rId = isDmMode ? activeDmRoomId : activeRoomId;
          if (rId) sendTyping(rId, isTyping);
        }}
        onReact={sendReaction}
        memberCount={dmParticipants ? 2 : roomMembers.length}
        isDm={isDmMode}
        dmPending={isDmMode && !activeDmRoomId}
      />

      <RightPanel
        room={currentRoomDisplay}
        members={dmParticipants ?? roomMembers}
      />
    </div>
  );
};

export default Room;

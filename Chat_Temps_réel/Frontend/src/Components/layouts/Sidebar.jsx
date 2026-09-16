import { useState, useEffect } from 'react';
import { Hash, Lock, Plus, ChevronDown, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import CreateRoomModal from '../ui/CreateRoomModal';
import SearchUserModal from '../ui/SearchUserModal';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Config/api';

const S = {
  bg:        '#16162a',
  bgHover:   '#252540',
  bgActive:  '#2e2e50',
  bgDrop:    '#12121f',
  border:    '#2a2a45',
  accent:    '#6c5ce7',
  online:    '#00b894',
  textPri:   '#ffffff',
  textSec:   '#b0b0c0',
  textMuted: '#6b6b8a',
  danger:    '#e17055',
};

const Sidebar = ({
  activeRoom, onSelectRoom, currentUser,
  onlineUsers = new Map(),
  rooms = [], onRoomsUpdate,
  activeDmConv, onSelectDmConv,        // conversation DM active
  dmConversations = [], onDmConvsUpdate, // liste des DMs avec messages
}) => {
  const [statusOpen, setStatusOpen]         = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { logout } = useAuth();

  // Charger les conversations DM actives au montage
  useEffect(() => {
    if (!currentUser) return;
    api.get('/dm/conversations')
      .then(r => onDmConvsUpdate(r.data))
      .catch(() => {});
  }, [currentUser]);

  /*
    Quand l'user clique sur un résultat de recherche :
    - on reçoit la DirectConversation (conv) et le User cible
    - on ouvre immédiatement la fenêtre DM (même sans message)
    - si conv.room existe déjà, on rejoint la room ; sinon on attend le premier message
  */
  const handleConversationOpen = (conv, targetUser) => {
    // Ajouter à la liste DMs si pas déjà présent (pour affichage immédiat)
    onDmConvsUpdate(prev => {
      const exists = prev.some(c => c.id === conv.id);
      return exists ? prev : [conv, ...prev];
    });
    onSelectDmConv(conv, targetUser);
  };

  // Helper : retrouver l'interlocuteur d'une conversation DM
  // On compare en string pour éviter les problèmes de type
  const getOtherUser = (conv) => {
    if (!conv || !currentUser) return null;
    const myId = String(currentUser.id);
    if (String(conv.user1?.id) === myId) return conv.user2;
    if (String(conv.user2?.id) === myId) return conv.user1;
    // Fallback : retourner user2 par défaut
    return conv.user2 ?? conv.user1;
  };

  return (
    <>
      <aside style={{
        width: 260, minWidth: 260, maxWidth: 260,
        height: '100vh', display: 'flex', flexDirection: 'column',
        backgroundColor: S.bg, borderRight: `1px solid ${S.border}`,
        flexShrink: 0, overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', flexShrink: 0, borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: S.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>N</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: S.textPri }}>Nebula</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, backgroundColor: 'rgba(0,184,148,0.15)', color: S.online }}>
            ● {[...onlineUsers.values()].length} en ligne
          </span>
        </div>

        {/* ── Corps scrollable ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Salons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textMuted }}>Salons</span>
              <Btn onClick={() => setShowCreateModal(true)} title="Créer un salon">
                <Plus size={14} color={S.textMuted} />
              </Btn>
            </div>
            {rooms.map(room => (
              <RoomItem
                key={room.id}
                room={room}
                isActive={activeRoom?.id === room.id && !activeDmConv}
                onClick={() => { onSelectRoom(room); onSelectDmConv(null, null); }}
                S={S}
              />
            ))}
          </div>

          {/* Messages Directs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textMuted }}>Messages Directs</span>
              {/* "+" ouvre la recherche d'utilisateur */}
              <Btn onClick={() => setShowSearchModal(true)} title="Nouveau message direct">
                <Plus size={14} color={S.textMuted} />
              </Btn>
            </div>

            {/* Conversations existantes uniquement (celles avec au moins un message) */}
            {dmConversations
              .filter(conv => conv.room)
              .map(conv => {
                const other = getOtherUser(conv);
                if (!other) return null;
                const isActive = activeDmConv?.id === conv.id;
                const isOnline = onlineUsers.has(other.id);
                return (
                  <DmItem
                    key={conv.id}
                    user={{ ...other, status: isOnline ? 'online' : (other.status || 'offline') }}
                    isActive={isActive}
                    onClick={() => {
                      // On passe la conv ET les deux users — Room.jsx décidera lequel est l'interlocuteur
                      onSelectDmConv({ ...conv, _user1: conv.user1, _user2: conv.user2 }, other);
                      onSelectRoom(null);
                    }}
                    S={S}
                  />
                );
              })}

            {/* Conversation ouverte mais sans messages (vient d'être initiée) */}
            {activeDmConv && !activeDmConv.room && (() => {
              const other = getOtherUser(activeDmConv);
              if (!other) return null;
              return (
                <DmItem
                  key={activeDmConv.id}
                  user={{ ...other, status: onlineUsers.has(other.id) ? 'online' : 'offline' }}
                  isActive={true}
                  onClick={() => onSelectDmConv(activeDmConv, other)}
                  S={S}
                  pending
                />
              );
            })()}

            {dmConversations.filter(c => c.room).length === 0 && !activeDmConv && (
              <p style={{ fontSize: 12, color: S.textMuted, padding: '6px 16px' }}>
                Aucune conversation. Cliquez sur + pour démarrer.
              </p>
            )}
          </div>
        </div>

        {/* ── Profil ── */}
        <div style={{ flexShrink: 0, padding: 10, borderTop: `1px solid ${S.border}`, position: 'relative' }}>
          <HoverBtn onClick={() => setStatusOpen(!statusOpen)} S={S}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8 }}>
            <Avatar username={currentUser?.username || '?'} color={currentUser?.avatarColor || S.accent} size={34} showStatus status="online" />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.textPri }}>{currentUser?.username || '...'}</div>
              <div style={{ fontSize: 11, color: S.online }}>Disponible</div>
            </div>
            <ChevronDown size={13} color={S.textMuted} style={{ transform: statusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </HoverBtn>

          {statusOpen && (
            <div style={{ position: 'absolute', bottom: '100%', left: 10, right: 10, marginBottom: 4, backgroundColor: S.bgDrop, border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {[{ label: 'Disponible', color: '#00b894' }, { label: 'Absent', color: '#fdcb6e' }, { label: 'Ne pas déranger', color: '#e17055' }].map(s => (
                <HoverBtn key={s.label} onClick={() => setStatusOpen(false)} S={S}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: S.textPri }}>{s.label}</span>
                </HoverBtn>
              ))}
              <div style={{ borderTop: `1px solid ${S.border}` }}>
                <HoverBtn onClick={() => { logout(); setStatusOpen(false); }} S={S}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
                  <LogOut size={13} color={S.danger} />
                  <span style={{ fontSize: 13, color: S.danger }}>Se déconnecter</span>
                </HoverBtn>
              </div>
            </div>
          )}
        </div>
      </aside>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={(room) => { onRoomsUpdate(p => [...p, room]); onSelectRoom(room); }}
        />
      )}

      {showSearchModal && (
        <SearchUserModal
          onClose={() => setShowSearchModal(false)}
          onConversationOpen={handleConversationOpen}
        />
      )}
    </>
  );
};

/* ── RoomItem ── */
const RoomItem = ({ room, isActive, onClick, S }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'calc(100% - 16px)', margin: '1px 8px', padding: '6px 10px', borderRadius: 6, border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: isActive ? S.bgActive : hov ? S.bgHover : 'transparent', color: isActive ? S.textPri : S.textSec, fontSize: 14 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {room.isPrivate ? <Lock size={13} /> : <Hash size={13} />}
        {room.name}
      </span>
      {room.unread > 0 && <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: S.accent, color: '#fff', borderRadius: 10, padding: '1px 6px' }}>{room.unread}</span>}
    </button>
  );
};

/* ── DmItem ── */
const DmItem = ({ user, isActive, onClick, S, pending = false }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: 'calc(100% - 16px)', margin: '1px 8px',
        padding: '6px 10px', borderRadius: 6,
        border: 'none', textAlign: 'left', cursor: 'pointer',
        backgroundColor: isActive ? S.bgActive : hov ? S.bgHover : 'transparent',
      }}
    >
      <Avatar username={user.username} color={user.avatarColor} size={32} showStatus status={user.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: S.textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.username}
        </div>
        <div style={{ fontSize: 11, color: pending ? S.textMuted : (user.status === 'online' ? '#00b894' : S.textMuted) }}>
          {pending ? 'Nouvelle conversation' : (user.status === 'online' ? 'En ligne' : user.status === 'away' ? 'Absent' : 'Hors ligne')}
        </div>
      </div>
    </button>
  );
};

const HoverBtn = ({ children, onClick, S, style }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...style, border: 'none', cursor: 'pointer', backgroundColor: hov ? S.bgHover : (style?.backgroundColor || 'transparent') }}>
      {children}
    </button>
  );
};

const Btn = ({ children, onClick, title }) => (
  <button onClick={onClick} title={title}
    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex', alignItems: 'center', borderRadius: 4 }}>
    {children}
  </button>
);

export default Sidebar;

import { useState } from 'react';
import { Bell, Pin, Search, Hash, Lock } from 'lucide-react';
import Avatar from '../ui/Avatar';

const S = {
  bg:        '#16162a',
  bgHover:   '#252540',
  border:    '#2a2a45',
  textPri:   '#ffffff',
  textSec:   '#b0b0c0',
  textMuted: '#6b6b8a',
};

const STATUS_LABELS = { online: 'En Ligne', away: 'Absent',  offline: 'Hors Ligne' };
const STATUS_COLORS = { online: '#00b894',  away: '#fdcb6e', offline: '#636e72'    };

const RightPanel = ({ room, members = [] }) => {
  const online  = members.filter(m => m.status === 'online');
  const offline = members.filter(m => m.status !== 'online');

  return (
    <div style={{ width: 240, minWidth: 240, maxWidth: 240, height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: S.bg, borderLeft: `1px solid ${S.border}`, overflowY: 'auto' }}>

      {/* En-tête */}
      <div style={{ padding: 16, flexShrink: 0, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          {room?.isPrivate ? <Lock size={13} color={S.textSec} /> : <Hash size={13} color={S.textSec} />}
          <span style={{ fontWeight: 700, fontSize: 13, color: S.textPri }}>{room?.name || 'général'}</span>
        </div>
        <p style={{ fontSize: 12, color: S.textMuted, lineHeight: 1.5 }}>{room?.description || 'Salon de discussion.'}</p>
      </div>

      {/* Options */}
      <div style={{ padding: 16, borderBottom: `1px solid ${S.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textMuted, marginBottom: 8 }}>Options</p>
        {[{ Icon: Bell, label: 'Notifications' }, { Icon: Pin, label: 'Messages épinglés' }, { Icon: Search, label: 'Rechercher' }].map(({ Icon, label }) => (
          <OBtn key={label} Icon={Icon} label={label} S={S} />
        ))}
      </div>

      {/* En ligne */}
      {online.length > 0 && (
        <div style={{ padding: 16, borderBottom: offline.length > 0 ? `1px solid ${S.border}` : 'none' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textMuted, marginBottom: 10 }}>En ligne — {online.length}</p>
          <MList members={online} />
        </div>
      )}

      {/* Hors ligne */}
      {offline.length > 0 && (
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textMuted, marginBottom: 10 }}>Hors ligne — {offline.length}</p>
          <MList members={offline} />
        </div>
      )}

      {members.length === 0 && (
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textMuted, marginBottom: 8 }}>Membres</p>
          <p style={{ fontSize: 12, color: S.textMuted }}>Aucun membre chargé.</p>
        </div>
      )}
    </div>
  );
};

const OBtn = ({ Icon, label, S }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2, backgroundColor: hov ? S.bgHover : 'transparent', color: hov ? S.textPri : S.textSec, fontSize: 13 }}>
      <Icon size={14} />
      {label}
    </button>
  );
};

const MList = ({ members }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {members.map(m => (
      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar username={m.username} color={m.avatarColor || m.color} size={32} showStatus status={m.status} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#ffffff' }}>{m.username}</div>
          <div style={{ fontSize: 11, color: STATUS_COLORS[m.status] || STATUS_COLORS.offline }}>{STATUS_LABELS[m.status] || 'Hors Ligne'}</div>
        </div>
      </div>
    ))}
  </div>
);

export default RightPanel;

import { useState, useRef, useEffect, useCallback } from 'react';
import { Hash, Lock, Users, Bell, Pin, Search, Paperclip, Smile, Send, Bold, Italic, Code } from 'lucide-react';
import Avatar from '../ui/Avatar';

const S = {
  bgMain:    '#1a1a2e',
  bgMsg:     '#2d2d44',
  bgSelf:    '#6c5ce7',
  bgSecond:  '#16162a',
  bgTert:    '#12121f',
  bgHover:   '#252540',
  border:    '#2a2a45',
  accent:    '#6c5ce7',
  textPri:   '#ffffff',
  textSec:   '#b0b0c0',
  textMuted: '#6b6b8a',
};

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const fmt = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const groupByDate = (messages) => {
  const groups = []; let last = null;
  messages.forEach(msg => {
    const now = new Date(), d = new Date(msg.createdAt || msg.timestamp);
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    const label = d.toDateString() === now.toDateString() ? "Aujourd'hui"
                : d.toDateString() === yest.toDateString() ? 'Hier'
                : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    if (label !== last) { groups.push({ type: 'sep', label }); last = label; }
    groups.push({ type: 'msg', data: msg });
  });
  return groups;
};

const ChatArea = ({ room, currentUser, messages = [], typingUsers = new Map(), onSendMessage, onSendTyping, onReact, memberCount = 0, isDm = false, dmPending = false }) => {
  const [input, setInput]                     = useState('');
  const [emojiPicker, setEmojiPicker]         = useState(null);
  const endRef     = useRef(null);
  const timerRef   = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, [room?.id]);
  useEffect(() => {
    const h = () => setEmojiPicker(null);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  const send = useCallback((e) => {
    e?.preventDefault();
    const c = input.trim();
    if (!c || !room?.id) return;
    onSendMessage?.(room.id, c);
    setInput('');
    onSendTyping?.(room.id, false);
    clearTimeout(timerRef.current);
  }, [input, room?.id, onSendMessage, onSendTyping]);

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const onChange = (e) => {
    setInput(e.target.value);
    if (!room?.id) return;
    onSendTyping?.(room.id, true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSendTyping?.(room.id, false), 2000);
  };

  const typingList = [...typingUsers.values()].filter(u => u !== currentUser?.username);
  const items = groupByDate(messages);

  return (
    <div style={{ flex: 1, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: S.bgMain }}>

      {/* Header */}
      <div style={{ height: 50, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {room?.isPrivate ? <Lock size={16} color={S.textSec} /> : <Hash size={16} color={S.textSec} />}
          <span style={{ fontWeight: 700, fontSize: 15, color: S.textPri }}>{room?.name || 'général'}</span>
          <span style={{ fontSize: 13, color: S.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>· <Users size={12} /> {memberCount} membres</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[Search, Pin, Bell].map((Icon, i) => (
            <IBtn key={i}><Icon size={16} /></IBtn>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, opacity: 0.5, paddingTop: 80 }}>
            <Hash size={44} color={S.textMuted} />
            <p style={{ fontSize: 14, color: S.textMuted, textAlign: 'center' }}>
              {dmPending
                ? `Envoyez un message pour démarrer la conversation avec ${room?.name}.`
                : `Aucun message dans #${room?.name}. Soyez le premier !`}
            </p>
          </div>
        )}

        {items.map((item, i) => item.type === 'sep' ? (
          <div key={`s${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: S.border }} />
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 12px', borderRadius: 20, backgroundColor: S.bgSecond, color: S.textMuted, whiteSpace: 'nowrap' }}>{item.label}</span>
            <div style={{ flex: 1, height: 1, backgroundColor: S.border }} />
          </div>
        ) : (
          <Bubble key={item.data.id} msg={item.data} currentUser={currentUser} onReact={onReact} roomId={room?.id} emojiPicker={emojiPicker} setEmojiPicker={setEmojiPicker} S={S} />
        ))}

        {typingList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
            <TypingDots S={S} />
            <span style={{ fontSize: 12, fontStyle: 'italic', color: S.textMuted }}>
              {typingList.length === 1 ? `${typingList[0]} est en train d'écrire...` : `${typingList.slice(0, -1).join(', ')} et ${typingList.at(-1)} écrivent...`}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Zone de saisie */}
      <div style={{ flexShrink: 0, padding: '0 16px 14px', borderTop: `1px solid ${S.border}` }}>
        {/* Formatage */}
        <div style={{ display: 'flex', gap: 2, padding: '8px 0', borderBottom: `1px solid ${S.border}` }}>
          {[{ I: Bold, t: 'Gras' }, { I: Italic, t: 'Italique' }, { I: Code, t: 'Code' }].map(({ I, t }) => (
            <IBtn key={t} title={t}><I size={14} /></IBtn>
          ))}
        </div>

        <form onSubmit={send} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10 }}>
          <IBtn type="button"><Paperclip size={17} /></IBtn>

          <input ref={inputRef} type="text" value={input} onChange={onChange} onKeyDown={onKey}
            placeholder={`Écrire un message dans #${room?.name || 'général'}...`}
            style={{ flex: 1, height: 38, backgroundColor: S.bgTert, border: `1px solid ${S.border}`, borderRadius: 8, padding: '0 14px', fontSize: 14, color: S.textPri, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = S.accent}
            onBlur={e => e.target.style.borderColor = S.border}
          />

          <IBtn type="button"><Smile size={17} /></IBtn>

          <button type="submit" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: input.trim() ? S.accent : S.bgTert, color: input.trim() ? '#fff' : S.textMuted }}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── MessageBubble ── */
const Bubble = ({ msg, currentUser, onReact, roomId, emojiPicker, setEmojiPicker, S }) => {
  const [hov, setHov] = useState(false);
  const isSelf   = (msg.author?.id || msg.userId) === currentUser?.id || msg.isSelf;
  const username = msg.author?.username || msg.username;
  const color    = msg.author?.avatarColor || msg.color || '#6c5ce7';
  const time     = fmt(msg.createdAt || msg.timestamp);

  const reactionMap = (msg.reactions || []).reduce((acc, r) => { acc.set(r.emoji, (acc.get(r.emoji) || 0) + 1); return acc; }, new Map());
  const hasReacted  = emoji => (msg.reactions || []).some(r => r.emoji === emoji && r.userId === currentUser?.id);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '2px 8px', borderRadius: 8, flexDirection: isSelf ? 'row-reverse' : 'row', backgroundColor: hov ? 'rgba(255,255,255,0.03)' : 'transparent' }}>

      {!isSelf && <div style={{ flexShrink: 0 }}><Avatar username={username} color={color} size={32} /></div>}

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 440, alignItems: isSelf ? 'flex-end' : 'flex-start', gap: 3 }}>
        {!isSelf && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{username}</span>
            <span style={{ fontSize: 11, color: S.textMuted }}>{time}</span>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <div style={{ padding: '8px 14px', fontSize: 14, lineHeight: 1.5, color: S.textPri, backgroundColor: isSelf ? S.bgSelf : S.bgMsg, borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px', wordBreak: 'break-word' }}>
            {msg.content}
            {msg.isEdited && <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 6 }}>(modifié)</span>}
          </div>

          {hov && (
            <button onClick={e => { e.stopPropagation(); setEmojiPicker(emojiPicker === msg.id ? null : msg.id); }}
              style={{ position: 'absolute', top: -12, [isSelf ? 'left' : 'right']: -8, fontSize: 13, padding: '1px 6px', borderRadius: 20, backgroundColor: S.bgSecond, border: `1px solid ${S.border}`, cursor: 'pointer' }}>
              😊
            </button>
          )}

          {emojiPicker === msg.id && (
            <div onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', zIndex: 10, [isSelf ? 'right' : 'left']: 0, bottom: '110%', display: 'flex', gap: 4, padding: 8, borderRadius: 12, backgroundColor: S.bgSecond, border: `1px solid ${S.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { onReact?.(msg.id, e, roomId); setEmojiPicker(null); }}
                  style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: hasReacted(e) ? 'rgba(108,92,231,0.3)' : 'transparent' }}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {isSelf && <span style={{ fontSize: 11, color: S.textMuted }}>{time}</span>}

        {reactionMap.size > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[...reactionMap.entries()].map(([e, count]) => (
              <button key={e} onClick={() => onReact?.(msg.id, e, roomId)}
                style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, cursor: 'pointer', backgroundColor: hasReacted(e) ? 'rgba(108,92,231,0.3)' : S.bgSecond, border: `1px solid ${hasReacted(e) ? S.accent : S.border}`, color: S.textPri }}>
                {e} {count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* Bouton icône générique */
const IBtn = ({ children, title, type = 'button' }) => {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color: hov ? '#ffffff' : '#b0b0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </button>
  );
};

const TypingDots = ({ S }) => (
  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: S.textMuted, display: 'block', animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
    ))}
  </div>
);

export default ChatArea;

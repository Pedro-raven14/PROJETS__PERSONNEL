import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader } from 'lucide-react';
import Avatar from './Avatar';
import api from '../../Config/api';

const S = {
  overlay:   'rgba(0,0,0,0.75)',
  bgModal:   '#16162a',
  bgInput:   '#12121f',
  bgHover:   '#252540',
  border:    '#2a2a45',
  accent:    '#6c5ce7',
  textPri:   '#ffffff',
  textSec:   '#b0b0c0',
  textMuted: '#6b6b8a',
};

/*
  Modal de recherche d'utilisateur pour démarrer un DM.
  
  Flux :
  1. L'user tape un nom → debounce 300ms → appel GET /dm/search?q=...
  2. Liste de résultats s'affiche
  3. Clic sur un user → POST /dm/conversations/:userId → reçoit la DirectConversation
  4. onConversationOpen(conv) est appelé → la sidebar et Room.jsx s'adaptent
*/
const SearchUserModal = ({ onClose, onConversationOpen }) => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [opening, setOpening]   = useState(null); // userId en cours d'ouverture
  const debounceRef             = useRef(null);
  const inputRef                = useRef(null);

  // Focus automatique à l'ouverture
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Fermer avec Échap
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Recherche avec debounce : on attend 300ms après le dernier caractère
  // pour ne pas spammer l'API à chaque touche
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);

    if (!val.trim()) { setResults([]); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/dm/search?q=${encodeURIComponent(val.trim())}`);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelectUser = async (user) => {
    setOpening(user.id);
    try {
      const { data: conv } = await api.post(`/dm/conversations/${user.id}`);
      onConversationOpen(conv, user);
      onClose();
    } catch {
      setOpening(null);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: S.overlay }}
    >
      <div style={{ width: '100%', maxWidth: 420, backgroundColor: S.bgModal, border: `1px solid ${S.border}`, borderRadius: 16, padding: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: S.textPri }}>Nouveau message direct</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.textMuted, display: 'flex', padding: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = S.textPri}
            onMouseLeave={e => e.currentTarget.style.color = S.textMuted}>
            <X size={18} />
          </button>
        </div>

        {/* Champ de recherche */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: S.bgInput, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: '0 12px', marginBottom: 8 }}>
          {loading
            ? <Loader size={15} color={S.textMuted} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            : <Search size={15} color={S.textMuted} style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Rechercher un utilisateur..."
            style={{ flex: 1, padding: '11px 0', fontSize: 14, color: S.textPri, backgroundColor: 'transparent', border: 'none', outline: 'none' }}
          />
        </div>

        {/* Résultats */}
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {!query.trim() && (
            <p style={{ fontSize: 13, color: S.textMuted, textAlign: 'center', padding: '20px 0' }}>
              Tapez un nom pour rechercher
            </p>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <p style={{ fontSize: 13, color: S.textMuted, textAlign: 'center', padding: '20px 0' }}>
              Aucun utilisateur trouvé pour "{query}"
            </p>
          )}

          {results.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user)}
              disabled={opening === user.id}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                backgroundColor: 'transparent', textAlign: 'left', marginBottom: 2,
                opacity: opening === user.id ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = S.bgHover}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Avatar username={user.username} color={user.avatarColor} size={36} showStatus status={user.status} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: S.textPri }}>{user.username}</div>
                <div style={{ fontSize: 12, color: user.status === 'online' ? '#00b894' : S.textMuted }}>
                  {user.status === 'online' ? 'En ligne' : user.status === 'away' ? 'Absent' : 'Hors ligne'}
                </div>
              </div>
              {opening === user.id && (
                <Loader size={14} color={S.accent} style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchUserModal;

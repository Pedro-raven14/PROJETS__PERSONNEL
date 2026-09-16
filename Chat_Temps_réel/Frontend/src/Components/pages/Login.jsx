import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const AVATAR_COLORS = [
  { id: 'violet',  hex: '#6c5ce7' },
  { id: 'emerald', hex: '#00b894' },
  { id: 'orange',  hex: '#e17055' },
  { id: 'blue',    hex: '#0984e3' },
  { id: 'pink',    hex: '#fd79a8' },
  { id: 'yellow',  hex: '#fdcb6e' },
  { id: 'purple',  hex: '#a29bfe' },
];

// Palette — valeurs hex directes, aucune dépendance CSS
const S = {
  bgPage:    '#1a1a2e',
  bgCard:    '#16162a',
  bgInput:   '#12121f',
  bgTabOff:  '#12121f',
  border:    '#2a2a45',
  accent:    '#6c5ce7',
  accentHov: '#5a4dd6',
  danger:    '#e17055',
  textPri:   '#ffffff',
  textSec:   '#b0b0c0',
  textMuted: '#6b6b8a',
};

const Login = () => {
  const [tab, setTab]                     = useState('login');
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].hex);
  const [localError, setLocalError]       = useState('');
  const [focusedField, setFocusedField]   = useState('');

  const { login, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setLocalError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) { setLocalError('Minimum 2 caractères pour le pseudo.'); return; }
    if (!password || password.length < 6) { setLocalError('Minimum 6 caractères pour le mot de passe.'); return; }
    const result = tab === 'login'
      ? await login(trimmed, password)
      : await register(trimmed, password, selectedColor);
    if (result.success) navigate('/chat');
  };

  const displayError = localError || error;

  // Style des inputs avec focus géré manuellement
  const getInputStyle = (field) => ({
    width: '100%',
    padding: '12px 16px',
    fontSize: 14,
    borderRadius: 8,
    outline: 'none',
    backgroundColor: S.bgInput,
    border: `1.5px solid ${
      displayError ? S.danger
      : focusedField === field ? S.accent
      : S.border
    }`,
    color: S.textPri,
    display: 'block',
  });

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(ellipse at 60% 40%, #2d1b69 0%, ${S.bgPage} 50%, #0f0f1a 100%)`,
      overflow: 'auto',
    }}>
      {/* ── Carte ── */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        margin: '0 16px',
        backgroundColor: S.bgCard,
        border: `1px solid ${S.border}`,
        borderRadius: 20,
        padding: 32,
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: S.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: S.textPri }}>Nebula</div>
            <div style={{ fontSize: 12, color: S.textSec }}>Chat d'équipe en temps réel</div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', backgroundColor: S.bgTabOff, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {[{ key: 'login', label: 'Connexion' }, { key: 'register', label: 'Inscription' }].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setLocalError(''); clearError(); }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tab === key ? S.accent : 'transparent',
                color: tab === key ? '#ffffff' : S.textSec,
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Titre */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: S.textPri, marginBottom: 4 }}>
            {tab === 'login' ? 'Bon retour !' : 'Rejoignez la conversation'}
          </h2>
          <p style={{ fontSize: 14, color: S.textSec }}>
            {tab === 'login'
              ? 'Connectez-vous avec vos identifiants.'
              : 'Choisissez un pseudo et une couleur pour commencer.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Pseudo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textSec }}>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={handleChange(setUsername)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              placeholder="alice"
              autoComplete="username"
              autoFocus
              style={getInputStyle('username')}
            />
          </div>

          {/* Mot de passe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textSec }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={handleChange(setPassword)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              placeholder="••••••••"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              style={getInputStyle('password')}
            />
          </div>

          {/* Sélecteur couleur (inscription uniquement) */}
          {tab === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.textSec }}>
                Couleur d'avatar
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    aria-label={`Couleur ${c.id}`}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      outline: selectedColor === c.hex ? '3px solid #ffffff' : '3px solid transparent',
                      outlineOffset: 2,
                      transform: selectedColor === c.hex ? 'scale(1.18)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Erreur */}
          {displayError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(225,112,85,0.15)',
              border: '1px solid rgba(225,112,85,0.35)',
              color: S.danger,
              fontSize: 13,
            }}>
              {displayError}
            </div>
          )}

          {/* Bouton soumettre */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              color: '#ffffff',
              backgroundColor: loading ? S.textMuted : S.accent,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = S.accentHov)}
            onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = S.accent)}
          >
            {loading && (
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            )}
            {tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

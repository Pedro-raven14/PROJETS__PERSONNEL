/* ── Login ──────────────────────────────────────────────────────────────────
   Maquette :
   - Fond #0d1117 pleine page, contenu centré
   - Icône Link2 gradient en haut, titre "Bon retour", sous-titre
   - Carte sombre : Adresse e-mail (icône enveloppe dans input), Mot de passe
     (icône cadenas + lien Oublié ?), checkbox "Se souvenir de moi",
     bouton "Se connecter →" gradient bleu→violet, divider OU,
     boutons Google / GitHub, lien "Créer un compte"
────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    toast('Authentification à implémenter.', { icon: 'ℹ️' });
    setLoading(false);
  };

  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
      }}
    >
      {/* Icône */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 8px 28px rgba(124,58,237,0.4)',
        }}
      >
        <Link2 size={22} color="#fff" />
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
        Bon retour
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
        Connectez-vous pour retrouver vos liens et statistiques.
      </p>

      {/* Carte */}
      <div className="card-dark" style={{ width: '100%', maxWidth: 440, padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Adresse e-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                color="#374151"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                required
                className="input-field"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={labelStyle}>Mot de passe</label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, cursor: 'pointer' }}
              >
                Oublié ?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                color="#374151"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-field"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {/* Remember me */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              style={{ width: 14, height: 14, accentColor: '#2563eb' }}
            />
            <span style={{ color: '#64748b', fontSize: 13 }}>Se souvenir de moi</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            {loading ? (
              <span style={spinner} />
            ) : (
              <>Se connecter <ArrowRight size={15} /></>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
            <span style={{ color: '#374151', fontSize: 12 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
          </div>

          {/* Social */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            <SocialBtn label="Google" icon={<GoogleIcon />} />
            <SocialBtn label="GitHub" icon={<GitHubIcon />} />
          </div>
        </form>

        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
          Pas encore de compte ?{' '}
          <Link to="/inscription" style={{ color: '#38bdf8', fontWeight: 600 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ── helpers ── */
function SocialBtn({ label, icon }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px',
        borderRadius: 10,
        border: '1px solid #1e2a3a',
        background: 'transparent',
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'border-color 0.2s, color 0.2s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#374151';
        e.currentTarget.style.color = '#f1f5f9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e2a3a';
        e.currentTarget.style.color = '#94a3b8';
      }}
    >
      {icon} {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.64 4.58 1.7l3.4-3.4A12 12 0 0 0 0 12c0 1.99.49 3.86 1.36 5.51l3.91-3.03A7.08 7.08 0 0 1 5.27 9.76z"/>
      <path fill="#FBBC05" d="M5.27 14.24a7.08 7.08 0 0 0 6.73 4.86 7.05 7.05 0 0 0 4.73-1.8l-3.73-2.9a4.5 4.5 0 0 1-6.73-3.88l-3.91 3.03A12 12 0 0 0 12 24a11.96 11.96 0 0 0 8.29-3.29l-3.73-2.9A7.08 7.08 0 0 1 5.27 14.24z"/>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.56-.2-2.27H12v4.29h6.45a5.54 5.54 0 0 1-2.4 3.64l3.73 2.9C21.71 19.1 23.49 15.87 23.49 12.27z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.73-2.9A7.07 7.07 0 0 1 5.27 14.24l-3.91 3.03A12 12 0 0 0 12 24z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.2.9 2.3v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>
    </svg>
  );
}

const labelStyle = { display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 500, marginBottom: 0 };
const spinner = {
  width: 18, height: 18,
  border: '2px solid rgba(255,255,255,0.25)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
  display: 'inline-block',
};

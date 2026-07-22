/* ── Register ───────────────────────────────────────────────────────────────
   Maquette :
   - Fond #0d1117 pleine page
   - Split 2 colonnes (gauche marketing / droite formulaire)
   - Gauche : badge "Gratuit pour commencer", grand titre, description,
     4 features avec check circle bleu, testimonial
   - Droite : carte sombre, "Créer un compte", champs Nom complet / Email /
     Mot de passe (avec barre de force), checkbox conditions,
     bouton gradient, divider OU, Google/GitHub, lien "Se connecter"
────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURES = [
  'Liens courts illimités',
  'Statistiques en temps réel',
  'Domaine personnalisé',
  'Aucune carte requise',
];

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const active = colors[score - 1] ?? '#1e2a3a';

  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < score ? active : '#1e2a3a',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', terms: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms) { toast.error("Acceptez les conditions d'utilisation."); return; }
    if (form.password.length < 8) { toast.error('8 caractères minimum.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    toast('Inscription à implémenter.', { icon: 'ℹ️' });
    setLoading(false);
  };

  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}
      >
        {/* ── Gauche : marketing ── */}
        <div>
          {/* Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: 999,
              border: '1px solid #1e3a8a',
              background: 'rgba(37,99,235,0.12)',
              color: '#60a5fa',
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            ✦ Gratuit pour commencer
          </span>

          <h1
            style={{
              fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Raccourcissez,<br />partagez,<br />mesurez.
          </h1>

          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Créez votre espace LinkShort et pilotez tous vos liens depuis un tableau
            de bord clair et rapide.
          </p>

          {/* Features */}
          <ul style={{ listStyle: 'none', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={11} color="#fff" />
                </div>
                <span style={{ color: '#cbd5e1', fontSize: 14 }}>{f}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <blockquote
            className="card-dark"
            style={{ padding: '16px 20px', borderLeft: '3px solid #2563eb' }}
          >
            <p style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>
              « LinkShort a remplacé trois outils dans notre stack marketing.
              Interface parfaite. »
            </p>
            <footer style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>
              Camille R. — Growth Lead
            </footer>
          </blockquote>
        </div>

        {/* ── Droite : formulaire ── */}
        <div className="card-dark" style={{ padding: '36px 32px' }}>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Créer un compte
          </h2>
          <p style={{ color: '#4b5563', fontSize: 13, marginBottom: 24 }}>
            Rejoignez plus de 12 000 utilisateurs.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Nom complet */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Nom complet</label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="#374151" style={iconStyle} />
                <input name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="Alex Dupont" required className="input-field" style={{ paddingLeft: 34 }} />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Adresse e-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#374151" style={iconStyle} />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="vous@exemple.com" required className="input-field" style={{ paddingLeft: 34 }} />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#374151" style={iconStyle} />
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="8 caractères minimum" required className="input-field" style={{ paddingLeft: 34 }} />
              </div>
              <PasswordStrengthBar password={form.password} />
            </div>

            {/* Conditions */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
              <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange}
                style={{ width: 14, height: 14, marginTop: 2, accentColor: '#2563eb', flexShrink: 0 }} />
              <span style={{ color: '#4b5563', fontSize: 12, lineHeight: 1.5 }}>
                J'accepte les{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                  conditions d'utilisation
                </button>{' '}
                et la{' '}
                <button type="button" style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                  politique de confidentialité
                </button>
                .
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 16, fontFamily: 'inherit',
            }}>
              {loading ? <span style={spinnerStyle} /> : <>Créer mon compte <ArrowRight size={15} /></>}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
              <span style={{ color: '#374151', fontSize: 11 }}>OU</span>
              <div style={{ flex: 1, height: 1, background: '#1e2a3a' }} />
            </div>

            {/* Social */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              <SocialBtn label="Google" icon={<GoogleIcon />} />
              <SocialBtn label="GitHub" icon={<GitHubIcon />} />
            </div>
          </form>

          <p style={{ textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
            Déjà un compte ?{' '}
            <Link to="/connexion" style={{ color: '#38bdf8', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── helpers ── */
function SocialBtn({ label, icon }) {
  return (
    <button type="button" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px', borderRadius: 10, border: '1px solid #1e2a3a',
      background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 500,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#f1f5f9'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2a3a'; e.currentTarget.style.color = '#94a3b8'; }}
    >
      {icon} {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.64 4.58 1.7l3.4-3.4A12 12 0 0 0 0 12c0 1.99.49 3.86 1.36 5.51l3.91-3.03A7.08 7.08 0 0 1 5.27 9.76z"/>
      <path fill="#FBBC05" d="M5.27 14.24a7.08 7.08 0 0 0 6.73 4.86 7.05 7.05 0 0 0 4.73-1.8l-3.73-2.9a4.5 4.5 0 0 1-6.73-3.88l-3.91 3.03A12 12 0 0 0 12 24a11.96 11.96 0 0 0 8.29-3.29l-3.73-2.9A7.08 7.08 0 0 1 5.27 14.24z"/>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.56-.2-2.27H12v4.29h6.45a5.54 5.54 0 0 1-2.4 3.64l3.73 2.9C21.71 19.1 23.49 15.87 23.49 12.27z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.73-2.9A7.07 7.07 0 0 1 5.27 14.24l-3.91 3.03A12 12 0 0 0 12 24z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.2.9 2.3v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>
    </svg>
  );
}

const lbl = { display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 500, marginBottom: 6 };
const iconStyle = { position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' };
const spinnerStyle = {
  width: 17, height: 17, border: '2px solid rgba(255,255,255,0.25)',
  borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
};

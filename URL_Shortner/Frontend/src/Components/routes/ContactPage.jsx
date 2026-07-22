/* ── Contact ────────────────────────────────────────────────────────────────
   Maquette :
   - Fond #0d1117 pleine page
   - Centre : icône envelope dans carré gradient, titre "Prenons contact",
     sous-titre, puis carte sombre avec formulaire Nom / Email / Message /
     bouton "Envoyer" pleine largeur avec gradient cyan→violet
────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success('Message envoyé ! On vous répond sous 24h.');
    setForm({ name: '', email: '', message: '' });
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
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
        }}
      >
        <Mail size={28} color="#fff" />
      </div>

      {/* Titre */}
      <h1
        style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          color: '#fff',
          marginBottom: 10,
          textAlign: 'center',
        }}
      >
        Prenons contact
      </h1>
      <p
        style={{
          color: '#64748b',
          fontSize: 15,
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        Une question, un partenariat, un retour ? Nous répondons sous 24h.
      </p>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="card-dark"
        style={{ width: '100%', maxWidth: 520, padding: '36px 32px' }}
      >
        {/* Nom */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Nom</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Votre nom"
            required
            className="input-field"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="vous@exemple.com"
            required
            className="input-field"
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Comment pouvons-nous vous aider ?"
            required
            rows={5}
            className="input-field"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Bouton Envoyer — gradient cyan → violet pleine largeur */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: 'linear-gradient(90deg, #06b6d4 0%, #7c3aed 100%)',
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
            transition: 'filter 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.filter = 'brightness(1.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
        >
          {loading ? (
            <span
              style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }}
            />
          ) : (
            <>
              Envoyer <Send size={15} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}

const labelStyle = {
  display: 'block',
  color: '#cbd5e1',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 8,
};

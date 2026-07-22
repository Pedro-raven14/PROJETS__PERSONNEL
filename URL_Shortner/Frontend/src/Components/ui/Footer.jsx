import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';

const columns = [
  {
    title: 'Produit',
    items: ['Fonctionnalités', 'Tarifs', 'API'],
  },
  {
    title: 'Ressources',
    items: ['Blog', 'Aide', 'Documentation'],
  },
  {
    title: 'Légal',
    items: ['Confidentialité', 'Conditions', 'Cookies'],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0a0f18',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '56px 24px 32px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
                textDecoration: 'none',
              }}
            >
              <div
                className="btn-gradient"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Link2 size={16} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>LinkShort</span>
            </Link>
            <p style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.6, maxWidth: 180 }}>
              Raccourcissez, partagez et suivez vos liens avec élégance.
            </p>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map((item) => (
                  <li key={item}>
                    <span
                      style={{
                        color: '#4b5563',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#94a3b8')}
                      onMouseLeave={(e) => (e.target.style.color = '#4b5563')}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 24,
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#374151', fontSize: 13 }}>
            © 2026 LinkShort. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

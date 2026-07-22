import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Link2, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', to: '/' },
    { label: 'À propos', to: '/a-propos' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header
      className="glass"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
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
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>LinkShort</span>
        </Link>

        {/* Desktop nav links */}
        <ul
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            listStyle: 'none',
          }}
          className="hidden-mobile"
        >
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end
                style={({ isActive }) => ({
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? '#fff' : '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Auth buttons (desktop) */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          className="hidden-mobile"
        >
          <Link
            to="/connexion"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="btn-gradient"
            style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 10,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            S'inscrire
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: 4,
            display: 'none',
          }}
          className="show-mobile"
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: 'rgba(13,17,23,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '16px 24px 20px',
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '10px 0',
                fontSize: 15,
                fontWeight: 500,
                color: isActive ? '#fff' : '#94a3b8',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              to="/connexion"
              onClick={() => setMenuOpen(false)}
              style={{
                textAlign: 'center',
                padding: '10px',
                borderRadius: 10,
                border: '1px solid #1e2a3a',
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              onClick={() => setMenuOpen(false)}
              className="btn-gradient"
              style={{
                textAlign: 'center',
                padding: '10px',
                borderRadius: 10,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}

      {/* Inline responsive helpers */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

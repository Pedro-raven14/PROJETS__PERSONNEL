import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, Search } from "lucide-react";
import { useBlog } from "../../context/BlogContext";

export default function Header() {
  const { isDark, toggleTheme, isAdmin, logout } = useBlog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/categories", label: "Catégories" },
    { to: "/a-propos", label: "À propos" },
  ];

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-[var(--color-accent)]"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
    }`;

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "0 1px 8px var(--color-shadow)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              M
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "var(--color-text)" }}
            >
              MyBlog
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className={navClass}>
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Recherche */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="text-sm px-3 py-1.5 rounded-lg border outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    width: "180px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="Ouvrir la recherche"
              >
                <Search size={18} />
              </button>
            )}

            {/* Switch thème */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              style={{ color: "var(--color-text-muted)" }}
              aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Connexion / Déconnexion */}
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
                style={{
                  color: "var(--color-text)",
                  borderColor: "var(--color-border)",
                }}
              >
                Déconnexion
              </button>
            ) : (
              <Link
                to="/connexion"
                className="hidden md:inline-flex text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Connexion
              </Link>
            )}

            {/* Menu burger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              style={{ color: "var(--color-text)" }}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div
            className="md:hidden border-t py-4 flex flex-col gap-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 px-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border outline-none"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg"
                style={{ color: "var(--color-accent)" }}
              >
                <Search size={16} />
              </button>
            </form>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </NavLink>
            )}

            {isAdmin ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="text-left text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                Déconnexion
              </button>
            ) : (
              <Link
                to="/connexion"
                className="inline-flex w-fit text-sm font-semibold px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

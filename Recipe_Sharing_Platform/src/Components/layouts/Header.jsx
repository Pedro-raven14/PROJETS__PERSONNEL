import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, PlusCircle, Menu, X, ChevronDown, LogOut, User, BookOpen, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recettes?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      backgroundColor: "#fff",
      borderBottom: "1px solid #f3f4f6",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Ligne principale */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          height: 64, gap: "1rem"
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: "flex", alignItems: "center",
            gap: "0.5rem", textDecoration: "none", flexShrink: 0
          }}>
            <div style={{
              width: 36, height: 36, backgroundColor: "#FF6B35",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem"
            }}>🍳</div>
            <span style={{
              fontWeight: 800, color: "#FF6B35",
              fontSize: "1.25rem", letterSpacing: "-0.02em"
            }}>CookShare</span>
          </Link>

          {/* Barre de recherche — desktop */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, display: "none" }}
            className="md-search">
            <div style={{ position: "relative" }}>
              <Search size={15} style={{
                position: "absolute", left: "0.75rem",
                top: "50%", transform: "translateY(-50%)",
                color: "#9ca3af"
              }} />
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", paddingLeft: "2.25rem",
                  paddingRight: "1rem", paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  borderRadius: "9999px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                  outline: "none", color: "#1f2937"
                }}
              />
            </div>
          </form>

          {/* Actions droite */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            {/* Créer recette */}
            <Link to="/creer-recette" style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              backgroundColor: "#FF6B35", color: "white",
              padding: "0.5rem 1rem", borderRadius: "9999px",
              fontSize: "0.875rem", fontWeight: 600,
              textDecoration: "none",
              transition: "background-color 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e55a27"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FF6B35"}
            >
              <PlusCircle size={15} />
              Créer une recette
            </Link>

            {currentUser ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "0.25rem 0.5rem", borderRadius: "9999px"
                  }}
                >
                  <Avatar user={currentUser} size="sm" />
                  <ChevronDown size={13} style={{ color: "#6b7280" }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div style={{
                      position: "fixed", inset: 0, zIndex: 30
                    }} onClick={() => setUserMenuOpen(false)} />
                    <div className="animate-fade-in" style={{
                      position: "absolute", right: 0, top: "3.25rem",
                      width: "13rem", backgroundColor: "#fff",
                      borderRadius: "1rem",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                      border: "1px solid #f3f4f6",
                      zIndex: 40, overflow: "hidden"
                    }}>
                      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>
                          {currentUser.fullName}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          @{currentUser.username}
                        </p>
                      </div>
                      {[
                        { to: `/profil/${currentUser.username}`, icon: <User size={14} />, label: "Mon profil" },
                        { to: "/mes-recettes", icon: <BookOpen size={14} />, label: "Mes recettes" },
                        { to: "/favoris", icon: <Heart size={14} />, label: "Mes favoris" },
                      ].map(item => (
                        <Link key={item.to} to={item.to}
                          onClick={() => setUserMenuOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.625rem 1rem", fontSize: "0.875rem",
                            color: "#374151", textDecoration: "none",
                            transition: "background 0.1s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.color = "#FF6B35"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}
                        >
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop: "1px solid #f3f4f6" }}>
                        <button onClick={handleLogout} style={{
                          width: "100%", display: "flex", alignItems: "center",
                          gap: "0.5rem", padding: "0.625rem 1rem",
                          fontSize: "0.875rem", color: "#ef4444",
                          background: "none", border: "none", cursor: "pointer",
                          textAlign: "left"
                        }}>
                          <LogOut size={14} /> Se déconnecter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/connexion" style={{
                  color: "#374151", padding: "0.5rem 0.875rem",
                  fontSize: "0.875rem", fontWeight: 500,
                  textDecoration: "none", borderRadius: "9999px",
                  border: "1px solid #e5e7eb"
                }}>
                  Connexion
                </Link>
                <Link to="/inscription" style={{
                  backgroundColor: "#1f2937", color: "white",
                  padding: "0.5rem 0.875rem", borderRadius: "9999px",
                  fontSize: "0.875rem", fontWeight: 600,
                  textDecoration: "none"
                }}>
                  S'inscrire
                </Link>
              </>
            )}

            {/* Burger mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0.5rem", color: "#6b7280"
              }}
              className="mobile-only"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        <div style={{ paddingBottom: "0.75rem" }} className="mobile-search">
          <form onSubmit={handleSearch} style={{ position: "relative" }}>
            <Search size={15} style={{
              position: "absolute", left: "0.75rem",
              top: "50%", transform: "translateY(-50%)",
              color: "#9ca3af"
            }} />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", paddingLeft: "2.25rem",
                paddingRight: "1rem", paddingTop: "0.5rem",
                paddingBottom: "0.5rem", borderRadius: "9999px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb", fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif", outline: "none"
              }}
            />
          </form>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          borderTop: "1px solid #f3f4f6",
          backgroundColor: "#fff",
          padding: "1rem 1.5rem",
          display: "flex", flexDirection: "column", gap: "0.625rem"
        }}>
          <Link to="/creer-recette"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.5rem",
              backgroundColor: "#FF6B35", color: "white",
              padding: "0.625rem", borderRadius: "9999px",
              fontSize: "0.875rem", fontWeight: 600, textDecoration: "none"
            }}>
            <PlusCircle size={15} /> Créer une recette
          </Link>
          {!currentUser && (
            <>
              <Link to="/connexion" onClick={() => setMobileMenuOpen(false)} style={{
                textAlign: "center", padding: "0.625rem",
                fontSize: "0.875rem", color: "#374151",
                border: "1px solid #e5e7eb", borderRadius: "9999px",
                textDecoration: "none"
              }}>Connexion</Link>
              <Link to="/inscription" onClick={() => setMobileMenuOpen(false)} style={{
                textAlign: "center", backgroundColor: "#1f2937",
                color: "white", padding: "0.625rem", borderRadius: "9999px",
                fontSize: "0.875rem", fontWeight: 600, textDecoration: "none"
              }}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

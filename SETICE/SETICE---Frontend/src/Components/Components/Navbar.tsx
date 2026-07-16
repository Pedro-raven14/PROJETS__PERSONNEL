import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Userbox from "./Userbox";
import { jwtDecode } from "jwt-decode";

type NavbarProps = {
  clearToken?: () => void;
  title?: string;
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
};

// const Navbar: React.FC<NavbarProps> = ({ clearToken, title = "", toggleSidebar, sidebarCollapsed = false }) => {
const Navbar: React.FC<NavbarProps> = ({ clearToken, toggleSidebar, sidebarOpen = false }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ email: "" });

  // Fonction de déconnexion disponible pour utilisation future
  const _handleLogout = () => {
    try {
      if (clearToken) clearToken();
      else localStorage.removeItem("token");
    } catch (e) {}
    navigate("/login");
  };
  // Éviter l'erreur TypeScript en préfixant avec _
  void _handleLogout;

  useEffect(() => {
    try {
      // Essayer de récupérer l'utilisateur depuis le localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const email = parsed.email || "";
        setUser({ email });
        return;
      }

      // Fallback: essayer de décoder le token
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: any = jwtDecode(token);
        const email = decoded.email || (decoded.user && decoded.user.email) || "";
        setUser({ email });
      }
    } catch (e) {
      console.error("Erreur lors de la récupération de l'utilisateur:", e);
    }
  }, []);

  return (
    <header className="sticky top-0 h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 mb-2">
      <div className="max-w-full mx-auto h-full flex items-center px-4 md:px-6">
        {/* Mobile menu button */}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <span className="text-sm text-gray-600">Bonjour,</span>
            <span className="text-sm font-medium text-gray-800">
              {user.email ? user.email.split('@')[0] : ''}
            </span>
          </div>

          {/* Userbox */}
          <React.Suspense fallback={null}>
            {/* lazy import to keep bundle small if needed */}
            <Userbox />
          </React.Suspense>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
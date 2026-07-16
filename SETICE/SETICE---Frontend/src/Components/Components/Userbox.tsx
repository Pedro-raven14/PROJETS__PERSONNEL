import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { 
  Bell, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  HelpCircle, 
  Shield,
  GraduationCap,
  Users
} from "lucide-react";

const generateColorFromInitials = (initials: string) => {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = "#" + (hash >>> 0).toString(16).padStart(6, "0").slice(0, 6);
  return color;
};

const initials = (first = "", last = "") => {
  return (first.charAt(0) || "").toUpperCase() + (last.charAt(0) || "").toUpperCase();
};

const Userbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({ 
    first: "", 
    last: "", 
    email: "", 
    role: ""
  });

  useEffect(() => {
    try {
      // Prefer explicit stored user object (saved at login)
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const prenom = parsed.prenom || parsed.first || parsed.firstname || "";
        const nom = parsed.nom || parsed.last || parsed.lastname || "";
        const email = parsed.email || "";
        const role = parsed.role || "";
        setUser({ first: prenom, last: nom, email, role });
        return;
      }

      // Fallback to decoding token payload
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded: any = jwtDecode(token);
      const prenom = decoded.prenom || decoded.firstName || (decoded.user && decoded.user.prenom) || "";
      const nom = decoded.nom || decoded.lastName || (decoded.user && decoded.user.nom) || "";
      const email = decoded.email || (decoded.user && decoded.user.email) || "";
      const role = decoded.role || (decoded.user && decoded.user.role) || "";
      setUser({ 
        first: prenom || "", 
        last: nom || "", 
        email: email || "", 
        role: role || ""
      });
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {}
    navigate("/login");
  };

  // Fonction pour obtenir le chemin du profil selon le rôle
  const getProfilePath = () => {
    if (!user.role) return '/profile';
    return `/${user.role}/profile`;
  };

  // Fonction pour obtenir le label selon le rôle
  const getRoleLabel = () => {
    switch(user.role?.toLowerCase()) {
      case 'directeur':
        return "Directeur";
      case 'formateur':
        return "Formateur";
      case 'etudiant':
        return "Étudiant";
      default:
        return "Utilisateur";
    }
  };

  // Fonction pour obtenir l'icône selon le rôle
  const getRoleIcon = () => {
    switch(user.role?.toLowerCase()) {
      case 'directeur':
        return Shield;
      case 'formateur':
        return GraduationCap;
      case 'etudiant':
        return Users;
      default:
        return UserIcon;
    }
  };

  const handleProfileClick = () => {
    setOpen(false);
    const profilePath = getProfilePath();
    navigate(profilePath);
  };

  const bg = generateColorFromInitials(initials(user.first, user.last));
  const userInitials = initials(user.first, user.last);
  const RoleIcon = getRoleIcon();
  const roleLabel = getRoleLabel();

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/notifications")}
          className="p-2 rounded-md hover:bg-gray-100 transition"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          onClick={() => setOpen((s) => !s)}
          aria-haspopup
          aria-expanded={open}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${bg}20` }}>
            <span style={{ color: bg, fontWeight: 700 }}>{userInitials}</span>
          </div>
          <ChevronDown size={16} className={`${open ? "rotate-180" : "rotate-0"} transition-transform`} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* En-tête avec infos utilisateur */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${bg}20` }}>
                  <span style={{ color: bg, fontWeight: 700, fontSize: '20px' }}>
                    {userInitials}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                  <RoleIcon size={14} className="text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.first} {user.last}
                </div>
                <div className="text-sm text-gray-600 truncate" title={user.email}>
                  {user.email}
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu de navigation simplifié */}
          <nav className="py-2">
            {/* Lien vers le profil */}
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 w-full text-left transition-colors"
            >
              <UserIcon size={16} className="text-gray-500" />
              <div>
                <div className="font-medium">Mon Profil</div>
                <div className="text-xs text-gray-500">Gérer mes informations</div>
              </div>
            </button>


            {/* Aide */}
            <button
              onClick={() => {
                setOpen(false);
                navigate("/help");
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 w-full text-left transition-colors"
            >
              <HelpCircle size={16} className="text-gray-500" />
              <div>
                <div className="font-medium">Aide & Support</div>
                <div className="text-xs text-gray-500">FAQ et contact</div>
              </div>
            </button>

            {/* Séparateur */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-sm text-red-600 w-full text-left transition-colors"
            >
              <LogOut size={16} />
              <div>
                <div className="font-medium">Déconnexion</div>
                <div className="text-xs text-red-500">Quitter la session</div>
              </div>
            </button>
          </nav>

          {/* Pied de page avec version */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-500 text-center">
              UATM GASA Formation • SIL_Challenge 2025
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Userbox;

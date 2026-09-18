
import { LayoutDashboard, Book, Presentation, Users, Layers, Settings, ChevronDown, User, FileText, LogOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import logo from '../../assets/insigne.png';
import { useNavigate, NavLink } from 'react-router-dom';

type SidebarEtudiantProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const brandLogoStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    objectFit: 'contain',
    borderRadius: 6,
};

const SidebarEtudiant = ({ isOpen = true, onClose }: SidebarEtudiantProps) => {
    const menu = [
        {
            name: "Tableau de bord",
            path: "/etudiant/dashboard",
            icon: <LayoutDashboard size={18} color="black" strokeWidth={2.5} />,
        },
        {
            name: "Espace pédagogique",
            path: "/etudiant/espaceP",
            icon: <Book size={18} color="black" strokeWidth={2.5} />,
        },
        {
            name: "Recherche équipes/personnes",
            path: "/etudiant/recherche",
            icon: <Presentation size={18} color="black" strokeWidth={2.5} />,
        },
        {
            name: "Equipes",
            path: "/etudiant/equipes",
            icon: <Users size={18} color="black" strokeWidth={2.5} />,
        },
        {
            name: "Promotion",
            path: "/etudiant/promotion",
            icon: <Layers size={18} color="black" strokeWidth={2.5} />,
        },
    ];
    const [openSettings, setOpenSettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement | null>(null);
    const firstItemRef = useRef<HTMLAnchorElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setOpenSettings(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    useEffect(() => {
        if (openSettings) {
            // focus the first menu item for keyboard users
            setTimeout(() => firstItemRef.current?.focus(), 50);
        }
    }, [openSettings]);

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
        } catch (e) { }
        navigate("/login");
    };

    return (
        <>
            {/* Sidebar */}
            <aside className={`
                fixed md:relative top-0 left-0 z-50 md:z-auto
                w-64 md:w-full bg-white p-3 flex flex-col h-screen
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex gap-1.5">
                    <img src={logo} alt="SETICE" style={brandLogoStyle} />
                    <h1 className="text-xl md:text-2xl font-extrabold mb-[10.4px]">
                        <span className="text-[#9CA3AF]">SET</span>
                        <span className="text-blue-700">ICE</span>
                    </h1>
                </div>
                
                <nav className="w-50 space-y-1 pt-8 flex flex-col flex-1 bg-gray-100 overflow-auto">
                    {menu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 rounded-md transition ${
                                    isActive ? "bg-red-100 text-red-600" : "hover:bg-gray-200"
                                }`
                            }
                        >
                            {item.icon} 
                            <span className="text-black font-bold text-sm md:text-base">
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                    
                    <div className="mt-auto relative" ref={settingsRef}>
                        <button
                            aria-haspopup="true"
                            aria-expanded={openSettings}
                            onClick={() => setOpenSettings((s) => !s)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setOpenSettings((s) => !s);
                                } else if (e.key === "Escape") {
                                    setOpenSettings(false);
                                }
                            }}
                            className="w-full flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <Settings size={18} strokeWidth={2.5} />
                                <span className="font-bold text-sm md:text-base">Paramètres</span>
                            </div>
                            <ChevronDown size={16} className={`${openSettings ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} />
                        </button>

                        {/* Dropdown qui se déroule vers le haut — animation via max-height */}
                        <div
                            className={`absolute left-0 bottom-14 w-full z-50 transform transition-all duration-200 ${
                                openSettings ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
                            }`}
                            role="menu"
                            aria-hidden={!openSettings}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setOpenSettings(false);
                            }}
                        >
                            <div className="bg-white rounded-md shadow-md">
                                <NavLink
                                    to="/etudiant/profile"
                                    onClick={() => {
                                        setOpenSettings(false);
                                        onClose?.();
                                    }}
                                    ref={firstItemRef}
                                    role="menuitem"
                                    tabIndex={openSettings ? 0 : -1}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-md transition ${
                                            isActive ? 'bg-blue-500 text-red-600' : 'hover:bg-gray-200'
                                        }`
                                    }
                                >
                                    <User size={16} />
                                    <span className="text-sm font-medium">Profil</span>
                                </NavLink>

                                <NavLink
                                    to="/etudiant/rapports"
                                    onClick={() => {
                                        setOpenSettings(false);
                                        onClose?.();
                                    }}
                                    role="menuitem"
                                    tabIndex={openSettings ? 0 : -1}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-md transition ${
                                            isActive ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200'
                                        }`
                                    }
                                >
                                    <FileText size={16} />
                                    <span className="text-sm font-medium">Rapports</span>
                                </NavLink>

                                <button
                                    onClick={() => {
                                        setOpenSettings(false);
                                        handleLogout();
                                    }}
                                    role="menuitem"
                                    tabIndex={openSettings ? 0 : -1}
                                    aria-label="Se déconnecter"
                                    className="w-full text-left flex items-center gap-2 p-2 rounded-md transition border-t mt-1 bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                    <LogOut size={16} className="text-red-600" />
                                    <span className="text-sm font-medium">Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Mobile overlay - only when sidebar is open on mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
                    onClick={onClose}
                />
            )}
        </>
    );
}

export default SidebarEtudiant
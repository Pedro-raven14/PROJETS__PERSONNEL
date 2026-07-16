import { Plus, Wallet } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import TransactionModal from '../ui/TransactionModal';

const ROUTES = [
  { name: 'Dashboard',     path: '/dashboard'     },
  { name: 'Transactions',  path: '/transactions'  },
  { name: 'Catégories',    path: '/categories'    },
  { name: 'Statistiques',  path: '/statistiques'  },
  { name: 'Paramètres',    path: '/parametres'    },
];

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-800">Budget Tracker</span>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {ROUTES.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-100 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`
                }
              >
                {route.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouvelle Transaction</span>
              <span className="sm:hidden">Nouveau</span>
            </button>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="ml-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Menu"
            >
              <span className="block h-0.5 w-5 bg-current mb-1" />
              <span className="block h-0.5 w-5 bg-current mb-1" />
              <span className="block h-0.5 w-5 bg-current" />
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {ROUTES.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Modal Nouvelle Transaction */}
      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Header;

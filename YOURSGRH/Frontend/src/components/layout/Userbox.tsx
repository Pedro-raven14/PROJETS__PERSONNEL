import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, ChevronDown, HelpCircle, Shield, Users, Briefcase } from "lucide-react";
import { AvatarInitials } from "../element/AvatarInitials";

type Props = { clearToken?: () => void };

const getEmployee = () => {
  try {
    const raw = localStorage.getItem("employee");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getRoleIcon = (role: string) => {
  if (role === "RH")       return Shield;
  if (role === "MANAGER")  return Briefcase;
  if (role === "EMPLOYEE") return Users;
  return UserIcon;
};

const Userbox = ({ clearToken }: Props) => {
  const [open, setOpen]         = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const ref                     = useRef<HTMLDivElement>(null);
  const navigate                = useNavigate();

  useEffect(() => {
    setEmployee(getEmployee());
  }, []);

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!employee) return null;

  const role     = typeof employee.role === 'string' ? employee.role : "";
  const poste    = employee.poste  || role;
  const prenom   = employee.prenom || "";
  const nom      = employee.nom    || "";
  const email    = employee.email  || "";
  const RoleIcon = getRoleIcon(role);
  const rolePath = role.toLowerCase();

  return (
    <div style={{ position: 'relative' }} ref={ref}>

      <button
        onClick={() => setOpen(s => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 0.5rem', borderRadius: '0.5rem',
          border: 'none', background: 'transparent', cursor: 'pointer',
        }}
      >
        <AvatarInitials firstName={prenom} lastName={nom} size="sm" />
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-muted-foreground)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
          width: '17rem', backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)', borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -5px rgb(0 0 0 / 0.05)',
          zIndex: 50, overflow: 'hidden',
        }}>

          {/* En-tête */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <AvatarInitials firstName={prenom} lastName={nom} size="md" />
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  backgroundColor: 'var(--color-card)', borderRadius: '9999px',
                  padding: '2px', display: 'flex',
                }}>
                  <RoleIcon size={12} style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prenom} {nom}
                </p>
                <p style={{ margin: '0.125rem 0 0.375rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {email}
                </p>
                <span style={{
                  display: 'inline-block', padding: '0.125rem 0.5rem',
                  fontSize: '0.7rem', fontWeight: 500,
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)', borderRadius: '9999px',
                }}>
                  {poste}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav style={{ padding: '0.375rem 0' }}>
            <button onClick={() => { setOpen(false); navigate(`/${rolePath}/profile`); }} className="userbox-menu-item">
              <UserIcon size={16} style={{ color: 'var(--color-muted-foreground)', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>Mon Profil</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Gérer mes informations</p>
              </div>
            </button>

            

            <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }} />

            <button onClick={clearToken} className="userbox-menu-item userbox-menu-item--danger">
              <LogOut size={16} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>Déconnexion</p>
                <p style={{ margin: 0, fontSize: '0.75rem' }}>Quitter la session</p>
              </div>
            </button>
          </nav>

          <div style={{ padding: '0.625rem 1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-muted)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>
              YOURSGRH — Gestion des Ressources Humaines
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default Userbox;

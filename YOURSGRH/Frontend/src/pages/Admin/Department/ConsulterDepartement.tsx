import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, UserPlus, UserMinus, X, Users } from "lucide-react";

import { PageHeader } from "../../../components/element/PageHeader";
import { Input } from "../../../components/UI/Input";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import {
  departementService, equipeService, employeeService,
} from "../../../lib/mockService";

type EmployeeLight = {
  userId: number;
  nom: string;
  prenom: string;
  poste?: string;
  role?: { nom: string };
  equipe?: { equipeId: number; nom: string } | null;
};

type Equipe = {
  equipeId: number;
  nom: string;
  rendement: number;
  manager: EmployeeLight | null;
  employes: EmployeeLight[];
};

type Departement = {
  departId: number;
  nom: string;
  description?: string;
  rendement: number;
};

// --- Bouton simple sans dépendance au composant Button (évite le bug hover blanc) ---
const Btn = ({
  onClick, children, variant = 'primary', size = 'md', disabled = false, style: extraStyle = {},
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: React.CSSProperties;
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.375rem', borderRadius: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 500, border: 'none',
    opacity: disabled ? 0.6 : 1, transition: 'background 0.15s, color 0.15s',
    padding: size === 'sm' ? '0.375rem 0.75rem' : '0.5rem 1rem',
    fontSize: size === 'sm' ? '0.8125rem' : '0.875rem',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' },
    outline: { backgroundColor: 'transparent', color: 'var(--color-foreground)', border: '1px solid var(--color-border)' },
    ghost:   { backgroundColor: 'transparent', color: 'var(--color-primary)' },
    danger:  { backgroundColor: 'transparent', color: 'var(--color-destructive)' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...extraStyle }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
        if (variant === 'outline') (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-muted)';
        if (variant === 'ghost')   (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
        if (variant === 'danger')  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        if (variant === 'outline') (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        if (variant === 'ghost')   (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        if (variant === 'danger')  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
};

// --- Modal générique ---
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', borderRadius: '0.375rem' }}>
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ErrorBox = ({ msg }: { msg: string }) => msg ? (
  <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
    {msg}
  </div>
) : null;

// --- Ligne d'employé cliquable dans les modals ---
const EmpRow = ({ emp, onClick, icon }: { emp: EmployeeLight; onClick: () => void; icon: React.ReactNode; showRole?: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const subtitle = [emp.poste, emp.role?.nom].filter(Boolean).join(' · ');
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)',
        cursor: 'pointer', backgroundColor: hovered ? 'var(--color-muted)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', pointerEvents: 'none' }}>
        <AvatarInitials firstName={emp.prenom} lastName={emp.nom} size="sm" />
        <div>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{emp.prenom} {emp.nom}</p>
          {subtitle && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{subtitle}</p>}
        </div>
      </div>
      <span style={{ pointerEvents: 'none', color: 'var(--color-primary)' }}>{icon}</span>
    </div>
  );
};

// ============================================================
// Composant principal
// ============================================================
const ConsulterDepartement = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Détecter le rôle pour adapter la navigation retour
  const role = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null')?.role?.toLowerCase() || 'admin'; }
    catch { return 'admin'; }
  })();
  const basePath = role === 'rh' ? '/rh' : '/admin';

  const [dept,        setDept]        = useState<Departement | null>(null);
  const [equipes,     setEquipes]     = useState<Equipe[]>([]);
  const [allEmployes, setAllEmployes] = useState<EmployeeLight[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [modalAjoutEquipe,  setModalAjoutEquipe]  = useState(false);
  const [modalEditEquipe,   setModalEditEquipe]   = useState<Equipe | null>(null);
  const [modalAjoutMembre,  setModalAjoutMembre]  = useState<Equipe | null>(null);
  const [modalManager,      setModalManager]      = useState<Equipe | null>(null);

  const [nomEquipe,    setNomEquipe]    = useState("");
  const [searchEmp,    setSearchEmp]    = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [errorManager, setErrorManager] = useState(""); // erreur spécifique au modal manager

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    try {
      const deptData = departementService.getById(Number(id));
      setDept(deptData);
      setEquipes(equipeService.getByDepartement(Number(id)));
      const empResult = employeeService.getAll(1, 200);
      setAllEmployes(empResult.data);
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const reset = () => { setNomEquipe(""); setSearchEmp(""); setError(""); setErrorManager(""); setSaving(false); };

  // Met à jour une équipe dans l'état local sans refetch
  const updateEquipeLocal = (updated: Equipe) =>
    setEquipes((prev) => prev.map((e) => e.equipeId === updated.equipeId ? updated : e));

  const handleCreerEquipe = () => {
    if (!nomEquipe.trim()) { setError("Le nom est obligatoire"); return; }
    setSaving(true); setError("");
    try {
      const result = equipeService.create({ nom: nomEquipe.trim(), departId: Number(id) });
      setEquipes((prev) => [...prev, { ...result.equipe, employes: [], manager: null }]);
      setModalAjoutEquipe(false); reset();
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la création");
    } finally { setSaving(false); }
  };

  const handleRenommerEquipe = () => {
    if (!modalEditEquipe || !nomEquipe.trim()) { setError("Le nom est obligatoire"); return; }
    setSaving(true); setError("");
    try {
      equipeService.update(modalEditEquipe.equipeId, { nom: nomEquipe.trim() });
      updateEquipeLocal({ ...modalEditEquipe, nom: nomEquipe.trim() });
      setModalEditEquipe(null); reset();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally { setSaving(false); }
  };

  const handleAssignerMembre = (equipe: Equipe, emp: EmployeeLight) => {
    try {
      equipeService.assignerMembre(equipe.equipeId, emp.userId);
      updateEquipeLocal({ ...equipe, employes: [...equipe.employes, emp] });
      setModalAjoutMembre(null); reset();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  const handleRetirerMembre = (equipe: Equipe, userId: number) => {
    if (equipe.manager?.userId === userId) {
      setError(`Cet employé est le manager de l'équipe "${equipe.nom}". Désassignez-le d'abord en tant que manager.`);
      return;
    }
    try {
      equipeService.retirerMembre(equipe.equipeId, userId);
      updateEquipeLocal({ ...equipe, employes: equipe.employes.filter((e) => e.userId !== userId) });
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    }
  };

  const handleAssignerManager = (equipe: Equipe, managerId: number | null) => {
    setErrorManager("");
    try {
      equipeService.update(equipe.equipeId, { managerId });
      const manager = managerId ? allEmployes.find((e) => e.userId === managerId) ?? null : null;
      let employes = equipe.employes;
      if (manager && !employes.some((e) => e.userId === manager.userId)) {
        equipeService.assignerMembre(equipe.equipeId, manager.userId);
        employes = [...employes, manager];
      }
      updateEquipeLocal({ ...equipe, manager, employes });
      setModalManager(null); reset();
    } catch (e: any) {
      setErrorManager(e?.message ?? "Erreur lors de l'assignation");
    }
  };

  const handleSupprimerEquipe = (equipeId: number) => {
    if (!confirm("Supprimer cette équipe ?")) return;
    try {
      equipeService.delete(equipeId);
      setEquipes((prev) => prev.filter((e) => e.equipeId !== equipeId));
    } catch { /* silencieux */ }
  };

  // Employés disponibles pour rejoindre l'équipe :
  // - pas déjà dans cette équipe
  // - sans équipe assignée (ou déjà dans cette équipe — cas du manager ajouté automatiquement)
  const disponibles = (equipe: Equipe) => {
    const ids = new Set(equipe.employes.map((e) => e.userId));
    return allEmployes
      .filter((e) => !ids.has(e.userId))
      .filter((e) => !e.equipe || e.equipe.equipeId === equipe.equipeId) // sans équipe OU déjà dans cette équipe
      .filter((e) => !searchEmp || `${e.prenom} ${e.nom}`.toLowerCase().includes(searchEmp.toLowerCase()));
  };

  // Managers disponibles :
  // - rôle MANAGER
  // - sans équipe assignée (ou déjà dans cette équipe)
  // - pas déjà manager d'une autre équipe (vérifié côté backend, mais on filtre aussi côté frontend)
  const managersDisponibles = (equipe: Equipe) =>
    allEmployes
      .filter((e) => e.role?.nom === 'MANAGER')
      .filter((e) => !e.equipe || e.equipe.equipeId === equipe.equipeId)
      .filter((e) => !searchEmp || `${e.prenom} ${e.nom}`.toLowerCase().includes(searchEmp.toLowerCase()));

  if (loading) return <p style={{ padding: '2rem', color: 'var(--color-muted-foreground)' }}>Chargement...</p>;
  if (!dept)   return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Département introuvable.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Retour */}
      <button
        onClick={() => navigate(`${basePath}/departments`)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-foreground)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted-foreground)')}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} /> Retour aux départements
      </button>

      <PageHeader
        title={dept.nom}
        subtitle={dept.description || `${equipes.length} équipe(s)`}
        actions={
          <Btn onClick={() => { reset(); setModalAjoutEquipe(true); }}>
            <Plus style={{ width: '16px', height: '16px' }} /> Nouvelle équipe
          </Btn>
        }
      />

      {/* Erreur globale (ex: retrait d'un manager) */}
      {error && !modalAjoutEquipe && !modalEditEquipe && !modalAjoutMembre && !modalManager && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem',
          backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)',
          color: 'var(--color-destructive)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)', padding: '0.125rem' }}>
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* Équipes */}
      {equipes.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucune équipe dans ce département</p>
          <Btn onClick={() => { reset(); setModalAjoutEquipe(true); }} style={{ marginTop: '1rem' }}>
            Créer la première équipe
          </Btn>
        </div>
      ) : equipes.map((equipe) => (
        <div key={equipe.equipeId} className="stat-card">

          {/* En-tête */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>{equipe.nom}</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                {equipe.employes.length} membre(s){equipe.rendement > 0 && ` · Rendement : ${equipe.rendement}%`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <Btn variant="outline" size="sm" onClick={() => { reset(); setNomEquipe(equipe.nom); setModalEditEquipe(equipe); }}>
                <Pencil style={{ width: '13px', height: '13px' }} /> Renommer
              </Btn>
              <Btn variant="danger" size="sm" onClick={() => handleSupprimerEquipe(equipe.equipeId)}>
                <Trash2 style={{ width: '13px', height: '13px' }} />
              </Btn>
            </div>
          </div>

          {/* Manager */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-muted)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {equipe.manager ? (
                <>
                  <AvatarInitials firstName={equipe.manager.prenom} lastName={equipe.manager.nom} size="sm" />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{equipe.manager.prenom} {equipe.manager.nom}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>Manager</p>
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>Aucun manager assigné</p>
              )}
            </div>
            <Btn variant="outline" size="sm" onClick={() => { reset(); setModalManager(equipe); }}>
              {equipe.manager ? 'Changer' : 'Assigner'}
            </Btn>
          </div>

          {/* Membres */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-foreground)' }}>
                Membres
              </p>
              <Btn variant="ghost" size="sm" onClick={() => { reset(); setModalAjoutMembre(equipe); }}>
                <UserPlus style={{ width: '13px', height: '13px' }} /> Ajouter
              </Btn>
            </div>
            {equipe.employes.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun membre</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {equipe.employes.map((emp) => {
                  const estManager = equipe.manager?.userId === emp.userId;
                  return (
                    <div key={emp.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <AvatarInitials firstName={emp.prenom} lastName={emp.nom} size="sm" />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{emp.prenom} {emp.nom}</p>
                            {estManager && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '9999px', backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }}>
                                Manager
                              </span>
                            )}
                          </div>
                          {emp.poste && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{emp.poste}</p>}
                        </div>
                      </div>
                      <Btn
                        variant="danger"
                        size="sm"
                        disabled={estManager}
                        onClick={() => handleRetirerMembre(equipe, emp.userId)}
                        style={estManager ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                      >
                        <UserMinus style={{ width: '13px', height: '13px' }} />
                      </Btn>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal — Créer équipe */}
      {modalAjoutEquipe && (
        <Modal title="Nouvelle équipe" onClose={() => { setModalAjoutEquipe(false); reset(); }}>
          <ErrorBox msg={error} />
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Nom <span style={{ color: 'var(--color-destructive)' }}>*</span>
          </label>
          <Input placeholder="ex: Équipe Frontend" value={nomEquipe} onChange={(e) => setNomEquipe(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => { setModalAjoutEquipe(false); reset(); }} disabled={saving}>Annuler</Btn>
            <Btn onClick={handleCreerEquipe} disabled={saving}>{saving ? "Création..." : "Créer"}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal — Renommer équipe */}
      {modalEditEquipe && (
        <Modal title="Renommer l'équipe" onClose={() => { setModalEditEquipe(null); reset(); }}>
          <ErrorBox msg={error} />
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Nouveau nom <span style={{ color: 'var(--color-destructive)' }}>*</span>
          </label>
          <Input value={nomEquipe} onChange={(e) => setNomEquipe(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => { setModalEditEquipe(null); reset(); }} disabled={saving}>Annuler</Btn>
            <Btn onClick={handleRenommerEquipe} disabled={saving}>{saving ? "Sauvegarde..." : "Sauvegarder"}</Btn>
          </div>
        </Modal>
      )}

      {/* Modal — Ajouter membre */}
      {modalAjoutMembre && (
        <Modal title={`Ajouter un membre — ${modalAjoutMembre.nom}`} onClose={() => { setModalAjoutMembre(null); reset(); }}>
          <Input placeholder="Rechercher..." value={searchEmp} onChange={(e) => setSearchEmp(e.target.value)} style={{ marginBottom: '0.75rem' }} />
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {disponibles(modalAjoutMembre).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: '0.875rem', padding: '1rem' }}>Aucun employé disponible</p>
            ) : disponibles(modalAjoutMembre).map((emp) => (
              <EmpRow
                key={emp.userId}
                emp={emp}
                onClick={() => handleAssignerMembre(modalAjoutMembre, emp)}
                icon={<UserPlus style={{ width: '14px', height: '14px' }} />}
              />
            ))}
          </div>
        </Modal>
      )}

      {/* Modal — Manager */}
      {modalManager && (
        <Modal title={`Manager — ${modalManager.nom}`} onClose={() => { setModalManager(null); reset(); }}>
          {errorManager && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
              {errorManager}
            </div>
          )}
          {modalManager.manager && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <AvatarInitials firstName={modalManager.manager.prenom} lastName={modalManager.manager.nom} size="sm" />
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                  {modalManager.manager.prenom} {modalManager.manager.nom}
                  <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}> (actuel)</span>
                </p>
              </div>
              <Btn variant="danger" size="sm" onClick={() => handleAssignerManager(modalManager, null)}>Retirer</Btn>
            </div>
          )}
          <Input placeholder="Rechercher..." value={searchEmp} onChange={(e) => setSearchEmp(e.target.value)} style={{ marginBottom: '0.75rem' }} />
          <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {managersDisponibles(modalManager).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: '0.875rem', padding: '1rem' }}>
                Aucun manager disponible sans équipe
              </p>
            ) : managersDisponibles(modalManager).map((emp) => (
              <EmpRow
                key={emp.userId}
                emp={emp}
                onClick={() => handleAssignerManager(modalManager, emp.userId)}
                icon={<UserPlus style={{ width: '14px', height: '14px' }} />}
                showRole
              />
            ))}
            {allEmployes.filter((e) => e.role?.nom === 'MANAGER').length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: '0.875rem', padding: '1rem' }}>
                Aucun employé avec le rôle Manager
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConsulterDepartement;

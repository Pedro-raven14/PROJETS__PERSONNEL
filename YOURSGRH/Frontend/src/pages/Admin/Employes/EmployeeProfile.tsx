import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, Calendar, Building2,
  Briefcase, Zap, Target, Shield, X, Plus, Check, UserX,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/UI/Tabs";
import { useIsMobile } from "../../../hooks/Use-mobile";
import {
  employeeService, congeService, evaluationService,
  formationService, contratService, competenceService,
  objectifService,
} from "../../../lib/mockService";

// --- Types alignés sur le backend ---

type Employee = {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  poste: string;
  date_embauche: string;
  soldeConges: number;
  mustChangePassword: boolean;
  role: { nom: string };
  permissions: { nom: string }[];
  equipe?: { equipeId: number; nom: string; departement?: { nom: string } } | null;
};

type Conge = {
  congeId: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  commentaire?: string;
  typeConge: { nomType: string };
};

type Evaluation = {
  evaluationId: number;
  note_globale: number;
  notes_criteres?: Record<string, number>;
  date: string;
  commentaire?: string;
  cycle: { nom: string };
  evaluateur?: { prenom: string; nom: string };
};

type Formation = {
  formationId: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  duree: number;
};

type Contrat = {
  contratId: number;
  type: string;
  date_debut: string;
  date_fin?: string;
  poste: string;
  salaire: number;
  statut: string;
  signe: boolean;
};

type EmployeCompetence = {
  id: number;
  niveau: number;
  competence: { competenceId: number; nom: string; categorie?: string };
};

type Objectif = {
  objectifId: number;
  titre: string;
  status: string;
  points: number;
  date_debut: string;
  date_fin: string;
};

// Correspondance niveau BDD → label + couleur
const NIVEAU_INFO: Record<number, { label: string; pct: number; color: string }> = {
  1: { label: "Débutant",      pct: 20,  color: "var(--color-success)" },
  2: { label: "Basique",       pct: 40,  color: "var(--color-success)" },
  3: { label: "Intermédiaire", pct: 60,  color: "var(--color-warning)" },
  4: { label: "Avancé",        pct: 80,  color: "var(--color-primary)" },
  5: { label: "Expert",        pct: 100, color: "var(--color-destructive)" },
};

// ─── Libellés lisibles pour chaque permission ───────────────────────────────

const PERM_LABELS: Record<string, string> = {
  VIEW_EMPLOYEES:    "Voir les employés",
  CREATE_EMPLOYEE:   "Créer un employé",
  VIEW_DEPARTMENTS:  "Voir les départements",
  MANAGE_DEPARTMENTS:"Gérer les départements",
  VIEW_CONTRACTS:    "Voir les contrats",
  MANAGE_CONTRACTS:  "Gérer les contrats",
  VIEW_LEAVES:       "Voir les congés",
  APPROVE_LEAVE:     "Valider les congés",
  VIEW_EVALUATIONS:  "Voir les évaluations",
  MANAGE_EVALUATIONS:"Gérer les évaluations",
  VIEW_TRAININGS:    "Voir les formations",
  MANAGE_TRAININGS:  "Gérer les formations",
  VIEW_TEAM:         "Voir son équipe",
  VIEW_SALARY:       "Voir les salaires",
  VIEW_REPORTS:      "Voir les rapports",
  VIEW_AI:           "Accès analyses IA",
};

// Couleur par catégorie de permission
const PERM_COLOR = (nom: string): string => {
  if (nom.startsWith("MANAGE_") || nom === "APPROVE_LEAVE" || nom === "CREATE_EMPLOYEE")
    return "var(--color-primary)";
  if (nom.startsWith("VIEW_"))
    return "var(--color-success)";
  return "var(--color-muted-foreground)";
};

// ─── Composant panneau permissions ───────────────────────────────────────────

type PermissionItem = { nom: string };

type PermissionsPanelProps = {
  employeeId: number;
  permissions: PermissionItem[];
  onUpdate: (updated: PermissionItem[]) => void;
};

const PermissionsPanel = ({ employeeId, permissions, onUpdate }: PermissionsPanelProps) => {
  const [allPerms, setAllPerms] = useState<PermissionItem[]>([]);
  const [showAdd,  setShowAdd]  = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [adding,   setAdding]   = useState<string | null>(null);
  const [erreur,   setErreur]   = useState<string | null>(null);

  useEffect(() => {
    setAllPerms(employeeService.getAllPermissions().data);
  }, []);

  const currentNoms = new Set(permissions.map((p) => p.nom));
  const disponibles = allPerms.filter((p) => !currentNoms.has(p.nom));

  const handleRetirer = (nom: string) => {
    setRemoving(nom);
    setErreur(null);
    try {
      employeeService.removePermission(employeeId, nom);
      onUpdate(permissions.filter((p) => p.nom !== nom));
    } catch (e: any) {
      setErreur(e?.message ?? "Erreur lors de la suppression");
    } finally {
      setRemoving(null);
    }
  };

  const handleAjouter = (nom: string) => {
    setAdding(nom);
    setErreur(null);
    try {
      employeeService.addPermission(employeeId, nom);
      onUpdate([...permissions, { nom }]);
      setShowAdd(false);
    } catch (e: any) {
      setErreur(e?.message ?? "Erreur lors de l'ajout");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
            <Shield style={{ width: '14px', height: '14px' }} />
          </div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 600 }}>
            Permissions
            <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-muted-foreground)' }}>
              ({permissions.length})
            </span>
          </h3>
        </div>
        {disponibles.length > 0 && (
          <button
            onClick={() => { setShowAdd((v) => !v); setErreur(null); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3rem 0.7rem', borderRadius: '0.375rem',
              border: '1px solid var(--color-border)',
              background: showAdd ? 'var(--color-primary)' : 'transparent',
              color: showAdd ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
              cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'var(--font-display)', fontWeight: 500,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Plus style={{ width: '13px', height: '13px' }} />
            Ajouter
          </button>
        )}
      </div>

      {/* Erreur */}
      {erreur && (
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.375rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.8125rem' }}>
          {erreur}
        </div>
      )}

      {/* Panneau d'ajout */}
      {showAdd && disponibles.length > 0 && (
        <div style={{ borderRadius: '0.625rem', border: '1px solid var(--color-border)', padding: '0.875rem', backgroundColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)' }}>
          <p style={{ margin: '0 0 0.625rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)', fontWeight: 500 }}>
            Sélectionner une permission à ajouter
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {disponibles.map((p) => (
              <button
                key={p.nom}
                onClick={() => handleAjouter(p.nom)}
                disabled={adding === p.nom}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.25rem 0.625rem', borderRadius: '9999px',
                  border: '1px dashed var(--color-border)',
                  background: adding === p.nom ? 'var(--color-success)' : 'var(--color-card)',
                  color: adding === p.nom ? '#fff' : 'var(--color-foreground)',
                  cursor: adding === p.nom ? 'wait' : 'pointer',
                  fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 500,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => { if (adding !== p.nom) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; }}
                onMouseLeave={(e) => { if (adding !== p.nom) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
              >
                {adding === p.nom
                  ? <Check style={{ width: '11px', height: '11px' }} />
                  : <Plus style={{ width: '11px', height: '11px' }} />
                }
                {PERM_LABELS[p.nom] ?? p.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des permissions actuelles */}
      {permissions.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px dashed var(--color-border)', color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
          Aucune permission attribuée
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {permissions.map((p) => {
            const color = PERM_COLOR(p.nom);
            const isRemoving = removing === p.nom;
            return (
              <div
                key={p.nom}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {PERM_LABELS[p.nom] ?? p.nom}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)', opacity: 0.7 }}>
                    {p.nom}
                  </span>
                </div>
                <button
                  onClick={() => handleRetirer(p.nom)}
                  disabled={isRemoving}
                  title="Retirer cette permission"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: isRemoving ? 'wait' : 'pointer',
                    color: 'var(--color-muted-foreground)',
                    transition: 'background 0.15s, color 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 12%, transparent)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-destructive)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted-foreground)';
                  }}
                >
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const EmployeeProfile = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Détecter le rôle pour adapter les navigations
  const basePath = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null')?.role?.toLowerCase() === 'rh' ? '/rh' : '/admin'; }
    catch { return '/admin'; }
  })();

  const [employee,    setEmployee]    = useState<Employee | null>(null);
  const [conges,      setConges]      = useState<Conge[]>([]);
  const [evals,       setEvals]       = useState<Evaluation[]>([]);
  const [formations,  setFormations]  = useState<Formation[]>([]);
  const [contrats,    setContrats]    = useState<Contrat[]>([]);
  const [competences, setCompetences] = useState<EmployeCompetence[]>([]);
  const [objectifs,   setObjectifs]   = useState<Objectif[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showLicencier, setShowLicencier] = useState(false);
  const [licenciementLoading, setLicenciementLoading] = useState(false);
  const [licenciementError,   setLicenciementError]   = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!id) return;
    try {
      const userId = Number(id);
      const emp    = employeeService.getById(userId);
      setEmployee(emp);
      setConges(congeService.getByEmployee(userId));
      setEvals(evaluationService.getByEmployee(userId));
      setFormations(formationService.getByEmployee(userId));
      setContrats(contratService.getByEmployee(userId));
      setCompetences(competenceService.getByEmployee(userId));
      const equipeId = emp?.equipe?.equipeId;
      if (equipeId) setObjectifs(objectifService.getByEquipe(equipeId));
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <p style={{ padding: '2rem', color: 'var(--color-muted-foreground)' }}>Chargement...</p>;
  }

  if (!employee) {
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Employé introuvable.</p>;
  }

  const anciennete   = Math.floor(
    (Date.now() - new Date(employee.date_embauche).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const contratActif = contrats.find((c) => c.statut === 'ACTIF');
  const aContratActif = !!contratActif;
  // Ne jamais proposer le licenciement pour Admin et RH
  const roleProtege   = ['ADMIN', 'RH'].includes(employee.role?.nom?.toUpperCase() ?? '');

  const handleLicencier = () => {
    setLicenciementLoading(true);
    setLicenciementError("");
    try {
      contratService.licencier(employee.userId);
      setContrats(contratService.getByEmployee(employee.userId));
      setShowLicencier(false);
    } catch (e: any) {
      setLicenciementError(e?.message || "Erreur lors du licenciement");
    } finally {
      setLicenciementLoading(false);
    }
  };

  // Données pour le graphique des évaluations — correction note_globale
  const evalChartData = [...evals]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      cycle: e.cycle?.nom ?? e.date,
      note:  parseFloat(String(e.note_globale)) || 0,
    }));

  const infoRow = (label: string, value: string | undefined) => (
    <div key={label} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '0.875rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Retour */}
      <button
        onClick={() => navigate(`${basePath}/employees`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.875rem', color: 'var(--color-muted-foreground)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-display)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-foreground)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted-foreground)')}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Retour aux employés
      </button>

      {/* En-tête profil */}
      <div className="stat-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem' }}>
          <AvatarInitials firstName={employee.prenom} lastName={employee.nom} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
              {employee.prenom} {employee.nom}
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-muted-foreground)' }}>
              {employee.poste || employee.role?.nom}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              {employee.equipe && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Building2 style={{ width: '14px', height: '14px' }} />
                  {employee.equipe.nom}
                  {employee.equipe.departement && ` — ${employee.equipe.departement.nom}`}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                {anciennete > 0 ? `${anciennete} an(s) d'ancienneté` : 'Moins d\'un an'}
              </span>
              {contratActif && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Briefcase style={{ width: '14px', height: '14px' }} />
                  {contratActif.type}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mail style={{ width: '14px', height: '14px' }} />
                {employee.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Phone style={{ width: '14px', height: '14px' }} />
                {employee.phone}
              </span>
            </div>
          </div>
          <span className={`badge-status ${employee.mustChangePassword ? 'badge-warning' : 'badge-success'}`}>
            {employee.mustChangePassword ? 'Mot de passe à changer' : 'Actif'}
          </span>

          {/* Bouton Licencier — uniquement si contrat actif et rôle non protégé */}
          {aContratActif && !roleProtege && (
            <button
              onClick={() => { setShowLicencier(true); setLicenciementError(""); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4rem 0.875rem', borderRadius: '0.5rem',
                border: '1.5px solid var(--color-destructive)', background: 'transparent',
                color: 'var(--color-destructive)', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 8%, transparent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              <UserX style={{ width: '14px', height: '14px' }} />
              Licencier
            </button>
          )}

          {/* Badge licencié si plus de contrat actif et rôle non protégé */}
          {!aContratActif && !roleProtege && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.2rem 0.6rem', borderRadius: '9999px',
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)',
              color: 'var(--color-destructive)', fontSize: '0.7rem', fontWeight: 600,
            }}>
              <UserX style={{ width: '11px', height: '11px' }} />
              Accès révoqué
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList style={{ flexWrap: 'wrap', height: 'auto' }}>
          <TabsTrigger value="general">Informations</TabsTrigger>
          <TabsTrigger value="conges">
            Congés {conges.length > 0 && `(${conges.length})`}
          </TabsTrigger>
          <TabsTrigger value="evaluations">
            Évaluations {evals.length > 0 && `(${evals.length})`}
          </TabsTrigger>
          <TabsTrigger value="formations">
            Formations {formations.length > 0 && `(${formations.length})`}
          </TabsTrigger>
          <TabsTrigger value="contrats">
            Contrats {contrats.length > 0 && `(${contrats.length})`}
          </TabsTrigger>
          <TabsTrigger value="competences">
            Compétences {competences.length > 0 && `(${competences.length})`}
          </TabsTrigger>
          {employee.equipe && (
            <TabsTrigger value="objectifs">
              Objectifs équipe {objectifs.length > 0 && `(${objectifs.length})`}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="general">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Informations personnelles</h3>
              {infoRow("Prénom", employee.prenom)}
              {infoRow("Nom", employee.nom)}
              {infoRow("Email", employee.email)}
              {infoRow("Téléphone", employee.phone)}
              {infoRow("Poste", employee.poste)}
              {infoRow("Rôle", employee.role?.nom)}
              {infoRow("Date d'embauche", new Date(employee.date_embauche).toLocaleDateString('fr-FR'))}
              {infoRow("Solde congés", `${employee.soldeConges} jour(s)`)}
            </div>

            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <PermissionsPanel
                employeeId={employee.userId}
                permissions={employee.permissions}
                onUpdate={(updated) => setEmployee((prev) => prev ? { ...prev, permissions: updated } : prev)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Onglet Congés */}
        <TabsContent value="conges">
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {conges.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucun congé enregistré</p>
                ) : conges.map((c, i) => (
                  <div key={c.congeId} style={{ padding: '0.875rem 1rem', borderBottom: i < conges.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.typeConge?.nomType}</span>
                      <span className={
                        c.statut === 'APPROUVE' ? 'badge-status badge-success' :
                        c.statut === 'REFUSE'   ? 'badge-status badge-destructive' :
                        'badge-status badge-warning'
                      }>{c.statut}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {new Date(c.date_debut).toLocaleDateString('fr-FR')} — {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Type</th>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Début</th>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Fin</th>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {conges.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucun congé enregistré</td></tr>
                  ) : conges.map((c) => (
                    <tr key={c.congeId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>{c.typeConge?.nomType}</td>
                      <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                        {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                        {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '0.75rem 1.5rem' }}>
                        <span className={
                          c.statut === 'APPROUVE' ? 'badge-status badge-success' :
                          c.statut === 'REFUSE'   ? 'badge-status badge-destructive' :
                          'badge-status badge-warning'
                        }>
                          {c.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Onglet Évaluations */}
        <TabsContent value="evaluations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {evalChartData.length > 0 && (
              <div className="stat-card">
                <h3 className="section-title" style={{ marginBottom: '1rem' }}>Évolution des notes</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={evalChartData}>
                    <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}
                    />
                    <Bar dataKey="note" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {evals.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucune évaluation</p>
                  ) : evals.map((ev, i) => (
                    <div key={ev.evaluationId} style={{ padding: '0.875rem 1rem', borderBottom: i < evals.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{ev.cycle?.nom}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent)' }}>
                          {parseFloat(String(ev.note_globale)).toFixed(1)}<span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>/5</span>
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                        {new Date(ev.date).toLocaleDateString('fr-FR')}
                        {ev.commentaire ? ` · ${ev.commentaire}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Cycle</th>
                      <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Date</th>
                      <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Note</th>
                      <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evals.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucune évaluation</td></tr>
                    ) : evals.map((ev) => (
                      <tr key={ev.evaluationId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>{ev.cycle?.nom}</td>
                        <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                          {new Date(ev.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent)' }}>
                            {parseFloat(String(ev.note_globale)).toFixed(1)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>/5</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                          {ev.commentaire || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Onglet Formations */}
        <TabsContent value="formations">
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {formations.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucune formation suivie</p>
                ) : formations.map((f, i) => (
                  <div key={f.formationId} style={{ padding: '0.875rem 1rem', borderBottom: i < formations.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, flex: 1, marginRight: '0.5rem' }}>{f.titre}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0 }}>{f.duree}h</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {new Date(f.date_debut).toLocaleDateString('fr-FR')} — {new Date(f.date_fin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Formation</th>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Début</th>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Fin</th>
                    <th className="table-header" style={{ padding: '0.75rem 1.5rem', textAlign: 'left' }}>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {formations.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucune formation suivie</td></tr>
                  ) : formations.map((f) => (
                    <tr key={f.formationId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{f.titre}</p>
                        {f.description && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{f.description}</p>}
                      </td>
                      <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                        {new Date(f.date_debut).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                        {new Date(f.date_fin).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>{f.duree}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Onglet Contrats */}
        <TabsContent value="contrats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contrats.length === 0 ? (
              <div className="stat-card" style={{ textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
                Aucun contrat enregistré
              </div>
            ) : contrats.map((c) => (
              <div key={c.contratId} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{c.type} — {c.poste}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      Du {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                      {c.date_fin ? ` au ${new Date(c.date_fin).toLocaleDateString('fr-FR')}` : ' (en cours)'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge-status ${c.statut === 'ACTIF' ? 'badge-success' : 'badge-muted'}`}>{c.statut}</span>
                    <span className={`badge-status ${c.signe ? 'badge-success' : 'badge-warning'}`}>
                      {c.signe ? 'Signé' : 'Non signé'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Salaire mensuel</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {Number(c.salaire).toLocaleString('fr-FR', { useGrouping: true }).replace(/\s/g, ' ')} FCFA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        {/* Onglet Compétences */}
        <TabsContent value="competences">
          {competences.length === 0 ? (
            <div className="stat-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-muted-foreground)' }}>
              <Zap style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ margin: 0 }}>Aucune compétence enregistrée pour cet employé.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {competences.map((ec) => {
                const info = NIVEAU_INFO[ec.niveau] ?? NIVEAU_INFO[1];
                return (
                  <div key={ec.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {/* Nom + catégorie */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem' }}>
                        {ec.competence.nom}
                      </span>
                      {ec.competence.categorie && (
                        <span style={{
                          fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '999px',
                          backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)',
                        }}>
                          {ec.competence.categorie}
                        </span>
                      )}
                    </div>

                    {/* Barre de progression */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--color-muted-foreground)' }}>Niveau</span>
                        <span style={{ fontWeight: 600, color: info.color }}>{info.label}</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '999px',
                          width: `${info.pct}%`,
                          backgroundColor: info.color,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>{info.pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Onglet Objectifs équipe — lecture seule */}
        <TabsContent value="objectifs">
          {objectifs.length === 0 ? (
            <div className="stat-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-muted-foreground)' }}>
              <Target style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ margin: 0 }}>Aucun objectif défini pour l'équipe de cet employé.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {objectifs.map((obj) => (
                <div key={obj.objectifId} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Target style={{ width: '15px', height: '15px', color: 'var(--color-muted-foreground)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {obj.titre}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {new Date(obj.date_debut).toLocaleDateString('fr-FR')} → {new Date(obj.date_fin).toLocaleDateString('fr-FR')}
                      {obj.points > 0 && ` · ${obj.points} pts`}
                    </p>
                  </div>
                  <span className={
                    obj.status === 'ATTEINT'     ? 'badge-status badge-success' :
                    obj.status === 'EN_COURS'    ? 'badge-status badge-warning' :
                    obj.status === 'NON_ATTEINT' ? 'badge-status badge-destructive' :
                    'badge-status badge-muted'
                  }>
                    {obj.status === 'EN_COURS'    ? 'En cours'    :
                     obj.status === 'ATTEINT'     ? 'Atteint'     :
                     obj.status === 'NON_ATTEINT' ? 'Non atteint' :
                     obj.status === 'ANNULE'      ? 'Annulé'      : obj.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>

    {/* ── Modal de confirmation de licenciement ── */}
    {showLicencier && (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowLicencier(false); }}
      >
        <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', flexShrink: 0 }}>
              <UserX style={{ width: '18px', height: '18px', color: 'var(--color-destructive)' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700 }}>
                Confirmer le licenciement
              </h2>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                {employee.prenom} {employee.nom}
              </p>
            </div>
          </div>

          {/* Avertissement */}
          <div style={{ padding: '0.875rem 1rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-destructive) 20%, transparent)', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--color-destructive)', lineHeight: 1.5 }}>
            Cette action résiliera le ou les contrat(s) actif(s) de <strong>{employee.prenom} {employee.nom}</strong> et bloquera définitivement son accès à la plateforme.
          </div>

          {licenciementError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {licenciementError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowLicencier(false)}
              disabled={licenciementLoading}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem' }}
            >
              Annuler
            </button>
            <button
              onClick={handleLicencier}
              disabled={licenciementLoading}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-destructive)', color: '#fff', cursor: licenciementLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', opacity: licenciementLoading ? 0.7 : 1 }}
            >
              {licenciementLoading ? "Traitement..." : "Confirmer le licenciement"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default EmployeeProfile;

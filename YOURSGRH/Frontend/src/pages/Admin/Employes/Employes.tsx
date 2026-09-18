import { useEffect, useState } from "react";
import { Search, Plus, Eye, Pencil, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Button } from "../../../components/UI/Button";
import { Input } from "../../../components/UI/Input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/UI/Select";
import { employeeService } from "../../../lib/mockService";
import AjoutEmployee from "./AjoutEmployee";
import AjoutCompetences from "./AjoutCompetences";
import CreateContrat from "./CreateContrat";
import ContratsList from "./ContratsList";
import ModifierEmployee from "./ModifierEmployee";

// ─── Types ────────────────────────────────────────────────────────────────────

type Contrat = { statut: string; type: string; salaire: number };

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
  equipe?: {
    nom: string;
    departement?: { nom: string };
    manager?: { userId: number; nom: string; prenom: string };
  } | null;
  contrats?: Contrat[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// Bouton action avec hover géré localement
const ActionBtn = ({
  onClick, title, children,
}: { onClick: () => void; title: string; children: React.ReactNode }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "0.4rem 0.5rem",
        borderRadius: "0.375rem",
        border: "none",
        background: hov ? "var(--color-muted)" : "transparent",
        cursor: "pointer",
        color: hov ? "var(--color-foreground)" : "var(--color-muted-foreground)",
        transition: "background 0.15s, color 0.15s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const Employes = () => {
  const [employees, setEmployees]     = useState<Employee[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [deptFilter, setDeptFilter]   = useState("all");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 10;
  const navigate = useNavigate();

  // Détecter le rôle pour adapter les navigations
  const basePath = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null')?.role?.toLowerCase() === 'rh' ? '/rh' : '/admin'; }
    catch { return '/admin'; }
  })();

  // Flux création : étape 1 = formulaire, étape 2 = compétences, étape 3 = contrat
  const [showAjout,       setShowAjout]       = useState(false);
  const [newEmployee,     setNewEmployee]     = useState<{ userId: number; prenom: string; nom: string } | null>(null);
  const [showCompetences, setShowCompetences] = useState<{ userId: number; prenom: string; nom: string } | null>(null);
  const [showContrats,    setShowContrats]    = useState<{ userId: number; prenom: string; nom: string } | null>(null);
  const [editEmployee,    setEditEmployee]    = useState<Employee | null>(null);

  const fetchEmployees = (p = 1) => {
    setLoading(true);
    try {
      const result = employeeService.getAll(p, LIMIT);
      setEmployees(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(p);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(1); }, []);

  // Listes dynamiques pour les filtres
  const depts = [...new Set(
    employees.map((e) => e.equipe?.departement?.nom).filter(Boolean) as string[]
  )];
  const roles = [...new Set(employees.map((e) => e.role?.nom).filter(Boolean))];

  const filtered = employees.filter((e) => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.poste ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchDept   = deptFilter === "all" || e.equipe?.departement?.nom === deptFilter;
    const matchRole   = roleFilter === "all" || e.role?.nom === roleFilter;
    return matchSearch && matchDept && matchRole;
  });

  // ── Styles entête tableau ────────────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    padding: "0.75rem 1.25rem",
    textAlign: "left",
    fontFamily: "var(--font-display)",
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--color-muted-foreground)",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--color-border)",
    background: "var(--color-card)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    verticalAlign: "middle",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Employés"
        subtitle={`${total} employé(s) enregistré(s)`}
        actions={
          <Button onClick={() => setShowAjout(true)}>
            <Plus style={{ width: "16px", height: "16px", marginRight: "0.375rem" }} />
            Ajouter un employé
          </Button>
        }
      />

      {/* ── Filtres ── */}
      <div className="stat-card">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search style={{
              position: "absolute", left: "0.75rem", top: "50%",
              transform: "translateY(-50%)", width: "15px", height: "15px",
              color: "var(--color-muted-foreground)", pointerEvents: "none",
            }} />
            <Input
              placeholder="Rechercher par nom, poste..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger style={{ width: "190px" }}>
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les départements</SelectItem>
              {depts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger style={{ width: "155px" }}>
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Employé</th>
                <th style={thStyle}>Poste</th>
                <th style={thStyle}>Département</th>
                <th style={thStyle}>Manager</th>
                <th style={thStyle}>Contrat</th>
                <th style={thStyle}>Embauche</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "var(--color-muted-foreground)", padding: "3rem" }}>
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "var(--color-muted-foreground)", padding: "3rem" }}>
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : filtered.map((emp) => {
                const contratActif = emp.contrats?.find((c) => c.statut === "ACTIF");
                const manager      = emp.equipe?.manager;
                const dept         = emp.equipe?.departement?.nom;

                return (
                  <tr
                    key={emp.userId}
                    style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--color-muted) 40%, transparent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    {/* Employé */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <AvatarInitials firstName={emp.prenom} lastName={emp.nom} size="sm" />
                        <div>
                          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.3 }}>
                            {emp.prenom} {emp.nom}
                          </p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Poste */}
                    <td style={{ ...tdStyle, fontFamily: "var(--font-body)" }}>
                      {emp.poste || <span style={{ color: "var(--color-muted-foreground)" }}>—</span>}
                    </td>

                    {/* Département */}
                    <td style={tdStyle}>
                      {dept
                        ? <span className="badge-primary">{dept}</span>
                        : <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
                      }
                    </td>

                    {/* Manager */}
                    <td style={{ ...tdStyle, color: "var(--color-muted-foreground)" }}>
                      {manager ? `${manager.prenom} ${manager.nom}` : "—"}
                    </td>

                    {/* Contrat */}
                    <td style={tdStyle}>
                      {contratActif
                        ? <span className="badge-muted">{contratActif.type}</span>
                        : <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
                      }
                    </td>

                    {/* Embauche */}
                    <td style={{ ...tdStyle, color: "var(--color-muted-foreground)", whiteSpace: "nowrap" }}>
                      {fmtDate(emp.date_embauche)}
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.125rem" }}>
                        <ActionBtn onClick={() => navigate(`${basePath}/employees/${emp.userId}`)} title="Voir profil">
                          <Eye style={{ width: "15px", height: "15px" }} />
                        </ActionBtn>
                        <ActionBtn onClick={() => setEditEmployee(emp)} title="Modifier">
                          <Pencil style={{ width: "15px", height: "15px" }} />
                        </ActionBtn>
                        <ActionBtn onClick={() => setShowContrats({ userId: emp.userId, prenom: emp.prenom, nom: emp.nom })} title="Documents">
                          <FileText style={{ width: "15px", height: "15px" }} />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "1px solid var(--color-border)", padding: "0.75rem 1.25rem",
        }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-muted-foreground)" }}>
            {filtered.length} résultat(s) sur {total}
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchEmployees(page - 1)}>
              Précédent
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchEmployees(page + 1)}>
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {editEmployee && (
        <ModifierEmployee
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSuccess={(updated) => {
            setEmployees((prev) => prev.map((e) => e.userId === updated.userId ? { ...e, ...updated } : e));
            setEditEmployee(null);
          }}
        />
      )}

      {showContrats && (
        <ContratsList employee={showContrats} onClose={() => setShowContrats(null)} />
      )}

      {showAjout && (
        <AjoutEmployee
          onClose={() => setShowAjout(false)}
          onSuccess={(emp) => {
            setShowAjout(false);
            setShowCompetences(emp);
            fetchEmployees(1);
          }}
        />
      )}

      {showCompetences && (
        <AjoutCompetences
          employee={showCompetences}
          onClose={() => setShowCompetences(null)}
          onSuccess={() => {
            setNewEmployee(showCompetences);
            setShowCompetences(null);
          }}
        />
      )}

      {newEmployee && (
        <CreateContrat
          employee={newEmployee}
          onClose={() => setNewEmployee(null)}
          onSuccess={() => setNewEmployee(null)}
        />
      )}
    </div>
  );
};

export default Employes;

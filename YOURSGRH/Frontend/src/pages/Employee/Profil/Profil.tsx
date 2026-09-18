import { useEffect, useState } from "react";
import {
  Mail, Phone, Calendar, Building2, Briefcase, Zap, Target,
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

// --- Types ---

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

type Objectif = {
  objectifId: number;
  titre: string;
  status: string;
  points: number;
  date_debut: string;
  date_fin: string;
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
  statut: string;
  signe: boolean;
};

type EmployeCompetence = {
  id: number;
  niveau: number;
  competence: { competenceId: number; nom: string; categorie?: string };
};

const NIVEAU_INFO: Record<number, { label: string; pct: number; color: string }> = {
  1: { label: "Débutant",      pct: 20,  color: "var(--color-success)" },
  2: { label: "Basique",       pct: 40,  color: "var(--color-success)" },
  3: { label: "Intermédiaire", pct: 60,  color: "var(--color-warning)" },
  4: { label: "Avancé",        pct: 80,  color: "var(--color-primary)" },
  5: { label: "Expert",        pct: 100, color: "var(--color-destructive)" },
};

const Profil = () => {
  const empLocal   = JSON.parse(localStorage.getItem("employee") || "{}");
  const userId     = empLocal?.userId;

  const [employee,    setEmployee]    = useState<Employee | null>(null);
  const [conges,      setConges]      = useState<Conge[]>([]);
  const [evals,       setEvals]       = useState<Evaluation[]>([]);
  const [formations,  setFormations]  = useState<Formation[]>([]);
  const [contrats,    setContrats]    = useState<Contrat[]>([]);
  const [competences, setCompetences] = useState<EmployeCompetence[]>([]);
  const [objectifs,   setObjectifs]   = useState<Objectif[]>([]);
  const [loading,     setLoading]     = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!userId) return;
    try {
      setEmployee(employeeService.getById(userId));
      setConges(congeService.getMesConges(userId));
      setEvals(evaluationService.getByEmployee(userId));
      setFormations(formationService.getByEmployee(userId));
      setContrats(contratService.getMesContrats(userId));
      setCompetences(competenceService.getByEmployee(userId));
      const emp = employeeService.getById(userId);
      const equipeId = emp?.equipe?.equipeId;
      if (equipeId) setObjectifs(objectifService.getByEquipe(equipeId));
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return <p style={{ padding: '2rem', color: 'var(--color-muted-foreground)' }}>Chargement...</p>;
  }

  if (!employee) {
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Profil introuvable.</p>;
  }

  const anciennete = Math.floor(
    (Date.now() - new Date(employee.date_embauche).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const contratActif = contrats.find((c) => c.statut === 'ACTIF');

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

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
                {anciennete > 0 ? `${anciennete} an(s) d'ancienneté` : "Moins d'un an"}
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
          {/* Solde congés mis en avant */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
            backgroundColor: 'var(--color-muted)', gap: '0.25rem',
            width: isMobile ? '100%' : 'auto',
          }}>
            <span style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>
              {employee.soldeConges}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>jour(s) de congé</span>
          </div>
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
              <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Équipe & Département</h3>
              {employee.equipe ? (
                <>
                  {infoRow("Équipe", employee.equipe.nom)}
                  {infoRow("Département", employee.equipe.departement?.nom)}
                </>
              ) : (
                <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
                  Non affecté à une équipe
                </p>
              )}
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
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
                        Aucun congé enregistré
                      </td>
                    </tr>
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
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '0.5rem',
                      }}
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
                      <tr>
                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
                          Aucune évaluation
                        </td>
                      </tr>
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
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
                        Aucune formation suivie
                      </td>
                    </tr>
                  ) : formations.map((f) => (
                    <tr key={f.formationId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{f.titre}</p>
                        {f.description && (
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{f.description}</p>
                        )}
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

        {/* Onglet Contrats — salaire masqué pour l'employé */}
        <TabsContent value="contrats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contrats.length === 0 ? (
              <div className="stat-card" style={{ textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
                Aucun contrat enregistré
              </div>
            ) : contrats.map((c) => (
              <div key={c.contratId} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {c.type} — {c.poste}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      Du {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                      {c.date_fin ? ` au ${new Date(c.date_fin).toLocaleDateString('fr-FR')}` : ' (en cours)'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge-status ${c.statut === 'ACTIF' ? 'badge-success' : 'badge-muted'}`}>
                      {c.statut}
                    </span>
                    <span className={`badge-status ${c.signe ? 'badge-success' : 'badge-warning'}`}>
                      {c.signe ? 'Signé' : 'Non signé'}
                    </span>
                  </div>
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
              <p style={{ margin: 0 }}>Aucune compétence enregistrée pour votre profil.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {competences.map((ec) => {
                const info = NIVEAU_INFO[ec.niveau] ?? NIVEAU_INFO[1];
                return (
                  <div key={ec.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
              <p style={{ margin: 0 }}>Aucun objectif défini pour votre équipe.</p>
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
                    obj.status === 'ATTEINT'    ? 'badge-status badge-success' :
                    obj.status === 'EN_COURS'   ? 'badge-status badge-warning' :
                    obj.status === 'NON_ATTEINT'? 'badge-status badge-destructive' :
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
  );
};

export default Profil;

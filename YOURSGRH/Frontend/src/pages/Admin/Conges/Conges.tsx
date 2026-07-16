import { useEffect, useState } from "react";
import { Check, X, CalendarDays, Plus, Trash2, Settings } from "lucide-react";
import axios from "axios";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/UI/Tabs";
import { API_URL } from "../../../config/api";
import { useIsMobile } from "../../../hooks/Use-mobile";

type TypeConge = {
  typeCId: number;
  nomType: string;
  impacte_salaire: boolean;
};

type Conge = {
  congeId: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  commentaire?: string;
  demandeur: { userId: number; nom: string; prenom: string; poste?: string };
  typeConge: { nomType: string; impacte_salaire: boolean };
  validateur?: { nom: string; prenom: string } | null;
};

const nbJours = (debut: string, fin: string) =>
  Math.ceil((new Date(fin).getTime() - new Date(debut).getTime()) / (1000 * 60 * 60 * 24)) + 1;

// ── Modal gestion des types de congés ────────────────────────────────────────

const ModalTypes = ({
  types,
  onClose,
  onRefresh,
}: {
  types: TypeConge[];
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [nomType,         setNomType]         = useState("");
  const [impacteSalaire,  setImpacteSalaire]  = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState("");

  const handleCreate = async () => {
    if (!nomType.trim()) { setError("Le nom est obligatoire"); return; }
    setSaving(true); setError("");
    try {
      await axios.post(
        `${API_URL}/type-conge/add`,
        { nomType: nomType.trim(), impacte_salaire: impacteSalaire },
        { headers },
      );
      setNomType(""); setImpacteSalaire(false);
      onRefresh();
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de la création");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce type de congé ?")) return;
    try {
      await axios.delete(`${API_URL}/type-conge/${id}`, { headers });
      onRefresh();
    } catch { /* silencieux */ }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
            Types de congés
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Formulaire création */}
        <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-muted)', marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Nouveau type</p>

          {error && (
            <div style={{ marginBottom: '0.75rem', padding: '0.625rem', borderRadius: '0.375rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="ex: Congé annuel, Congé maladie, Congé sans solde..."
              value={nomType}
              onChange={(e) => setNomType(e.target.value)}
              style={{ width: '100%', height: '2.5rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />

            {/* Toggle impacte_salaire */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Impacte le salaire</p>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                  {impacteSalaire
                    ? 'Déduction appliquée sur la fiche de paie (congé non payé, absence)'
                    : 'Aucune déduction (congé payé, maladie, maternité...)'}
                </p>
              </div>
              <button
                onClick={() => setImpacteSalaire((v) => !v)}
                style={{
                  width: '44px', height: '24px', borderRadius: '9999px', border: 'none', cursor: 'pointer', flexShrink: 0,
                  backgroundColor: impacteSalaire ? 'var(--color-destructive)' : 'var(--color-border)',
                  position: 'relative', transition: 'background-color 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: impacteSalaire ? '22px' : '2px',
                  width: '20px', height: '20px', borderRadius: '9999px',
                  backgroundColor: 'white', transition: 'left 0.2s',
                }} />
              </button>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving || !nomType.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', opacity: (saving || !nomType.trim()) ? 0.6 : 1 }}
            >
              <Plus style={{ width: '15px', height: '15px' }} />
              {saving ? "Création..." : "Créer"}
            </button>
          </div>
        </div>

        {/* Liste des types existants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {types.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: '0.875rem', padding: '1rem 0' }}>
              Aucun type de congé créé
            </p>
          ) : types.map((t) => (
            <div key={t.typeCId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t.nomType}</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px',
                  backgroundColor: t.impacte_salaire
                    ? 'color-mix(in srgb, var(--color-destructive) 12%, transparent)'
                    : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                  color: t.impacte_salaire ? 'var(--color-destructive)' : 'var(--color-success)',
                }}>
                  {t.impacte_salaire ? 'Non payé' : 'Payé'}
                </span>
              </div>
              <button
                onClick={() => handleDelete(t.typeCId)}
                style={{ padding: '0.25rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
              >
                <Trash2 style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const CongesAdmin = () => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [conges,      setConges]      = useState<Conge[]>([]);
  const [types,       setTypes]       = useState<TypeConge[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [acting,      setActing]      = useState<number | null>(null);
  const [showTypes,   setShowTypes]   = useState(false);

  const fetchAll = async () => {
    try {
      const [congesRes, typesRes] = await Promise.all([
        axios.get(`${API_URL}/conge/getall?limit=1000`, { headers }),
        axios.get(`${API_URL}/type-conge/getall`, { headers }),
      ]);
      setConges(congesRes.data.data ?? congesRes.data);
      setTypes(typesRes.data);
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const enAttente = conges.filter((c) => c.statut === 'EN_ATTENTE');
  const approuves = conges.filter((c) => c.statut === 'APPROUVE');
  const refuses   = conges.filter((c) => c.statut === 'REFUSE');

  const handleAction = async (congeId: number, statut: 'APPROUVE' | 'REFUSE') => {
    setActing(congeId);
    try {
      await axios.patch(`${API_URL}/conge/${congeId}/valider`, { statut }, { headers });
      setConges((prev) => prev.map((c) => c.congeId === congeId ? { ...c, statut } : c));
    } catch { fetchAll(); }
    finally { setActing(null); }
  };

  const isMobile = useIsMobile();

  const TableConges = ({ items, showActions = false }: { items: Conge[]; showActions?: boolean }) => (
    <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
      {isMobile ? (
        /* ── Vue carte mobile ── */
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>Aucune demande</p>
          ) : items.map((c, i) => (
            <div
              key={c.congeId}
              style={{
                padding: '0.875rem 1rem',
                borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {/* Ligne 1 : avatar + nom + statut */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <AvatarInitials firstName={c.demandeur.prenom} lastName={c.demandeur.nom} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600 }}>
                    {c.demandeur.prenom} {c.demandeur.nom}
                  </p>
                  {c.demandeur.poste && (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{c.demandeur.poste}</p>
                  )}
                </div>
                <span className={
                  c.statut === 'APPROUVE' ? 'badge-status badge-success' :
                  c.statut === 'REFUSE'   ? 'badge-status badge-destructive' :
                  'badge-status badge-warning'
                }>
                  {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'}
                </span>
              </div>
              {/* Ligne 2 : type + période + jours */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                <span className="badge-muted">{c.typeConge?.nomType}</span>
                <span>{new Date(c.date_debut).toLocaleDateString('fr-FR')} — {new Date(c.date_fin).toLocaleDateString('fr-FR')}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>{nbJours(c.date_debut, c.date_fin)} j</span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px',
                  backgroundColor: c.typeConge?.impacte_salaire
                    ? 'color-mix(in srgb, var(--color-destructive) 12%, transparent)'
                    : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                  color: c.typeConge?.impacte_salaire ? 'var(--color-destructive)' : 'var(--color-success)',
                }}>
                  {c.typeConge?.impacte_salaire ? 'Déduction' : 'Payé'}
                </span>
                {showActions && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem' }}>
                    <button
                      title="Approuver"
                      disabled={acting === c.congeId}
                      onClick={() => handleAction(c.congeId, 'APPROUVE')}
                      style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-success)', opacity: acting === c.congeId ? 0.5 : 1 }}
                    >
                      <Check style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button
                      title="Refuser"
                      disabled={acting === c.congeId}
                      onClick={() => handleAction(c.congeId, 'REFUSE')}
                      style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)', opacity: acting === c.congeId ? 0.5 : 1 }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Vue tableau desktop ── */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Employé</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Type</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Période</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Jours</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Impact paie</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Statut</th>
                {showActions && <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>
                    Aucune demande
                  </td>
                </tr>
              ) : items.map((c) => (
                <tr
                  key={c.congeId}
                  style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <AvatarInitials firstName={c.demandeur.prenom} lastName={c.demandeur.nom} size="sm" />
                      <div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600 }}>
                          {c.demandeur.prenom} {c.demandeur.nom}
                        </p>
                        {c.demandeur.poste && (
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{c.demandeur.poste}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span className="badge-muted">{c.typeConge?.nomType}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }}>
                    {new Date(c.date_debut).toLocaleDateString('fr-FR')} — {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    {nbJours(c.date_debut, c.date_fin)} j
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px',
                      backgroundColor: c.typeConge?.impacte_salaire
                        ? 'color-mix(in srgb, var(--color-destructive) 12%, transparent)'
                        : 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                      color: c.typeConge?.impacte_salaire ? 'var(--color-destructive)' : 'var(--color-success)',
                    }}>
                      {c.typeConge?.impacte_salaire ? 'Déduction' : 'Payé'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span className={
                      c.statut === 'APPROUVE' ? 'badge-status badge-success' :
                      c.statut === 'REFUSE'   ? 'badge-status badge-destructive' :
                      'badge-status badge-warning'
                    }>
                      {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'}
                    </span>
                  </td>
                  {showActions && (
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button
                          title="Approuver"
                          disabled={acting === c.congeId}
                          onClick={() => handleAction(c.congeId, 'APPROUVE')}
                          style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-success)', opacity: acting === c.congeId ? 0.5 : 1 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-success) 12%, transparent)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                        >
                          <Check style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          title="Refuser"
                          disabled={acting === c.congeId}
                          onClick={() => handleAction(c.congeId, 'REFUSE')}
                          style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)', opacity: acting === c.congeId ? 0.5 : 1 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 12%, transparent)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                        >
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Gestion des congés"
        subtitle={`${conges.length} demande(s) · ${types.length} type(s) configuré(s)`}
        actions={
          <button
            onClick={() => setShowTypes(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Settings style={{ width: '15px', height: '15px' }} />
            Types de congés
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'En attente', value: enAttente.length, color: 'var(--color-warning)' },
          { label: 'Approuvés',  value: approuves.length, color: 'var(--color-success)' },
          { label: 'Refusés',    value: refuses.length,   color: 'var(--color-destructive)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarDays style={{ width: '16px', height: '16px', color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', padding: '2rem' }}>Chargement...</p>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="approved">Approuvés ({approuves.length})</TabsTrigger>
            <TabsTrigger value="refused">Refusés ({refuses.length})</TabsTrigger>
            <TabsTrigger value="all">Tous ({conges.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending"><TableConges items={enAttente} showActions /></TabsContent>
          <TabsContent value="approved"><TableConges items={approuves} /></TabsContent>
          <TabsContent value="refused"><TableConges items={refuses} /></TabsContent>
          <TabsContent value="all"><TableConges items={conges} /></TabsContent>
        </Tabs>
      )}

      {showTypes && (
        <ModalTypes
          types={types}
          onClose={() => setShowTypes(false)}
          onRefresh={() => { fetchAll(); }}
        />
      )}
    </div>
  );
};

export default CongesAdmin;

import { useEffect, useState } from "react";
import { Check, X, CalendarDays } from "lucide-react";
import axios from "axios";

import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/UI/Tabs";
import { API_URL } from "../../../config/api";
import { useCongesPending } from "../../../hooks/Use-conges-attente";
import { useIsMobile } from "../../../hooks/Use-mobile";

type Conge = {
  congeId: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  commentaire?: string;
  demandeur: { userId: number; nom: string; prenom: string; poste?: string };
  typeConge: { nomType: string };
  validateur?: { nom: string; prenom: string } | null;
};

const nbJours = (debut: string, fin: string) =>
  Math.ceil((new Date(fin).getTime() - new Date(debut).getTime()) / (1000 * 60 * 60 * 24)) + 1;

const StatBox = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.625rem', backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <CalendarDays style={{ width: '20px', height: '20px', color }} />
    </div>
    <div>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>{label}</p>
    </div>
  </div>
);

const CongesManager = () => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const { decrement } = useCongesPending();
  const isMobile = useIsMobile();

  const [conges,  setConges]  = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<number | null>(null);

  const fetchConges = async () => {
    try {
      const res = await axios.get(`${API_URL}/conge/mon-equipe`, { headers });
      setConges(res.data);
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConges(); }, []);

  const enAttente = conges.filter((c) => c.statut === 'EN_ATTENTE');
  const approuves = conges.filter((c) => c.statut === 'APPROUVE');
  const refuses   = conges.filter((c) => c.statut === 'REFUSE');

  const handleAction = async (congeId: number, statut: 'APPROUVE' | 'REFUSE') => {
    setActing(congeId);
    try {
      await axios.patch(`${API_URL}/conge/${congeId}/valider`, { statut }, { headers });
      setConges((prev) => prev.map((c) => c.congeId === congeId ? { ...c, statut } : c));
      decrement(1);
    } catch { fetchConges(); }
    finally { setActing(null); }
  };

  const ListeConges = ({ items, showActions = false }: { items: Conge[]; showActions?: boolean }) => {
    if (items.length === 0) {
      return (
        <div className="stat-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
          Aucune demande
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((c, i) => (
            <div key={c.congeId} style={{ padding: '0.875rem 1rem', borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AvatarInitials firstName={c.demandeur.prenom} lastName={c.demandeur.nom} size="sm" />
                  <div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600 }}>
                      {c.demandeur.prenom} {c.demandeur.nom}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {c.typeConge?.nomType} · {nbJours(c.date_debut, c.date_fin)} j
                    </p>
                  </div>
                </div>
                <span className={
                  c.statut === 'APPROUVE' ? 'badge-status badge-success' :
                  c.statut === 'REFUSE'   ? 'badge-status badge-destructive' :
                  'badge-status badge-warning'
                }>
                  {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'}
                </span>
              </div>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                {new Date(c.date_debut).toLocaleDateString('fr-FR')} → {new Date(c.date_fin).toLocaleDateString('fr-FR')}
              </p>
              {showActions && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    disabled={acting === c.congeId}
                    onClick={() => handleAction(c.congeId, 'APPROUVE')}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 8%, transparent)', cursor: 'pointer', color: 'var(--color-success)', fontSize: '0.8125rem', fontFamily: 'var(--font-display)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', opacity: acting === c.congeId ? 0.5 : 1 }}
                  >
                    <Check style={{ width: '14px', height: '14px' }} /> Approuver
                  </button>
                  <button
                    disabled={acting === c.congeId}
                    onClick={() => handleAction(c.congeId, 'REFUSE')}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid var(--color-destructive)', background: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)', cursor: 'pointer', color: 'var(--color-destructive)', fontSize: '0.8125rem', fontFamily: 'var(--font-display)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', opacity: acting === c.congeId ? 0.5 : 1 }}
                  >
                    <X style={{ width: '14px', height: '14px' }} /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Employé</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Type</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Période</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Jours</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Commentaire</th>
                <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'left' }}>Statut</th>
                {showActions && <th className="table-header" style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.congeId} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <AvatarInitials firstName={c.demandeur.prenom} lastName={c.demandeur.nom} size="sm" />
                      <div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600 }}>{c.demandeur.prenom} {c.demandeur.nom}</p>
                        {c.demandeur.poste && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{c.demandeur.poste}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><span className="badge-muted">{c.typeConge?.nomType}</span></td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }}>
                    {new Date(c.date_debut).toLocaleDateString('fr-FR')} — {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>{nbJours(c.date_debut, c.date_fin)} j</td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', maxWidth: '200px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.commentaire || '—'}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <span className={c.statut === 'APPROUVE' ? 'badge-status badge-success' : c.statut === 'REFUSE' ? 'badge-status badge-destructive' : 'badge-status badge-warning'}>
                      {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'}
                    </span>
                  </td>
                  {showActions && (
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button title="Approuver" disabled={acting === c.congeId} onClick={() => handleAction(c.congeId, 'APPROUVE')}
                          style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-success)', opacity: acting === c.congeId ? 0.5 : 1 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-success) 12%, transparent)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
                          <Check style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button title="Refuser" disabled={acting === c.congeId} onClick={() => handleAction(c.congeId, 'REFUSE')}
                          style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)', opacity: acting === c.congeId ? 0.5 : 1 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 12%, transparent)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
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
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Congés de mon équipe" subtitle="Gérez les demandes de congés de vos collaborateurs" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <StatBox label="En attente" value={enAttente.length} color="var(--color-warning)" />
        <StatBox label="Approuvés"  value={approuves.length} color="var(--color-success)" />
        <StatBox label="Refusés"    value={refuses.length}   color="var(--color-destructive)" />
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
          <TabsContent value="pending"><ListeConges items={enAttente} showActions /></TabsContent>
          <TabsContent value="approved"><ListeConges items={approuves} /></TabsContent>
          <TabsContent value="refused"><ListeConges items={refuses} /></TabsContent>
          <TabsContent value="all"><ListeConges items={conges} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CongesManager;

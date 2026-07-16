import { useEffect, useState } from "react";
import { Users, Building2, BarChart3, Award, Briefcase } from "lucide-react";
import axios from "axios";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { API_URL } from "../../../config/api";

type Objectif = {
  objectifId: number; titre: string; status: string;
  points: number; date_debut: string; date_fin: string;
};
type Membre = {
  userId: number; nom: string; prenom: string; email: string;
  phone: string; poste?: string; date_embauche: string;
  soldeConges: number; role: { nom: string };
  contrats?: { statut: string; type: string }[];
};
type Equipe = {
  equipeId: number; nom: string; rendement: number;
  departement: { nom: string; description?: string };
  manager: { userId: number; nom: string; prenom: string; poste?: string } | null;
  employes: Membre[];
  objectifs?: Objectif[];
};

const anciennete = (dateStr: string) => {
  const mois = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (mois < 12) return `${mois} mois`;
  const ans = Math.floor(mois / 12);
  const reste = mois % 12;
  return reste > 0 ? `${ans} an(s) ${reste} mois` : `${ans} an(s)`;
};

const StatBox = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => (
  <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ width: '16px', height: '16px', color }} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{label}</p>
    </div>
  </div>
);

const MonEquipe = () => {
  const token     = localStorage.getItem("token");
  const headers   = { Authorization: `Bearer ${token}` };
  const empLocal  = JSON.parse(localStorage.getItem("employee") || "{}");
  const userId    = empLocal?.userId;

  const [equipe,   setEquipe]   = useState<Equipe | null>(null);
  const [objectifs,setObjectifs]= useState<Objectif[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    // 1. Récupérer l'employé pour avoir son equipeId
    axios.get(`${API_URL}/employee/${userId}`, { headers })
      .then(async (empRes) => {
        const equipeId = empRes.data?.equipe?.equipeId;
        if (!equipeId) { setLoading(false); return; }
        // 2. Charger l'équipe complète
        const [equipeRes, objRes] = await Promise.all([
          axios.get(`${API_URL}/equipe/${equipeId}`, { headers }),
          axios.get(`${API_URL}/objectif/equipe/${equipeId}`, { headers }).catch(() => ({ data: [] })),
        ]);
        setEquipe(equipeRes.data);
        setObjectifs(objRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p style={{ padding: '2rem', color: 'var(--color-muted-foreground)' }}>Chargement...</p>;

  if (!equipe) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <PageHeader title="Mon équipe" subtitle="Vous n'êtes pas encore assigné à une équipe" />
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Users style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ margin: 0, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Aucune équipe assignée
          </p>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            Contactez votre administrateur pour être assigné à une équipe.
          </p>
        </div>
      </div>
    );
  }

  const nbAtteints = objectifs.filter((o) => o.status === 'ATTEINT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title={equipe.nom}
        subtitle={`${equipe.departement.nom}${equipe.departement.description ? ` — ${equipe.departement.description}` : ''}`}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <StatBox icon={Users}     label="Membres"      value={equipe.employes.length}                                              color="var(--color-primary)" />
        <StatBox icon={BarChart3} label="Rendement"    value={equipe.rendement > 0 ? `${equipe.rendement}%` : '—'}                color="var(--color-success)" />
        <StatBox icon={Award}     label="Objectifs"    value={objectifs.length > 0 ? `${nbAtteints}/${objectifs.length}` : '—'}   color="var(--color-accent)" />
        <StatBox icon={Building2} label="Département"  value={equipe.departement.nom}                                             color="var(--color-warning)" />
      </div>

      {/* Membres — lecture seule */}
      <div className="stat-card">
        <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
          Membres de l'équipe
        </h3>
        {equipe.employes.length === 0 ? (
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun membre dans cette équipe</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {equipe.employes.map((membre) => {
              const contratActif = membre.contrats?.find((c) => c.statut === 'ACTIF');
              const estManager   = equipe.manager?.userId === membre.userId;
              const estMoi       = membre.userId === userId;
              return (
                <div key={membre.userId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', borderRadius: '0.625rem', flexWrap: 'wrap', gap: '0.75rem',
                  border: `1.5px solid ${estMoi ? 'var(--color-accent)' : estManager ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: estMoi ? 'color-mix(in srgb, var(--color-accent) 4%, transparent)' : estManager ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: '200px' }}>
                    <AvatarInitials firstName={membre.prenom} lastName={membre.nom} size="md" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>
                          {membre.prenom} {membre.nom}
                        </p>
                        {estManager && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }}>
                            Manager
                          </span>
                        )}
                        {estMoi && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent-foreground)' }}>
                            Vous
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                        {membre.poste || membre.role?.nom}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {anciennete(membre.date_embauche)}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Ancienneté</p>
                    </div>
                    {contratActif && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>{contratActif.type}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Contrat</p>
                      </div>
                    )}
                    <span className="badge-primary" style={{ fontSize: '0.7rem' }}>{membre.role?.nom}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Objectifs — lecture seule */}
      <div className="stat-card">
        <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
          Objectifs de l'équipe
          {objectifs.length > 0 && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-muted-foreground)' }}>
              ({nbAtteints}/{objectifs.length} atteints)
            </span>
          )}
        </h3>
        {objectifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
            <Briefcase style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Aucun objectif défini</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {objectifs.map((obj) => (
              <div key={obj.objectifId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
                  <Briefcase style={{ width: '15px', height: '15px', color: 'var(--color-muted-foreground)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.titre}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                      {new Date(obj.date_debut).toLocaleDateString('fr-FR')} → {new Date(obj.date_fin).toLocaleDateString('fr-FR')}
                      {obj.points > 0 && ` · ${obj.points} pts`}
                    </p>
                  </div>
                </div>
                <span className={obj.status === 'ATTEINT' ? 'badge-status badge-success' : obj.status === 'EN_COURS' ? 'badge-status badge-warning' : 'badge-status badge-muted'}>
                  {obj.status === 'EN_COURS' ? 'En cours' : obj.status === 'ATTEINT' ? 'Atteint' : obj.status === 'NON_ATTEINT' ? 'Non atteint' : obj.status === 'ANNULE' ? 'Annulé' : obj.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonEquipe;

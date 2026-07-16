import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Building2, BarChart3, Award, Briefcase, Eye, Plus, X, Pencil, Trash2 } from "lucide-react";
import axios from "axios";

import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";

type Objectif = {
  objectifId: number;
  titre: string;
  status: string;
  points: number;
  date_debut: string;
  date_fin: string;
};

type Role = { nom: string };

type Membre = {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  poste?: string;
  date_embauche: string;
  soldeConges: number;
  mustChangePassword: boolean;
  role: Role;
  evaluations?: { note: string }[];
  contrats?: { statut: string; salaire: number; type: string }[];
};

type Equipe = {
  equipeId: number;
  nom: string;
  rendement: number;
  departement: { nom: string; description?: string };
  manager: { userId: number; nom: string; prenom: string; poste?: string } | null;
  employes: Membre[];
  objectifs?: Objectif[];
};

// Calcule la note moyenne d'un employé
const noteMoyenne = (evals?: { note: string }[]) => {
  if (!evals || evals.length === 0) return null;
  const notes = evals.map((e) => parseFloat(e.note)).filter((n) => !isNaN(n));
  if (notes.length === 0) return null;
  return (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1);
};

// Ancienneté en années/mois
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
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }}>{label}</p>
    </div>
  </div>
);

const MonEquipe = () => {
  const token    = localStorage.getItem("token");
  const headers  = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  // Récupérer le rôle et userId de l'utilisateur connecté
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
  })();
  const currentRole   = currentUser?.role ?? '';
  const currentUserId = currentUser?.userId ?? 0;

  const [equipe,    setEquipe]    = useState<Equipe | null>(null);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading,   setLoading]   = useState(true);

  // Modal ajout objectif
  const [showModal,  setShowModal]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [titre,      setTitre]      = useState("");
  const [dateDebut,  setDateDebut]  = useState("");
  const [dateFin,    setDateFin]    = useState("");
  const [points,     setPoints]     = useState("");

  // Modal modification statut
  const [editObj,    setEditObj]    = useState<Objectif | null>(null);
  const [newStatus,  setNewStatus]  = useState("");

  const fetchEquipe = async () => {
    try {
      const res = await axios.get(`${API_URL}/equipe/mon-equipe`, { headers });
      setEquipe(res.data);
      if (res.data?.equipeId) {
        const objRes = await axios.get(`${API_URL}/objectif/equipe/${res.data.equipeId}`, { headers });
        setObjectifs(objRes.data);
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEquipe(); }, []);

  // Peut ajouter un objectif : manager de l'équipe OU rôle RH
  const peutGererObjectifs = equipe
    ? (equipe.manager?.userId === currentUserId || currentRole === 'RH' || currentRole === 'ADMIN')
    : false;

  const handleAjouterObjectif = async () => {
    if (!titre.trim() || !dateDebut || !dateFin) {
      setError("Titre, date de début et date de fin sont obligatoires");
      return;
    }
    if (dateFin < dateDebut) {
      setError("La date de fin doit être postérieure à la date de début");
      return;
    }
    setSaving(true); setError("");
    try {
      await axios.post(`${API_URL}/objectif/add`, {
        titre: titre.trim(),
        date_debut: dateDebut,
        date_fin: dateFin,
        equipeId: equipe!.equipeId,
        points: points ? Number(points) : undefined,
      }, { headers });
      setShowModal(false);
      setTitre(""); setDateDebut(""); setDateFin(""); setPoints("");
      // Recharger les objectifs
      const objRes = await axios.get(`${API_URL}/objectif/equipe/${equipe!.equipeId}`, { headers });
      setObjectifs(objRes.data);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatut = async () => {
    if (!editObj || !newStatus) return;
    try {
      await axios.patch(`${API_URL}/objectif/${editObj.objectifId}`, { status: newStatus }, { headers });
      setObjectifs((prev) => prev.map((o) => o.objectifId === editObj.objectifId ? { ...o, status: newStatus } : o));
      setEditObj(null);
    } catch { /* silencieux */ }
  };

  const handleDeleteObjectif = async (objectifId: number) => {
    if (!confirm("Supprimer cet objectif ?")) return;
    try {
      await axios.delete(`${API_URL}/objectif/${objectifId}`, { headers });
      setObjectifs((prev) => prev.filter((o) => o.objectifId !== objectifId));
    } catch { /* silencieux */ }
  };

  if (loading) {
    return <p style={{ padding: '2rem', color: 'var(--color-muted-foreground)' }}>Chargement...</p>;
  }

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

  const nbObjectifsAtteints = objectifs.filter((o) => o.status === 'ATTEINT').length;
  const nbObjectifsTotal    = objectifs.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <PageHeader
        title={equipe.nom}
        subtitle={`${equipe.departement.nom}${equipe.departement.description ? ` — ${equipe.departement.description}` : ''}`}
      />

      {/* Stats de l'équipe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <StatBox icon={Users}    label="Membres"    value={equipe.employes.length}                                    color="var(--color-primary)" />
        <StatBox icon={BarChart3} label="Rendement" value={equipe.rendement > 0 ? `${equipe.rendement}%` : '—'}      color="var(--color-success)" />
        <StatBox icon={Award}    label="Objectifs"  value={nbObjectifsTotal > 0 ? `${nbObjectifsAtteints}/${nbObjectifsTotal}` : '—'} color="var(--color-accent)" />
        <StatBox icon={Building2} label="Département" value={equipe.departement.nom}                                 color="var(--color-warning)" />
      </div>

      {/* Membres */}
      <div className="stat-card">
        <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
          Membres de l'équipe
        </h3>

        {equipe.employes.length === 0 ? (
          <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Aucun membre dans cette équipe</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {equipe.employes.map((membre) => {
              const moyenne     = noteMoyenne(membre.evaluations);
              const contratActif = membre.contrats?.find((c) => c.statut === 'ACTIF');
              const estManager  = equipe.manager?.userId === membre.userId;

              return (
                <div
                  key={membre.userId}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem', borderRadius: '0.625rem',
                    border: `1.5px solid ${estManager ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: estManager ? 'color-mix(in srgb, var(--color-primary) 3%, transparent)' : 'transparent',
                    flexWrap: 'wrap', gap: '0.75rem',
                  }}
                >
                  {/* Identité */}
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
                      </div>
                      <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                        {membre.poste || membre.role?.nom} · {membre.email}
                      </p>
                    </div>
                  </div>

                  {/* Détails */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Ancienneté */}
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {anciennete(membre.date_embauche)}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Ancienneté</p>
                    </div>

                    {/* Note moyenne */}
                    {moyenne && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: parseFloat(moyenne) >= 4 ? 'var(--color-success)' : parseFloat(moyenne) >= 3 ? 'var(--color-warning)' : 'var(--color-destructive)' }}>
                          {moyenne}/5
                        </p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Évaluation</p>
                      </div>
                    )}

                    {/* Contrat */}
                    {contratActif && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>
                          {contratActif.type}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Contrat</p>
                      </div>
                    )}

                    {/* Solde congés */}
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {membre.soldeConges} j
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>Congés</p>
                    </div>

                    {/* Rôle badge */}
                    <span className="badge-primary" style={{ fontSize: '0.7rem' }}>
                      {membre.role?.nom}
                    </span>

                    {/* Bouton voir profil */}
                    <button
                      onClick={() => navigate(`/manager/team/${membre.userId}`)}
                      title="Voir le profil"
                      style={{ padding: '0.375rem 0.625rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-display)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-foreground)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted-foreground)'; }}
                    >
                      <Eye style={{ width: '13px', height: '13px' }} /> Profil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Objectifs */}
      <div className="stat-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
            Objectifs de l'équipe
            {objectifs.length > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-muted-foreground)' }}>
                ({nbObjectifsAtteints}/{nbObjectifsTotal} atteints)
              </span>
            )}
          </h3>
          {peutGererObjectifs && (
            <button
              onClick={() => { setShowModal(true); setError(""); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer' }}
            >
              <Plus style={{ width: '14px', height: '14px' }} /> Ajouter
            </button>
          )}
        </div>

        {objectifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted-foreground)' }}>
            <Briefcase style={{ width: '2rem', height: '2rem', margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Aucun objectif défini</p>
            {peutGererObjectifs && (
              <button
                onClick={() => setShowModal(true)}
                style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Créer le premier objectif
              </button>
            )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span className={
                    obj.status === 'ATTEINT'  ? 'badge-status badge-success' :
                    obj.status === 'EN_COURS' ? 'badge-status badge-warning' :
                    'badge-status badge-muted'
                  }>
                    {obj.status}
                  </span>
                  {peutGererObjectifs && (
                    <>
                      <button
                        onClick={() => { setEditObj(obj); setNewStatus(obj.status); }}
                        title="Modifier le statut"
                        style={{ padding: '0.25rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-muted)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                      >
                        <Pencil style={{ width: '13px', height: '13px' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteObjectif(obj.objectifId)}
                        title="Supprimer"
                        style={{ padding: '0.25rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal — Ajouter un objectif */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>Nouvel objectif</h2>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            {error && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Titre <span style={{ color: 'var(--color-destructive)' }}>*</span>
                </label>
                <Input placeholder="ex: Augmenter les ventes de 20%" value={titre} onChange={(e) => setTitre(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                    Date début <span style={{ color: 'var(--color-destructive)' }}>*</span>
                  </label>
                  <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                    Date fin <span style={{ color: 'var(--color-destructive)' }}>*</span>
                  </label>
                  <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} min={dateDebut} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Points <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <Input type="text" inputMode="numeric" placeholder="ex: 100" value={points} onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, ""))} min={0} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} disabled={saving} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem' }}>
                Annuler
              </button>
              <button onClick={handleAjouterObjectif} disabled={saving} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', opacity: saving ? 0.6 : 1 }}>
                {saving ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Modifier le statut */}
      {editObj && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditObj(null); }}>
          <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>Modifier le statut</h2>
              <button onClick={() => setEditObj(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>{editObj.titre}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['EN_COURS', 'ATTEINT', 'NON_ATTEINT', 'ANNULE'].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  style={{
                    padding: '0.625rem 1rem', borderRadius: '0.5rem', textAlign: 'left',
                    border: `1.5px solid ${newStatus === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: newStatus === s ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: newStatus === s ? 600 : 400,
                    color: newStatus === s ? 'var(--color-primary)' : 'var(--color-foreground)', fontSize: '0.875rem',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditObj(null)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem' }}>
                Annuler
              </button>
              <button onClick={handleUpdateStatut} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem' }}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonEquipe;

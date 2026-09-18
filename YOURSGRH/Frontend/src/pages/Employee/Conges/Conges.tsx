import { useEffect, useState } from "react";
import { Plus, X, CalendarDays, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { Input } from "../../../components/UI/Input";
import { congeService, typeCongeService, employeeService } from "../../../lib/mockService";

type TypeConge = { typeCId: number; nomType: string };

type Conge = {
  congeId: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  commentaire?: string;
  typeConge: { nomType: string };
};

// Nombre de jours entre deux dates
const nbJours = (d1: string, d2: string) =>
  Math.ceil((new Date(d2).getTime() - new Date(d1).getTime()) / (1000 * 60 * 60 * 24)) + 1;

// Mois du calendrier
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const MesConges = () => {
  const employee = (() => {
    try { return JSON.parse(localStorage.getItem('employee') || 'null'); } catch { return null; }
  })();

  const [conges,      setConges]      = useState<Conge[]>([]);
  const [typesConge,  setTypesConge]  = useState<TypeConge[]>([]);
  const [solde,       setSolde]       = useState<number>(employee?.soldeConges ?? 0);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [typeCId,     setTypeCId]     = useState<number | "">("");
  const [dateDebut,   setDateDebut]   = useState("");
  const [dateFin,     setDateFin]     = useState("");
  const [commentaire, setCommentaire] = useState("");

  const fetchData = () => {
    try {
      setConges(congeService.getMesConges(employee?.userId ?? 0) as Conge[]);
      setTypesConge(typeCongeService.getAll() as TypeConge[]);
      const emp = employeeService.getById(employee?.userId ?? 0);
      setSolde(emp?.soldeConges ?? 0);
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDemander = () => {
    if (!typeCId || !dateDebut || !dateFin) { setError("Type, date de début et date de fin sont obligatoires"); return; }
    if (dateFin < dateDebut) { setError("La date de fin doit être égale ou postérieure à la date de début"); return; }
    setSaving(true); setError("");
    try {
      congeService.demander(employee?.userId ?? 0, { typeCId: Number(typeCId), date_debut: dateDebut, date_fin: dateFin, commentaire: commentaire.trim() || undefined });
      setShowModal(false);
      setTypeCId(""); setDateDebut(""); setDateFin(""); setCommentaire("");
      fetchData();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la demande");
    } finally { setSaving(false); }
  };

  const handleAnnuler = (congeId: number) => {
    if (!confirm("Annuler cette demande ?")) return;
    congeService.annuler(congeId);
    setConges((prev) => prev.filter((c) => c.congeId !== congeId));
  };

  // Congés validés pour le calendrier
  const congesValides = conges.filter((c) => c.statut === 'APPROUVE');
  const enAttente     = conges.filter((c) => c.statut === 'EN_ATTENTE').length;
  const approuves     = conges.filter((c) => c.statut === 'APPROUVE').length;
  const refuses       = conges.filter((c) => c.statut === 'REFUSE').length;

  // Calendrier — mois courant
  const now         = new Date();
  const annee       = now.getFullYear();
  const moisCourant = now.getMonth();
  const premierJour = new Date(annee, moisCourant, 1).getDay(); // 0=dim
  const nbJoursMois = new Date(annee, moisCourant + 1, 0).getDate();

  const estCongeValide = (jour: number) => {
    const date = new Date(annee, moisCourant, jour);
    return congesValides.some((c) => {
      const d1 = new Date(c.date_debut);
      const d2 = new Date(c.date_fin);
      return date >= d1 && date <= d2;
    });
  };

  const joursCalendrier = Array.from({ length: (premierJour === 0 ? 6 : premierJour - 1) + nbJoursMois }, (_, i) => {
    const offset = premierJour === 0 ? 6 : premierJour - 1;
    return i < offset ? null : i - offset + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Mes congés"
        subtitle={`Solde disponible : ${solde} jour(s)`}
        actions={
          <button
            onClick={() => { setShowModal(true); setError(""); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Plus style={{ width: '15px', height: '15px' }} /> Nouvelle demande
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'En attente', value: enAttente, color: 'var(--color-warning)', icon: Clock },
          { label: 'Approuvés',  value: approuves, color: 'var(--color-success)', icon: CheckCircle },
          { label: 'Refusés',    value: refuses,   color: 'var(--color-destructive)', icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '16px', height: '16px', color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Liste des demandes */}
        <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
            Mes demandes
          </h3>
          {loading ? (
            <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>Chargement...</p>
          ) : conges.length === 0 ? (
            <p style={{ color: 'var(--color-muted-foreground)', margin: 0, fontSize: '0.875rem' }}>Aucune demande</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[...conges].sort((a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime()).map((c) => (
                <div key={c.congeId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <CalendarDays style={{ width: '15px', height: '15px', color: 'var(--color-muted-foreground)', flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{c.typeConge?.nomType}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                        {new Date(c.date_debut).toLocaleDateString('fr-FR')} → {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                        {' · '}{nbJours(c.date_debut, c.date_fin)} jour(s)
                      </p>
                      {c.commentaire && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)', fontStyle: 'italic' }}>{c.commentaire}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={
                      c.statut === 'APPROUVE'   ? 'badge-status badge-success' :
                      c.statut === 'REFUSE'     ? 'badge-status badge-destructive' :
                      'badge-status badge-warning'
                    }>
                      {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'}
                    </span>
                    {c.statut === 'EN_ATTENTE' && (
                      <button
                        onClick={() => handleAnnuler(c.congeId)}
                        title="Annuler"
                        style={{ padding: '0.25rem', borderRadius: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-destructive)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 10%, transparent)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendrier */}
        <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
            Calendrier — {MOIS[moisCourant]} {annee}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((j) => (
              <div key={j} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted-foreground)', padding: '0.25rem 0' }}>{j}</div>
            ))}
            {joursCalendrier.map((jour, i) => {
              const estAujourd = jour === now.getDate();
              const enConge    = jour ? estCongeValide(jour) : false;
              return (
                <div
                  key={i}
                  style={{
                    textAlign: 'center', padding: '0.375rem 0', borderRadius: '0.375rem',
                    fontSize: '0.8125rem', fontWeight: estAujourd ? 700 : 400,
                    backgroundColor: enConge ? 'color-mix(in srgb, var(--color-success) 20%, transparent)' :
                                     estAujourd ? 'var(--color-primary)' : 'transparent',
                    color: estAujourd ? 'var(--color-primary-foreground)' :
                           enConge ? 'var(--color-success)' :
                           jour ? 'var(--color-foreground)' : 'transparent',
                  }}
                >
                  {jour ?? ''}
                </div>
              );
            })}
          </div>
          {congesValides.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'color-mix(in srgb, var(--color-success) 20%, transparent)', border: '1px solid var(--color-success)', flexShrink: 0 }} />
              Congés approuvés
            </div>
          )}
        </div>
      </div>

      {/* Modal — Nouvelle demande */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>Nouvelle demande de congé</h2>
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
                  Type de congé <span style={{ color: 'var(--color-destructive)' }}>*</span>
                </label>
                <select
                  value={typeCId}
                  onChange={(e) => setTypeCId(e.target.value ? Number(e.target.value) : "")}
                  style={{ width: '100%', height: '2.5rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">Sélectionner un type</option>
                  {typesConge.map((t) => (
                    <option key={t.typeCId} value={t.typeCId}>{t.nomType}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                    Date début <span style={{ color: 'var(--color-destructive)' }}>*</span>
                  </label>
                  <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                    Date fin <span style={{ color: 'var(--color-destructive)' }}>*</span>
                  </label>
                  <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} min={dateDebut || new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              {dateDebut && dateFin && new Date(dateFin) >= new Date(dateDebut) && (
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                  Durée : {nbJours(dateDebut, dateFin)} jour(s)
                </p>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Commentaire <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <Input placeholder="Motif de la demande..." value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} disabled={saving} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem' }}>
                Annuler
              </button>
              <button onClick={handleDemander} disabled={saving} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', opacity: saving ? 0.6 : 1 }}>
                {saving ? "Envoi..." : "Soumettre la demande"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesConges;

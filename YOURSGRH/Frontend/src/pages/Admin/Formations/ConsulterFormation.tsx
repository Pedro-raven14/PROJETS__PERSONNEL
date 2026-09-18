import { useState } from "react";
import { X, Calendar, Clock, Users, GraduationCap } from "lucide-react";
import { Button } from "../../../components/UI/Button";
import { formationService } from "../../../lib/mockService";

type Formation = {
  formationId: number;
  titre: string;
  description: string;
  duree: number;
  heures_par_jour: number;
  niveau: string;
  date_debut: string;
  date_fin: string;
  capacite: number;
  employes: { userId: number; nom: string; prenom: string }[];
};

type Props = {
  formation: Formation;
  onClose: () => void;
  onSuccess: () => void;
};

const niveauColor: Record<string, string> = {
  "DÉBUTANT":      "var(--color-success)",
  "INTERMÉDIAIRE": "var(--color-warning)",
  "AVANCÉ":        "var(--color-destructive)",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const ConsulterFormation = ({ formation, onClose, onSuccess }: Props) => {
  const [inscribing, setInscribing] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const inscrits  = formation.employes?.length ?? 0;
  const complet   = inscrits >= formation.capacite;
  const fillRate  = formation.capacite > 0 ? Math.round((inscrits / formation.capacite) * 100) : 0;

  // Récupère l'userId de l'employé connecté
  const me = JSON.parse(localStorage.getItem("employee") || "{}");

  const dejaInscrit = formation.employes?.some((e) => e.userId === me.userId);

  const handleInscrire = () => {
    setError(""); setSuccess("");
    setInscribing(true);
    try {
      formationService.inscrire(formation.formationId, me.userId);
      setSuccess("Inscription réussie !");
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'inscription");
    } finally { setInscribing(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--color-card)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        maxHeight: '90dvh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', flexShrink: 0,
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
            }}>
              <GraduationCap style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
                {formation.titre}
              </h2>
              <span style={{
                display: 'inline-block', marginTop: '0.25rem',
                fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem',
                borderRadius: '999px', backgroundColor: 'color-mix(in srgb, ' + (niveauColor[formation.niveau] ?? 'var(--color-muted)') + ' 15%, transparent)',
                color: niveauColor[formation.niveau] ?? 'var(--color-muted-foreground)',
              }}>
                {formation.niveau || "—"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', flexShrink: 0 }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Description */}
        {formation.description && (
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>
            {formation.description}
          </p>
        )}

        {/* Infos clés */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>
              <Clock style={{ width: '14px', height: '14px' }} /> Durée totale
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              {formation.duree}h
            </p>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>
              <Clock style={{ width: '14px', height: '14px' }} /> Heures / jour
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              {formation.heures_par_jour}h
            </p>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>
              <Users style={{ width: '14px', height: '14px' }} /> Places
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              {inscrits} / {formation.capacite}
            </p>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>
              <Calendar style={{ width: '14px', height: '14px' }} /> Début
            </div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{formatDate(formation.date_debut)}</p>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>
              <Calendar style={{ width: '14px', height: '14px' }} /> Fin
            </div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{formatDate(formation.date_fin)}</p>
          </div>
        </div>

        {/* Barre de remplissage */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
            <span style={{ color: 'var(--color-muted-foreground)' }}>Taux de remplissage</span>
            <span style={{ fontWeight: 600 }}>{fillRate}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              width: `${fillRate}%`,
              backgroundColor: fillRate >= 90 ? 'var(--color-destructive)' : 'var(--color-primary)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Liste des inscrits */}
        {formation.employes && formation.employes.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Participants inscrits
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '140px', overflowY: 'auto' }}>
              {formation.employes.map((emp) => (
                <div key={emp.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.625rem', borderRadius: '0.375rem',
                  backgroundColor: 'var(--color-background)', fontSize: '0.8125rem',
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', fontWeight: 700,
                  }}>
                    {emp.prenom?.[0]}{emp.nom?.[0]}
                  </div>
                  {emp.prenom} {emp.nom}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {error && (
          <div style={{
            marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem',
            backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)',
            color: 'var(--color-destructive)', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
            color: 'var(--color-success)', fontSize: '0.875rem',
          }}>
            {success}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button
            onClick={handleInscrire}
            disabled={complet || dejaInscrit || inscribing}
          >
            {inscribing ? "Inscription..." : dejaInscrit ? "Déjà inscrit" : complet ? "Complet" : "S'inscrire"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsulterFormation;

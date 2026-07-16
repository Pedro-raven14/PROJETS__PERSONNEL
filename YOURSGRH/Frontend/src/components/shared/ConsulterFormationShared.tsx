import { useState } from "react";
import { X, Calendar, Clock, Users, GraduationCap } from "lucide-react";
import axios from "axios";
import { Button } from "../UI/Button";
import { API_URL } from "../../config/api";

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

const ConsulterFormationShared = ({ formation, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const me    = (() => { try { return JSON.parse(localStorage.getItem("employee") || "{}"); } catch { return {}; } })();

  const inscrits    = formation.employes?.length ?? 0;
  const complet     = inscrits >= formation.capacite;
  const fillRate    = formation.capacite > 0 ? Math.round((inscrits / formation.capacite) * 100) : 0;
  const estInscrit  = formation.employes?.some(e => e.userId === me.userId);

  const handleInscrire = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      await axios.post(
        `${API_URL}/formation/${formation.formationId}/inscrire`,
        { userId: me.userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Inscription réussie !");
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  const handleDesinscrire = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      await axios.delete(
        `${API_URL}/formation/${formation.formationId}/inscrire/${me.userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Désinscription effectuée.");
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de la désinscription");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem',
        width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        maxHeight: '90dvh', overflowY: 'auto',
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
                fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: `color-mix(in srgb, ${niveauColor[formation.niveau] ?? 'var(--color-muted)'} 15%, transparent)`,
                color: niveauColor[formation.niveau] ?? 'var(--color-muted-foreground)',
              }}>
                {formation.niveau || "—"}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', flexShrink: 0 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { icon: <Clock style={{ width: '14px', height: '14px' }} />, label: 'Durée totale', value: `${formation.duree}h` },
            { icon: <Clock style={{ width: '14px', height: '14px' }} />, label: 'Heures / jour', value: `${formation.heures_par_jour}h` },
            { icon: <Users style={{ width: '14px', height: '14px' }} />, label: 'Places', value: `${inscrits} / ${formation.capacite}` },
            { icon: <Calendar style={{ width: '14px', height: '14px' }} />, label: 'Début', value: formatDate(formation.date_debut) },
            { icon: <Calendar style={{ width: '14px', height: '14px' }} />, label: 'Fin', value: formatDate(formation.date_fin) },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '0.75rem' }}>
                {icon} {label}
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.9375rem' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Barre */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
            <span style={{ color: 'var(--color-muted-foreground)' }}>Taux de remplissage</span>
            <span style={{ fontWeight: 600 }}>{fillRate}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px', width: `${fillRate}%`,
              backgroundColor: fillRate >= 90 ? 'var(--color-destructive)' : 'var(--color-primary)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Participants */}
        {formation.employes && formation.employes.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Participants inscrits</p>
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
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)', color: 'var(--color-success)', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          {estInscrit ? (
            <Button variant="outline" onClick={handleDesinscrire} disabled={loading}>
              {loading ? "..." : "Se désinscrire"}
            </Button>
          ) : (
            <Button onClick={handleInscrire} disabled={complet || loading}>
              {loading ? "..." : complet ? "Complet" : "S'inscrire"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsulterFormationShared;

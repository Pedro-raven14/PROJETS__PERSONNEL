import { useState } from "react";
import { X, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../../components/UI/Button";
import { fichePaieService } from "../../../lib/mockService";

type Props = { onClose: () => void; onSuccess: () => void };

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const GenererFichePaie = ({ onClose, onSuccess }: Props) => {
  const now = new Date();
  const [mois,      setMois]      = useState(now.getMonth() + 1);
  const [annee,     setAnnee]     = useState(now.getFullYear());
  const [heuresSup, setHeuresSup] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [result,    setResult]    = useState<{ generes: number; ignores: number; erreurs: string[] } | null>(null);

  const periode = `${annee}-${String(mois).padStart(2, "0")}`;
  const annees = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 3 + i);

  const handleGenerer = () => {
    if (heuresSup && (isNaN(Number(heuresSup)) || Number(heuresSup) < 0 || Number(heuresSup) > 200)) {
      setError("Le nombre d'heures supplémentaires doit être compris entre 0 et 200");
      return;
    }
    setSaving(true); setError(""); setResult(null);
    try {
      const res = fichePaieService.genererTous(periode, heuresSup ? Number(heuresSup) : 0);
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Erreur lors du traitement de la paie");
    } finally { setSaving(false); }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
              <Wallet style={{ width: '16px', height: '16px' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
                Traitement de la paie
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                Génère les fiches pour tous les employés actifs
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        {!result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Sélection période */}
            <div>
              <label style={labelStyle}>Période de paie <span style={{ color: 'var(--color-destructive)' }}>*</span></label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {/* Mois */}
                <select
                  value={mois}
                  onChange={(e) => setMois(Number(e.target.value))}
                  style={{ ...selectStyle, flex: 2 }}
                >
                  {MOIS.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
                {/* Année */}
                <select
                  value={annee}
                  onChange={(e) => setAnnee(Number(e.target.value))}
                  style={{ ...selectStyle, flex: 1 }}
                >
                  {annees.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                Période sélectionnée : <strong>{MOIS[mois - 1]} {annee}</strong> ({periode})
              </p>
            </div>

            {/* Heures sup globales */}
            <div>
              <label style={labelStyle}>
                Heures supplémentaires{' '}
                <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel — appliqué à tous)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                min="0"
                step="0.5"
                placeholder="ex: 8"
                value={heuresSup}
                onChange={(e) => {
                  // N'accepte que chiffres et un point décimal (pour les 0.5)
                  const v = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                  setHeuresSup(v);
                }}
                style={{ ...selectStyle, height: '2.5rem', paddingLeft: '0.75rem' }}
              />
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                Si les heures sup varient par employé, générez les fiches individuellement après.
              </p>
            </div>

            {/* Info */}
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
              Les employés qui ont déjà une fiche pour cette période seront automatiquement ignorés.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
              <Button onClick={handleGenerer} disabled={saving}>
                {saving ? "Traitement en cours..." : `Lancer la paie — ${MOIS[mois - 1]} ${annee}`}
              </Button>
            </div>
          </div>
        ) : (
          /* Résultat du traitement */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle style={{ width: '18px', height: '18px', color: 'var(--color-success)' }} />
                <span style={{ fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-display)' }}>
                  Traitement terminé — {MOIS[mois - 1]} {annee}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>Fiches générées</span>
                  <p style={{ margin: '0.125rem 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-success)' }}>
                    {result.generes}
                  </p>
                </div>
                {result.ignores > 0 && (
                  <div>
                    <span style={{ color: 'var(--color-muted-foreground)' }}>Déjà existantes</span>
                    <p style={{ margin: '0.125rem 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-warning)' }}>
                      {result.ignores}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {result.erreurs.length > 0 && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-destructive) 20%, transparent)' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-destructive)' }}>
                  {result.erreurs.length} erreur(s) :
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-destructive)' }}>
                  {result.erreurs.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setResult(null)}>Nouveau traitement</Button>
              <Button onClick={onSuccess}>Fermer</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem',
};
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '0 0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)',
  color: 'var(--color-foreground)', fontSize: '0.875rem', cursor: 'pointer',
  height: '2.5rem', boxSizing: 'border-box',
};

export default GenererFichePaie;

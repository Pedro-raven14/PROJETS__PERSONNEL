import { useState } from "react";
import { X, Star } from "lucide-react";
import axios from "axios";
import { Button } from "../../../components/UI/Button";
import { API_URL } from "../../../config/api";

type Cycle  = { cycleId: number; nom: string; criteres: string[] };
type Membre = { userId: number; nom: string; prenom: string };

type Props = {
  cycle: Cycle;
  membre: Membre;
  evaluateurId: number;
  onClose: () => void;
  onSuccess: () => void;
};

const EvaluerMembre = ({ cycle, membre, evaluateurId, onClose, onSuccess }: Props) => {
  const [notes, setNotes]       = useState<Record<string, number>>(() =>
    Object.fromEntries(cycle.criteres.map(c => [c, 3]))
  );
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const setNote = (critere: string, val: number) =>
    setNotes(n => ({ ...n, [critere]: val }));

  const noteGlobale = Object.values(notes).reduce((a, b) => a + b, 0) / cycle.criteres.length;

  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/evaluation/add`,
        {
          userId:        membre.userId,
          evaluateurId,
          cycleId:       cycle.cycleId,
          date:          new Date().toISOString().split("T")[0],
          notes_criteres: notes,
          commentaire:   commentaire.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess(); onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
              Évaluer {membre.prenom} {membre.nom}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
              {cycle.nom}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Critères avec étoiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          {cycle.criteres.map(critere => (
            <div key={critere}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>{critere}</label>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                  {notes[critere]}/5
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setNote(critere, val)}
                    style={{
                      border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.125rem',
                      color: val <= notes[critere] ? 'var(--color-warning)' : 'var(--color-border)',
                      transition: 'color 0.1s',
                    }}
                  >
                    <Star style={{ width: '24px', height: '24px', fill: val <= notes[critere] ? 'currentColor' : 'none' }} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note globale */}
        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Note globale (moyenne)</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-warning)' }}>
            {noteGlobale.toFixed(2)}/5
          </span>
        </div>

        {/* Commentaire */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Commentaire <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            rows={3}
            placeholder="Observations, points forts, axes d'amélioration..."
            style={{
              width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)',
              color: 'var(--color-foreground)', fontSize: '0.875rem',
              fontFamily: 'var(--font-body)', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluerMembre;

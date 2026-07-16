import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { Button } from "../../../components/UI/Button";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";

type Props = { onClose: () => void; onSuccess: () => void };

const AjoutCycle = ({ onClose, onSuccess }: Props) => {
  const [nom, setNom]           = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin]   = useState("");
  const [criteres, setCriteres] = useState<string[]>(["Communication", "Technique", "Ponctualité"]);
  const [newCritere, setNewCritere] = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const addCritere = () => {
    const val = newCritere.trim();
    if (!val || criteres.includes(val)) return;
    setCriteres(c => [...c, val]);
    setNewCritere("");
  };

  const removeCritere = (cr: string) => setCriteres(c => c.filter(x => x !== cr));

  const handleSubmit = async () => {
    if (!nom.trim())  { setError("Le nom est obligatoire"); return; }
    if (!dateDebut)   { setError("La date de début est obligatoire"); return; }
    if (!dateFin)     { setError("La date de fin est obligatoire"); return; }
    if (dateFin < dateDebut) { setError("La date de fin doit être postérieure à la date de début"); return; }
    if (criteres.length === 0) { setError("Ajoutez au moins un critère"); return; }

    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/cycle-evaluation/add`,
        { nom: nom.trim(), date_debut: dateDebut, date_fin: dateFin, criteres },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess(); onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de la création");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>Nouveau cycle d'évaluation</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)' }}>
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
              Nom du cycle <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <Input placeholder="ex: Cycle S1 2026" value={nom} onChange={e => setNom(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Date de début <span style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Date de fin <span style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} min={dateDebut} />
            </div>
          </div>

          {/* Critères */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Critères d'évaluation <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
              {criteres.map(cr => (
                <span key={cr} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                }}>
                  {cr}
                  <button onClick={() => removeCritere(cr)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                    <Trash2 style={{ width: '11px', height: '11px' }} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Input
                placeholder="Ajouter un critère..."
                value={newCritere}
                onChange={e => setNewCritere(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCritere()}
              />
              <Button variant="outline" onClick={addCritere}>
                <Plus style={{ width: '14px', height: '14px' }} />
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "Création..." : "Créer"}</Button>
        </div>
      </div>
    </div>
  );
};

export default AjoutCycle;

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { Button } from "../../../components/UI/Button";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";

type Employe = { userId: number; nom: string; prenom: string; poste?: string };

type Props = {
  cycleId: number;
  criteres: string[];
  onClose: () => void;
  onSuccess: () => void;
};

const AjoutEvaluation = ({ cycleId, criteres, onClose, onSuccess }: Props) => {
  const token = localStorage.getItem("token");
  const evaluateur = (() => { try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; } })();

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [userId, setUserId]     = useState("");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes]       = useState<Record<string, number>>(
    Object.fromEntries(criteres.map(c => [c, 3]))
  );
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/employee/getall`, {
      params: { page: 1, limit: 200 },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setEmployes(res.data.data ?? res.data))
      .catch(() => setEmployes([]));
  }, []);

  const handleNote = (critere: string, val: number) => {
    const clamped = Math.min(5, Math.max(1, val));
    setNotes(prev => ({ ...prev, [critere]: clamped }));
  };

  const handleSubmit = async () => {
    if (!userId)  { setError("Sélectionnez un employé"); return; }
    if (!date)    { setError("La date est obligatoire"); return; }

    setSaving(true); setError("");
    try {
      await axios.post(
        `${API_URL}/evaluation/add`,
        {
          userId:       Number(userId),
          evaluateurId: evaluateur?.userId,
          cycleId,
          date,
          notes_criteres: notes,
          commentaire:    commentaire.trim() || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 110, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ backgroundColor: "var(--color-card)", borderRadius: "0.75rem", padding: "1.5rem", width: "100%", maxWidth: "480px", maxHeight: "90dvh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.0625rem", fontWeight: 700 }}>Nouvelle évaluation</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted-foreground)" }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: "var(--color-destructive)18", color: "var(--color-destructive)", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Employé */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem" }}>
              Employé <span style={{ color: "var(--color-destructive)" }}>*</span>
            </label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)", fontSize: "0.875rem" }}
            >
              <option value="">Sélectionner un employé...</option>
              {employes.map(emp => (
                <option key={emp.userId} value={emp.userId}>
                  {emp.prenom} {emp.nom}{emp.poste ? ` — ${emp.poste}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem" }}>
              Date <span style={{ color: "var(--color-destructive)" }}>*</span>
            </label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {/* Notes par critère */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Notes par critère <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>(1 à 5)</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {criteres.map(crit => (
                <div key={crit} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ flex: 1, fontSize: "0.875rem", minWidth: 0 }}>{crit}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <input
                      type="range" min={1} max={5} step={0.5}
                      value={notes[crit] ?? 3}
                      onChange={e => handleNote(crit, Number(e.target.value))}
                      style={{ width: "100px", accentColor: "var(--color-primary)" }}
                    />
                    <span style={{ width: "2rem", textAlign: "center", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.875rem" }}>
                      {notes[crit] ?? 3}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.375rem" }}>
              Commentaire <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>(optionnel)</span>
            </label>
            <textarea
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              rows={3}
              placeholder="Points forts, axes d'amélioration..."
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)", fontSize: "0.875rem", resize: "vertical", fontFamily: "var(--font-body)", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AjoutEvaluation;

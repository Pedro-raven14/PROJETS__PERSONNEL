import { useEffect, useRef, useState } from "react";
import { X, Plus, Zap } from "lucide-react";
import axios from "axios";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";

// Correspondance label affiché → niveau stocké en BDD
const NIVEAUX_LABELS: { label: string; niveau: number; pct: number; color: string }[] = [
  { label: "Débutant",      niveau: 1, pct: 20,  color: "var(--color-success)" },
  { label: "Intermédiaire", niveau: 3, pct: 60,  color: "var(--color-warning)" },
  { label: "Avancé",        niveau: 4, pct: 80,  color: "var(--color-primary)" },
  { label: "Expert",        niveau: 5, pct: 100, color: "var(--color-destructive)" },
];

type CompetenceItem = { nom: string; niveau: number };
type CompetenceRef  = { competenceId: number; nom: string; categorie?: string };

type Props = {
  employee: { userId: number; prenom: string; nom: string };
  onClose: () => void;
  onSuccess: () => void;
};

const AjoutCompetences = ({ employee, onClose, onSuccess }: Props) => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Compétences déjà ajoutées dans ce modal
  const [liste, setListe]           = useState<CompetenceItem[]>([]);

  // Champ de saisie
  const [nomInput, setNomInput]     = useState("");
  const [niveauInput, setNiveauInput] = useState<number>(1);
  const [suggestions, setSuggestions] = useState<CompetenceRef[]>([]);
  const [showSugg, setShowSugg]     = useState(false);
  const [allComps, setAllComps]     = useState<CompetenceRef[]>([]);

  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger le référentiel de compétences existantes
  useEffect(() => {
    axios.get(`${API_URL}/competences/getall`, { headers })
      .then((r) => setAllComps(r.data))
      .catch(() => {});
  }, []);

  // Filtrer les suggestions en temps réel
  useEffect(() => {
    if (!nomInput.trim()) { setSuggestions([]); setShowSugg(false); return; }
    const q = nomInput.toLowerCase();
    const filtered = allComps.filter(
      (c) => c.nom.toLowerCase().includes(q) && !liste.some((l) => l.nom.toLowerCase() === c.nom.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 6));
    setShowSugg(filtered.length > 0);
  }, [nomInput, allComps, liste]);

  const ajouterCompetence = (nom: string, niveau: number) => {
    const nomTrim = nom.trim();
    if (!nomTrim) { setError("Entrez un nom de compétence"); return; }
    if (liste.some((c) => c.nom.toLowerCase() === nomTrim.toLowerCase())) {
      setError("Cette compétence est déjà dans la liste"); return;
    }
    setListe((prev) => [...prev, { nom: nomTrim, niveau }]);
    setNomInput("");
    setNiveauInput(1);
    setShowSugg(false);
    setError("");
    inputRef.current?.focus();
  };

  const retirerCompetence = (nom: string) => {
    setListe((prev) => prev.filter((c) => c.nom !== nom));
  };

  const handleSave = async () => {
    if (liste.length === 0) { onSuccess(); onClose(); return; }
    setSaving(true); setError("");
    try {
      // Envoyer chaque compétence une par une (l'API crée auto si inexistante)
      await Promise.all(
        liste.map((c) =>
          axios.post(
            `${API_URL}/competences/employee/${employee.userId}`,
            { nom: c.nom, niveau: c.niveau },
            { headers },
          )
        )
      );
      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  const niveauInfo = (n: number) => NIVEAUX_LABELS.find((x) => x.niveau === n) ?? NIVEAUX_LABELS[0];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem',
        width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
              Compétences de {employee.prenom} {employee.nom}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
              Optionnel — vous pouvez compléter depuis le profil plus tard
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', flexShrink: 0 }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Saisie */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          {/* Champ nom avec autocomplete */}
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={labelStyle}>Compétence</label>
            <Input
              ref={inputRef}
              placeholder="ex: JavaScript, Leadership..."
              value={nomInput}
              onChange={(e) => setNomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterCompetence(nomInput, niveauInput); } }}
              onFocus={() => { if (suggestions.length > 0) setShowSugg(true); }}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            />
            {/* Dropdown suggestions */}
            {showSugg && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)',
                borderRadius: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                marginTop: '0.25rem', overflow: 'hidden',
              }}>
                {suggestions.map((s) => (
                  <div
                    key={s.competenceId}
                    onMouseDown={() => { setNomInput(s.nom); setShowSugg(false); }}
                    style={{
                      padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-muted)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <span>{s.nom}</span>
                    {s.categorie && <span style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)' }}>{s.categorie}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sélecteur niveau */}
          <div style={{ width: '150px' }}>
            <label style={labelStyle}>Niveau</label>
            <select
              value={niveauInput}
              onChange={(e) => setNiveauInput(Number(e.target.value))}
              style={{
                width: '100%', height: '2.5rem', padding: '0 0.75rem',
                borderRadius: '0.5rem', border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)',
                fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              {NIVEAUX_LABELS.map((n) => (
                <option key={n.niveau} value={n.niveau}>{n.label}</option>
              ))}
            </select>
          </div>

          {/* Bouton ajouter */}
          <button
            onClick={() => ajouterCompetence(nomInput, niveauInput)}
            style={{
              height: '2.5rem', padding: '0 0.875rem', borderRadius: '0.5rem', border: 'none',
              backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem',
              flexShrink: 0, marginTop: '1.375rem',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Liste des compétences ajoutées */}
        {liste.length === 0 ? (
          <div style={{
            padding: '1.5rem', borderRadius: '0.5rem', border: '1px dashed var(--color-border)',
            textAlign: 'center', color: 'var(--color-muted-foreground)', fontSize: '0.875rem',
            marginTop: '1rem',
          }}>
            <Zap style={{ width: '20px', height: '20px', margin: '0 auto 0.5rem', display: 'block' }} />
            Aucune compétence ajoutée. Tapez un nom et cliquez sur +
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {liste.map((c) => {
              const info = niveauInfo(c.niveau);
              return (
                <div key={c.nom} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                  backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)',
                }}>
                  {/* Nom */}
                  <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{c.nom}</span>

                  {/* Barre de progression */}
                  <div style={{ width: '80px' }}>
                    <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px',
                        width: `${info.pct}%`,
                        backgroundColor: info.color,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>

                  {/* Label niveau */}
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                    borderRadius: '999px', whiteSpace: 'nowrap',
                    backgroundColor: `color-mix(in srgb, ${info.color} 15%, transparent)`,
                    color: info.color,
                  }}>
                    {info.label}
                  </span>

                  {/* Supprimer */}
                  <button
                    onClick={() => retirerCompetence(c.nom)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.125rem', flexShrink: 0 }}
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button onClick={() => { onSuccess(); onClose(); }} style={btnOutline} disabled={saving}>
            Passer
          </button>
          <button onClick={handleSave} style={btnPrimary} disabled={saving || liste.length === 0}>
            {saving ? "Enregistrement..." : `Enregistrer (${liste.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' };
const btnPrimary: React.CSSProperties = { padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' };
const btnOutline: React.CSSProperties = { padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' };

export default AjoutCompetences;

import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";
import axios from "axios";
import { Button } from "../../../components/UI/Button";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

type Competence = { competenceId: number; nom: string; categorie?: string };

const NIVEAUX = ["DÉBUTANT", "INTERMÉDIAIRE", "AVANCÉ", "EXPERT"];

const AjoutFormation = ({ onClose, onSuccess }: Props) => {
  const [titre, setTitre]               = useState("");
  const [description, setDescription]   = useState("");
  const [heuresParJour, setHeuresParJour] = useState("");
  const [niveau, setNiveau]             = useState("DÉBUTANT");
  const [dateDebut, setDateDebut]       = useState("");
  const [dateFin, setDateFin]           = useState("");
  const [capacite, setCapacite]         = useState("");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  // Compétences
  const [toutesCompetences, setToutesCompetences] = useState<Competence[]>([]);
  const [selectedIds, setSelectedIds]             = useState<number[]>([]);
  const [searchComp, setSearchComp]               = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API_URL}/competences/getall`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setToutesCompetences(r.data))
      .catch(() => {});
  }, []);

  const toggleCompetence = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const competencesFiltrees = toutesCompetences.filter((c) =>
    c.nom.toLowerCase().includes(searchComp.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!titre.trim())  { setError("Le titre est obligatoire"); return; }
    if (!heuresParJour) { setError("Le nombre d'heures par jour est obligatoire"); return; }
    if (Number(heuresParJour) < 1 || Number(heuresParJour) > 24) {
      setError("Le nombre d'heures par jour doit être entre 1 et 24"); return;
    }
    if (!dateDebut)     { setError("La date de début est obligatoire"); return; }
    if (!dateFin)       { setError("La date de fin est obligatoire"); return; }
    if (dateFin < dateDebut) { setError("La date de fin doit être postérieure à la date de début"); return; }
    if (!capacite)      { setError("La capacité est obligatoire"); return; }
    if (Number(capacite) < 1) { setError("La capacité doit être d'au moins 1 place"); return; }

    setSaving(true); setError("");
    try {
      await axios.post(
        `${API_URL}/formation/add`,
        {
          titre: titre.trim(),
          description: description.trim() || undefined,
          heures_par_jour: Number(heuresParJour),
          niveau,
          date_debut: dateDebut,
          date_fin: dateFin,
          capacite: Number(capacite),
          competenceIds: selectedIds,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de la création");
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem',
        width: '100%', maxWidth: '540px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
            Nouvelle formation
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Titre */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Titre <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <Input placeholder="ex: Formation React avancé" value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Description <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <textarea
              placeholder="Description de la formation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)', fontSize: '0.875rem',
                fontFamily: 'var(--font-body)', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Heures + Niveau */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Heures / jour <span style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
            <Input type="text" inputMode="numeric" min="1" max="24" placeholder="ex: 7" value={heuresParJour} onChange={(e) => setHeuresParJour(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Niveau <span style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
                style={{
                  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)',
                  color: 'var(--color-foreground)', fontSize: '0.875rem',
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Date de début <span style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Date de fin <span style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} min={dateDebut} />
            </div>
          </div>

          {/* Capacité */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Capacité (nb de places) <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <Input type="text" inputMode="numeric" min="1" placeholder="ex: 20" value={capacite} onChange={(e) => setCapacite(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>

          {/* Compétences ciblées */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              <Tag style={{ width: '14px', height: '14px', display: 'inline', marginRight: '0.375rem' }} />
              Compétences ciblées <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              Ces compétences seront utilisées par l'IA pour recommander cette formation aux employés qui en ont besoin.
            </p>

            {/* Tags sélectionnés */}
            {selectedIds.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                {selectedIds.map((id) => {
                  const c = toutesCompetences.find((x) => x.competenceId === id);
                  return c ? (
                    <span key={id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                      color: 'var(--color-primary)', fontWeight: 500,
                    }}>
                      {c.nom}
                      <button onClick={() => toggleCompetence(id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'inherit', lineHeight: 1 }}>
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {/* Recherche */}
            <Input
              placeholder="Rechercher une compétence..."
              value={searchComp}
              onChange={(e) => setSearchComp(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            />

            {/* Liste */}
            <div style={{
              maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--color-border)',
              borderRadius: '0.5rem', padding: '0.25rem',
            }}>
              {competencesFiltrees.length === 0 ? (
                <p style={{ padding: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)', margin: 0 }}>
                  Aucune compétence trouvée
                </p>
              ) : competencesFiltrees.map((c) => {
                const selected = selectedIds.includes(c.competenceId);
                return (
                  <div
                    key={c.competenceId}
                    onClick={() => toggleCompetence(c.competenceId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.375rem 0.5rem', borderRadius: '0.375rem', cursor: 'pointer',
                      backgroundColor: selected ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                      border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '0.8125rem' }}>{c.nom}</span>
                    {c.categorie && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)', marginLeft: 'auto' }}>{c.categorie}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Création..." : "Créer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AjoutFormation;

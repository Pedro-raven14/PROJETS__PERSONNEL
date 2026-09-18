import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { Button } from "../../../components/UI/Button";
import { Input } from "../../../components/UI/Input";
import { API_URL } from "../../../config/api";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const AjoutDepartement = ({ onClose, onSuccess }: Props) => {
  const [nom, setNom]               = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async () => {
    if (!nom.trim()) {
      setError("Le nom du département est obligatoire");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/departement/add`,
        { nom: nom.trim(), description: description.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === "string" ? msg : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
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
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        maxHeight: '90dvh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
            Nouveau département
          </h2>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem',
            backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)',
            color: 'var(--color-destructive)', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* Champs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Nom <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <Input
              placeholder="ex: Ressources Humaines"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Description{' '}
              <span style={{ color: 'var(--color-muted-foreground)', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <Input
              placeholder="Description du département..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Création..." : "Créer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AjoutDepartement;

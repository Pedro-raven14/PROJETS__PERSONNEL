import { useState } from "react";
import { X, FileText, CheckCircle } from "lucide-react";
import { Input } from "../../../components/UI/Input";
import { contratService } from "../../../lib/mockService";

type Props = {
  employee: { userId: number; prenom: string; nom: string };
  onClose: () => void;
  onSuccess: () => void;
};

const TYPES_CONTRAT = ["CDI", "CDD", "STAGE", "FREELANCE", "ALTERNANCE"];

const CreateContrat = ({ employee, onClose, onSuccess }: Props) => {

  const [type,       setType]       = useState("CDI");
  const [dateDebut,  setDateDebut]  = useState(new Date().toISOString().split("T")[0]);
  const [dateFin,    setDateFin]    = useState("");
  const [poste,      setPoste]      = useState("");
  const [salaire,    setSalaire]    = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  const isCDI = type === "CDI";

  const handleSubmit = async () => {
    if (!poste.trim() || !salaire || !dateDebut) {
      setError("Poste, salaire et date de début sont obligatoires");
      return;
    }
    if (!isCDI && !dateFin) {
      setError("La date de fin est obligatoire pour ce type de contrat");
      return;
    }
    if (isNaN(Number(salaire)) || Number(salaire) <= 0) {
      setError("Le salaire doit être un nombre positif");
      return;
    }
    if (!isCDI && dateFin && dateFin <= dateDebut) {
      setError("La date de fin doit être postérieure à la date de début");
      return;
    }

    setSaving(true);
    setError("");
    try {
      contratService.add({
        type,
        date_debut: dateDebut,
        date_fin:   isCDI ? undefined : dateFin,
        poste:      poste.trim(),
        salaire:    Number(salaire),
        userId:     employee.userId,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); }, 1800);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la création du contrat");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
                Créer un contrat
              </h2>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                Pour {employee.prenom} {employee.nom}
              </p>
            </div>
          </div>
          {!saving && !success && (
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem', borderRadius: '0.375rem' }}>
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          )}
        </div>

        {/* Succès */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle style={{ width: '3rem', height: '3rem', color: 'var(--color-success)', margin: '0 auto 1rem' }} />
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>
              Contrat créé avec succès !
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
              Le PDF a été généré et {employee.prenom} a été notifié(e) pour le signer.
            </p>
          </div>
        ) : (
          <>
            {/* Erreur */}
            {error && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {/* Info */}
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
              Un PDF sera généré automatiquement. {employee.prenom} recevra une notification pour le signer depuis son espace.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Type de contrat */}
              <div>
                <label style={labelStyle}>Type de contrat <Req /></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {TYPES_CONTRAT.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setType(t); if (t === "CDI") setDateFin(""); }}
                      style={{
                        padding: '0.375rem 0.875rem', borderRadius: '9999px', border: '1.5px solid',
                        borderColor: type === t ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: type === t ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'transparent',
                        color: type === t ? 'var(--color-primary)' : 'var(--color-foreground)',
                        fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Poste */}
              <div>
                <label style={labelStyle}>Poste <Req /></label>
                <Input placeholder="ex: Développeur Frontend" value={poste} onChange={(e) => setPoste(e.target.value)} />
              </div>

              {/* Salaire */}
              <div>
                <label style={labelStyle}>Salaire mensuel (FCFA) <Req /></label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="ex: 350000"
                  value={salaire}
                  onChange={(e) => setSalaire(e.target.value.replace(/[^0-9]/g, ""))}
                  min={0}
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: isCDI ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Date de début <Req /></label>
                  <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                </div>
                {!isCDI && (
                  <div>
                    <label style={labelStyle}>Date de fin <Req /></label>
                    <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} min={dateDebut} />
                  </div>
                )}
              </div>

              {isCDI && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                  CDI — durée indéterminée, pas de date de fin
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={onClose} disabled={saving} style={btnOutline}>
                Passer pour l'instant
              </button>
              <button onClick={handleSubmit} disabled={saving} style={btnPrimary}>
                {saving ? "Génération du PDF..." : "Créer le contrat"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' };
const Req = () => <span style={{ color: 'var(--color-destructive)' }}> *</span>;
const btnPrimary: React.CSSProperties = { padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' };
const btnOutline: React.CSSProperties = { padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' };

export default CreateContrat;

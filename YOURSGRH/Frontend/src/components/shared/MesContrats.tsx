import { useEffect, useRef, useState } from "react";
import { FileText, PenLine, Eye, CheckCircle, Clock, X, ArrowLeft } from "lucide-react";
import { PageHeader } from "../element/PageHeader";
import { contratService } from "../../lib/mockService";

type Contrat = {
  contratId: number;
  type: string;
  poste: string;
  salaire: number;
  date_debut: string;
  date_fin?: string;
  statut: string;
  signe: boolean;
  signeLe?: string;
  documentPath?: string;
  documentSignePath?: string;
};

// ── Modal de signature ────────────────────────────────────────────────────────

const ModalSignature = ({
  contrat,
  onClose,
  onSigned,
}: {
  contrat: Contrat;
  onClose: () => void;
  onSigned: () => void;
}) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const drawing    = useRef(false);
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => { drawing.current = false; };

  const effacer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const confirmer = () => {
    if (!hasDrawn) { setError("Veuillez dessiner votre signature"); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureBase64 = canvas.toDataURL("image/png");
    setSaving(true); setError("");
    try {
      contratService.signer(contrat.contratId, signatureBase64);
      onSigned(); onClose();
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la signature");
    } finally { setSaving(false); }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: 'var(--color-card)', borderRadius: '0.75rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90dvh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>
              Signer le contrat
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
              {contrat.type} — {contrat.poste}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: '0.25rem' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Info */}
        <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', fontSize: '0.8125rem', color: 'var(--color-primary)' }}>
          En signant, vous confirmez avoir lu et accepté les termes de ce contrat.
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Canvas de signature */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Votre signature</label>
            <button
              onClick={effacer}
              style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Effacer
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={440}
            height={140}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            style={{
              width: '100%', height: '140px', borderRadius: '0.5rem',
              border: '1.5px solid var(--color-border)', cursor: 'crosshair',
              touchAction: 'none', display: 'block',
            }}
          />
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
            Dessinez votre signature avec la souris ou votre doigt
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={btnOutline}>Annuler</button>
          <button onClick={confirmer} disabled={saving || !hasDrawn} style={{ ...btnPrimary, opacity: (!hasDrawn || saving) ? 0.6 : 1 }}>
            {saving ? "Signature en cours..." : "Confirmer la signature"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Viewer PDF ────────────────────────────────────────────────────────────────
// En mode démo, pas de PDF réel disponible — on affiche un message
const PdfViewer = ({ contrat, onClose }: { contrat: Contrat; onClose: () => void }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-card)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-display)', fontSize: '0.875rem', padding: '0.375rem 0.5rem', borderRadius: '0.375rem' }}>
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Retour
        </button>
        <span style={{ marginLeft: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem' }}>
          Contrat {contrat.type} — {contrat.poste}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#525659' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <FileText style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.6 }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>PDF non disponible en mode démo</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.7 }}>Les documents PDF nécessitent le backend</p>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const MesContrats = () => {
  const [contrats,  setContrats]  = useState<Contrat[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [signing,   setSigning]   = useState<Contrat | null>(null);
  const [viewing,   setViewing]   = useState<Contrat | null>(null);

  const fetchContrats = () => {
    try {
      const emp = (() => { try { return JSON.parse(localStorage.getItem("employee") || "null"); } catch { return null; } })();
      const data = contratService.getMesContrats(emp?.userId ?? 0) as Contrat[];
      const sorted = [...data].sort((a, b) => {
        if (a.statut === 'ACTIF' && b.statut !== 'ACTIF') return -1;
        if (b.statut === 'ACTIF' && a.statut !== 'ACTIF') return 1;
        return new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
      });
      setContrats(sorted);
    } catch { /* silencieux */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContrats(); }, []);

  const nbNonSignes = contrats.filter((c) => !c.signe).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Mes contrats"
        subtitle={
          nbNonSignes > 0
            ? `${nbNonSignes} contrat(s) en attente de signature`
            : `${contrats.length} contrat(s)`
        }
      />

      {/* Alerte contrats non signés */}
      {nbNonSignes > 0 && (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock style={{ width: '18px', height: '18px', color: 'var(--color-warning)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
            Vous avez {nbNonSignes} contrat(s) en attente de votre signature.
          </p>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-muted-foreground)', padding: '2rem' }}>Chargement...</p>
      ) : contrats.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', color: 'var(--color-muted-foreground)' }} />
          <p style={{ margin: 0, color: 'var(--color-muted-foreground)' }}>Aucun contrat</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {contrats.map((c) => (
            <div
              key={c.contratId}
              className="stat-card"
              style={{ borderLeft: `3px solid ${c.statut === 'ACTIF' ? 'var(--color-primary)' : 'var(--color-border)'}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{c.type}</span>
                    {c.statut === 'ACTIF' && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                        EN COURS
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem' }}>{c.poste}</p>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--color-muted-foreground)' }}>
                    Du {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                    {c.date_fin ? ` au ${new Date(c.date_fin).toLocaleDateString('fr-FR')}` : ' (en cours)'}
                    {' · '}
                    <strong style={{ color: 'var(--color-foreground)' }}>
                      {Number(c.salaire).toLocaleString('fr-FR', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\s/g, ' ')} FCFA
                    </strong>
                  </p>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: c.statut === 'ACTIF' ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'var(--color-muted)', color: c.statut === 'ACTIF' ? 'var(--color-success)' : 'var(--color-muted-foreground)' }}>
                      {c.statut}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: c.signe ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'color-mix(in srgb, var(--color-warning) 12%, transparent)', color: c.signe ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {c.signe
                        ? <><CheckCircle style={{ width: '11px', height: '11px' }} /> Signé</>
                        : <><Clock style={{ width: '11px', height: '11px' }} /> À signer</>
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {(c.documentPath || c.documentSignePath) && (
                    <button onClick={() => setViewing(c)} style={{ ...btnOutline, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Eye style={{ width: '14px', height: '14px' }} /> Voir
                    </button>
                  )}
                  {!c.signe && (
                    <button onClick={() => setSigning(c)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <PenLine style={{ width: '14px', height: '14px' }} /> Signer
                    </button>
                  )}
                  {c.signe && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                      <CheckCircle style={{ width: '15px', height: '15px' }} /> Signé
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal signature */}
      {signing && (
        <ModalSignature
          contrat={signing}
          onClose={() => setSigning(null)}
          onSigned={() => {
            // Recharger les contrats pour avoir documentSignePath à jour
            fetchContrats();
            setSigning(null);
          }}
        />
      )}

      {/* Viewer PDF */}
      {viewing && <PdfViewer contrat={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

// Styles partagés
const btnPrimary: React.CSSProperties = { padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer' };
const btnOutline: React.CSSProperties = { padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-foreground)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer' };

export default MesContrats;

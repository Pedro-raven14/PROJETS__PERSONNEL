import { useEffect, useState } from "react";
import {
  Brain, TrendingUp, TrendingDown, GraduationCap,
  AlertTriangle, CheckCircle,
  Loader2, Users, X, ArrowUpRight, ArrowDownRight,
  Target, Zap, ShieldCheck,
} from "lucide-react";
import { PageHeader } from "../../../components/element/PageHeader";
import { AvatarInitials } from "../../../components/element/AvatarInitials";
import { Button } from "../../../components/UI/Button";
import { employeeService, predictionService } from "../../../lib/mockService";

// ─── Types ────────────────────────────────────────────────────────────────────

type TypePrediction =
  | "RISQUE_DEPART"
  | "SUGGESTION_PROMOTION"
  | "SUGGESTION_LICENCIEMENT"
  | "RECOMMANDATION_FORMATION";

type Employe = { userId: number; nom: string; prenom: string; poste?: string };

type ResultatDepart = {
  userId: number; nom: string; prenom: string; poste: string;
  probabilite_depart: number; niveau_risque: string; risque_depart: boolean;
  facteurs_risque: string[]; facteurs_retention: string[];
  actions_recommandees: { categorie: string; action: string }[];
};

type ResultatPromotion = {
  userId: number; nom: string; prenom: string; poste: string;
  promotion_suggeree: boolean; probabilite_promotion: number; niveau_risque: string;
};

type ResultatLicenciement = {
  userId: number; nom: string; prenom: string; poste: string;
  probabilite_licenciement: number; niveau_risque: string; licenciement_suggere: boolean;
  motifs: string[]; points_positifs: string[];
  actions_recommandees: { categorie: string; action: string }[];
};

type ResultatFormation = {
  rang?: number; formationId?: number; titre: string; niveau: string;
  score: number; raison: string; competences_cibles?: string[];
};

type PredictionResultat = ResultatDepart | ResultatPromotion | ResultatLicenciement;

type PredictionResponse = {
  message: string;
  prediction: {
    predictionId: number; type: string; message: string;
    resultats?: PredictionResultat[];
    recommandations?: ResultatFormation[];
  };
};

// ─── Helpers visuels ──────────────────────────────────────────────────────────

const TYPES: { value: TypePrediction; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "RISQUE_DEPART",           label: "Risque de départ",        icon: <TrendingDown  size={16} />, color: "var(--color-destructive)" },
  { value: "SUGGESTION_PROMOTION",    label: "Suggestion promotion",    icon: <TrendingUp    size={16} />, color: "var(--color-success)"     },
  { value: "SUGGESTION_LICENCIEMENT", label: "Suggestion licenciement", icon: <AlertTriangle size={16} />, color: "var(--color-warning)"     },
  { value: "RECOMMANDATION_FORMATION",label: "Recommandation formation",icon: <GraduationCap size={16} />, color: "var(--color-primary)"     },
];

function niveauColor(niveau: string): string {
  const n = (niveau ?? "").toLowerCase();
  if (n.includes("élevé") || n.includes("eleve") || n.includes("haut"))  return "var(--color-destructive)";
  if (n.includes("modéré") || n.includes("modere") || n.includes("moyen")) return "var(--color-warning)";
  return "var(--color-success)";
}

function Jauge({ valeur, couleur, small }: { valeur: number; couleur: string; small?: boolean }) {
  const pct = Math.min(100, Math.round(valeur));
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: small ? "0.7rem" : "0.75rem", color: "var(--color-muted-foreground)" }}>Probabilité</span>
        <span style={{ fontSize: small ? "0.8125rem" : "0.9375rem", fontWeight: 700, color: couleur }}>{pct}%</span>
      </div>
      <div style={{ height: small ? "6px" : "8px", borderRadius: "9999px", backgroundColor: "var(--color-muted)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", backgroundColor: couleur, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Modal Focus Mode ─────────────────────────────────────────────────────────

type FocusModalProps = {
  type: TypePrediction;
  data: PredictionResultat;
  onClose: () => void;
};

function FocusModal({ type, data, onClose }: FocusModalProps) {
  const typeInfo = TYPES.find(t => t.value === type)!;

  // Valeur principale selon le type
  const getValeur = (): number => {
    if (type === "RISQUE_DEPART")           return (data as ResultatDepart).probabilite_depart;
    if (type === "SUGGESTION_PROMOTION")    return (data as ResultatPromotion).probabilite_promotion;
    if (type === "SUGGESTION_LICENCIEMENT") return (data as ResultatLicenciement).probabilite_licenciement;
    return 0;
  };

  const pct    = Math.min(100, Math.round(getValeur()));
  const couleur = niveauColor(data.niveau_risque);

  // Label décision selon le type
  const getDecision = () => {
    if (type === "RISQUE_DEPART") {
      const r = data as ResultatDepart;
      return { ok: !r.risque_depart, label: r.risque_depart ? "Risque confirmé" : "Stable" };
    }
    if (type === "SUGGESTION_PROMOTION") {
      const r = data as ResultatPromotion;
      return { ok: r.promotion_suggeree, label: r.promotion_suggeree ? "Promotion suggérée" : "Pas de promotion" };
    }
    if (type === "SUGGESTION_LICENCIEMENT") {
      const r = data as ResultatLicenciement;
      return { ok: !r.licenciement_suggere, label: r.licenciement_suggere ? "Licenciement suggéré" : "Pas de suggestion" };
    }
    return { ok: true, label: "" };
  };

  const decision = getDecision();

  // Sections dynamiques
  const renderSections = () => {
    if (type === "RISQUE_DEPART") {
      const r = data as ResultatDepart;
      return (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {r.facteurs_risque?.length > 0 && (
              <div style={sectionBox("var(--color-destructive)")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                  <ArrowUpRight size={14} color="var(--color-destructive)" />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-destructive)" }}>Facteurs de risque</span>
                </div>
                <ul style={listStyle}>
                  {r.facteurs_risque.map((f, i) => <li key={i} style={listItemStyle}><span style={bulletStyle("var(--color-destructive)")} />{f}</li>)}
                </ul>
              </div>
            )}
            {r.facteurs_retention?.length > 0 && (
              <div style={sectionBox("var(--color-success)")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                  <ArrowDownRight size={14} color="var(--color-success)" />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-success)" }}>Facteurs de rétention</span>
                </div>
                <ul style={listStyle}>
                  {r.facteurs_retention.map((f, i) => <li key={i} style={listItemStyle}><span style={bulletStyle("var(--color-success)")} />{f}</li>)}
                </ul>
              </div>
            )}
          </div>
          {r.actions_recommandees?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                <Target size={14} color="var(--color-primary)" />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-primary)" }}>Actions recommandées</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
                {r.actions_recommandees.map((a, i) => (
                  <div key={i} style={{ padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>{a.action}</p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: "var(--color-muted-foreground)" }}>{a.categorie}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (type === "SUGGESTION_PROMOTION") {
      const r = data as ResultatPromotion;
      return (
        <div style={sectionBox(couleur)}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {r.promotion_suggeree
              ? <TrendingUp size={16} color="var(--color-success)" />
              : <TrendingDown size={16} color="var(--color-muted-foreground)" />
            }
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>
              {r.promotion_suggeree
                ? "Le profil de cet employé correspond aux critères d'une promotion (performance, ancienneté, engagement)."
                : "Le profil ne remplit pas encore les critères requis pour une promotion à ce stade."
              }
            </p>
          </div>
        </div>
      );
    }

    if (type === "SUGGESTION_LICENCIEMENT") {
      const r = data as ResultatLicenciement;
      return (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {r.motifs?.length > 0 && (
              <div style={sectionBox("var(--color-destructive)")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                  <AlertTriangle size={14} color="var(--color-destructive)" />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-destructive)" }}>Motifs</span>
                </div>
                <ul style={listStyle}>
                  {r.motifs.map((m, i) => <li key={i} style={listItemStyle}><span style={bulletStyle("var(--color-destructive)")} />{m}</li>)}
                </ul>
              </div>
            )}
            {r.points_positifs?.length > 0 && (
              <div style={sectionBox("var(--color-success)")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                  <ShieldCheck size={14} color="var(--color-success)" />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-success)" }}>Points positifs</span>
                </div>
                <ul style={listStyle}>
                  {r.points_positifs.map((p, i) => <li key={i} style={listItemStyle}><span style={bulletStyle("var(--color-success)")} />{p}</li>)}
                </ul>
              </div>
            )}
          </div>
          {r.actions_recommandees?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                <Target size={14} color="var(--color-primary)" />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-primary)" }}>Actions recommandées</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
                {r.actions_recommandees.map((a, i) => (
                  <div key={i} style={{ padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-primary) 5%, transparent)" }}>
                    <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>{a.action}</p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: "var(--color-muted-foreground)" }}>{a.categorie}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "var(--color-card)", borderRadius: "1rem", width: "100%", maxWidth: "560px", maxHeight: "88dvh", overflowY: "auto", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>

        {/* En-tête modal */}
        <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ color: typeInfo.color }}>{typeInfo.icon}</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9375rem", fontWeight: 600 }}>
              Analyse — {typeInfo.label}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted-foreground)", padding: "0.25rem", borderRadius: "0.375rem" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Identité + score */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", backgroundColor: "color-mix(in srgb, var(--color-muted) 20%, transparent)" }}>
            <AvatarInitials firstName={data.prenom} lastName={data.nom} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 700 }}>
                {data.prenom} {data.nom}
              </p>
              <p style={{ margin: "0.125rem 0 0", fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>
                {data.poste}
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.375rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: couleur + "22", color: couleur }}>
                {decision.ok ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                {data.niveau_risque}
              </span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: couleur, lineHeight: 1 }}>
                {pct}%
              </p>
              <p style={{ margin: "0.125rem 0 0", fontSize: "0.7rem", color: "var(--color-muted-foreground)" }}>
                probabilité
              </p>
            </div>
          </div>

          {/* Jauge large */}
          <div style={{ padding: "0.875rem 1rem", borderRadius: "0.625rem", border: "1px solid var(--color-border)" }}>
            <Jauge valeur={getValeur()} couleur={couleur} />
            <div style={{ marginTop: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
              {decision.ok ? <CheckCircle size={13} color="var(--color-success)" /> : <AlertTriangle size={13} color={couleur} />}
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: decision.ok ? "var(--color-success)" : couleur }}>
                {decision.label}
              </span>
            </div>
          </div>

          {/* Sections spécifiques au type */}
          {renderSections()}
        </div>
      </div>
    </div>
  );
}

// ─── Styles partagés pour les sections ───────────────────────────────────────

const sectionBox = (color: string): React.CSSProperties => ({
  padding: "0.875rem",
  borderRadius: "0.625rem",
  border: `1px solid color-mix(in srgb, ${color} 20%, var(--color-border))`,
  backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`,
});

const listStyle: React.CSSProperties = { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" };
const listItemStyle: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem" };
const bulletStyle = (color: string): React.CSSProperties => ({
  width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color,
  flexShrink: 0, marginTop: "0.35rem",
});

// ─── Cartes compactes cliquables ──────────────────────────────────────────────

function CarteDepart({ r, onClick }: { r: ResultatDepart; onClick: () => void }) {
  const couleur = niveauColor(r.niveau_risque);
  return (
    <div
      onClick={onClick}
      style={{ border: `1px solid var(--color-border)`, borderRadius: "0.75rem", padding: "1rem", backgroundColor: "var(--color-card)", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = couleur; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${couleur}18`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      <AvatarInitials firstName={r.prenom} lastName={r.nom} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "0.9375rem" }}>{r.prenom} {r.nom}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{r.poste}</p>
        <div style={{ marginTop: "0.5rem" }}>
          <Jauge valeur={r.probabilite_depart} couleur={couleur} small />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: couleur + "22", color: couleur }}>
            {r.risque_depart ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
            {r.niveau_risque}
          </span>
        </div>
      </div>
      <Zap size={14} style={{ color: "var(--color-muted-foreground)", flexShrink: 0, marginTop: "0.25rem" }} />
    </div>
  );
}

function CartePromotion({ r, onClick }: { r: ResultatPromotion; onClick: () => void }) {
  const couleur = r.promotion_suggeree ? "var(--color-success)" : "var(--color-muted-foreground)";
  return (
    <div
      onClick={onClick}
      style={{ border: "1px solid var(--color-border)", borderRadius: "0.75rem", padding: "1rem", backgroundColor: "var(--color-card)", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = couleur; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${couleur}18`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      <AvatarInitials firstName={r.prenom} lastName={r.nom} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "0.9375rem" }}>{r.prenom} {r.nom}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{r.poste}</p>
        <div style={{ marginTop: "0.5rem" }}>
          <Jauge valeur={r.probabilite_promotion} couleur={couleur} small />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: couleur + "22", color: couleur }}>
            {r.promotion_suggeree ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {r.promotion_suggeree ? "Promotion suggérée" : "Pas de promotion"}
          </span>
        </div>
      </div>
      <Zap size={14} style={{ color: "var(--color-muted-foreground)", flexShrink: 0, marginTop: "0.25rem" }} />
    </div>
  );
}

function CarteLicenciement({ r, onClick }: { r: ResultatLicenciement; onClick: () => void }) {
  const couleur = niveauColor(r.niveau_risque);
  return (
    <div
      onClick={onClick}
      style={{ border: "1px solid var(--color-border)", borderRadius: "0.75rem", padding: "1rem", backgroundColor: "var(--color-card)", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = couleur; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${couleur}18`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      <AvatarInitials firstName={r.prenom} lastName={r.nom} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "0.9375rem" }}>{r.prenom} {r.nom}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{r.poste}</p>
        <div style={{ marginTop: "0.5rem" }}>
          <Jauge valeur={r.probabilite_licenciement} couleur={couleur} small />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600, backgroundColor: couleur + "22", color: couleur }}>
            {r.licenciement_suggere ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
            {r.niveau_risque}
          </span>
        </div>
      </div>
      <Zap size={14} style={{ color: "var(--color-muted-foreground)", flexShrink: 0, marginTop: "0.25rem" }} />
    </div>
  );
}

function CarteFormation({ r }: { r: ResultatFormation }) {
  const pct = Math.min(100, Math.round(r.score ?? 0));
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "0.75rem", padding: "1rem", backgroundColor: "var(--color-card)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <GraduationCap size={16} color="var(--color-primary-foreground)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "0.9375rem" }}>{r.titre}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)", marginTop: "0.125rem" }}>{r.niveau}</p>
        {r.raison && <p style={{ margin: "0.375rem 0 0", fontSize: "0.8125rem", color: "var(--color-foreground)" }}>{r.raison}</p>}
        {pct > 0 && (
          <div style={{ marginTop: "0.5rem" }}>
            <Jauge valeur={r.score} couleur="var(--color-primary)" small />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const AnalysesIA = () => {
  const [employes, setEmployes]       = useState<Employe[]>([]);
  const [typePred, setTypePred]       = useState<TypePrediction>("RISQUE_DEPART");
  const [loading, setLoading]         = useState(false);
  const [loadingEmp, setLoadingEmp]   = useState(true);
  const [resultat, setResultat]       = useState<PredictionResponse | null>(null);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [focusData, setFocusData]     = useState<PredictionResultat | null>(null);

  useEffect(() => {
    try {
      const result = employeeService.getAll(1, 200);
      setEmployes(result.data);
    } catch { setEmployes([]); } finally {
      setLoadingEmp(false);
    }
  }, []);

  const lancer = () => {
    setLoading(true); setErreur(null); setResultat(null);
    try {
      const res = predictionService.lancer(typePred);
      setResultat(res);
    } catch (err: any) {
      setErreur(err?.message ?? "Erreur lors de l'analyse IA.");
    } finally { setLoading(false); }
  };

  const typeInfo    = TYPES.find(t => t.value === typePred)!;
  const resultats   = resultat?.prediction?.resultats ?? [];
  const recommandations = resultat?.prediction?.recommandations ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Analyses IA"
        subtitle="Prédictions RH basées sur l'intelligence artificielle"
      />

      {/* ── Panneau de lancement ── */}
      <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Brain size={20} color="var(--color-primary)" />
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
            Lancer une analyse
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-muted-foreground)" }}>
            Type d'analyse
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => { setTypePred(t.value); setResultat(null); setErreur(null); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.4rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem",
                  fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                  border: `1.5px solid ${typePred === t.value ? t.color : "var(--color-border)"}`,
                  backgroundColor: typePred === t.value ? t.color + "18" : "transparent",
                  color: typePred === t.value ? t.color : "var(--color-muted-foreground)",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>
          <Users size={14} />
          {loadingEmp ? "Chargement des employés..." : `${employes.length} employé(s) seront analysés`}
        </div>

        <Button onClick={lancer} disabled={loading || loadingEmp} style={{ alignSelf: "flex-start" }}>
          {loading
            ? <><Loader2 size={16} style={{ marginRight: "0.5rem", animation: "spin 1s linear infinite" }} />Analyse en cours...</>
            : <><Brain size={16} style={{ marginRight: "0.5rem" }} />Lancer l'analyse</>
          }
        </Button>
      </div>

      {/* ── Erreur ── */}
      {erreur && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", backgroundColor: "var(--color-destructive)18", border: "1px solid var(--color-destructive)", color: "var(--color-destructive)", fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <AlertTriangle size={16} /> {erreur}
        </div>
      )}

      {/* ── Résultats ── */}
      {resultat && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ color: typeInfo.color }}>{typeInfo.icon}</span>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>
              Résultats — {typeInfo.label}
            </h2>
            {resultats.length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>
                {resultats.length} employé(s) analysé(s)
              </span>
            )}
          </div>

          {/* Hint cliquable */}
          {resultats.length > 0 && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-muted-foreground)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Zap size={13} /> Cliquez sur une carte pour voir le détail complet de l'analyse.
            </p>
          )}

          {/* Grille résultats */}
          {typePred === "RECOMMANDATION_FORMATION" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0.75rem" }}>
              {recommandations.map((r, i) => <CarteFormation key={i} r={r} />)}
              {recommandations.length === 0 && (
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem" }}>Aucune recommandation disponible.</p>
              )}
            </div>
          ) : typePred === "RISQUE_DEPART" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
              {(resultats as ResultatDepart[]).map((r, i) => (
                <CarteDepart key={i} r={r} onClick={() => setFocusData(r)} />
              ))}
            </div>
          ) : typePred === "SUGGESTION_PROMOTION" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
              {(resultats as ResultatPromotion[]).map((r, i) => (
                <CartePromotion key={i} r={r} onClick={() => setFocusData(r)} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
              {(resultats as ResultatLicenciement[]).map((r, i) => (
                <CarteLicenciement key={i} r={r} onClick={() => setFocusData(r)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Focus Mode ── */}
      {focusData && (
        <FocusModal
          type={typePred}
          data={focusData}
          onClose={() => setFocusData(null)}
        />
      )}
    </div>
  );
};

export default AnalysesIA;

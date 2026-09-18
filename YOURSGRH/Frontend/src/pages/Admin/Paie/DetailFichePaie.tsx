import { X, Wallet, Download, ExternalLink, TrendingDown, TrendingUp, FileText, Calculator } from "lucide-react";
import { Button } from "../../../components/UI/Button";

type FichePaie = {
  ficheId: number;
  periode: string;
  salaire_base: number;
  nb_jours_absence: number;
  deduction_absence: number;
  salaire_net: number;
  nb_heures_sup: number;
  montant_heures_sup: number;
  date_generation: string;
  documentPath?: string;
  employee: { userId: number; nom: string; prenom: string; poste?: string; email?: string };
};

type Props = { fiche: FichePaie; onClose: () => void };

const DIVISEUR = 173.33;
const HEURES_JOUR = 8;

const fmt = (n: number) =>
  Number(n).toLocaleString("fr-FR", { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/\s/g, "\u00a0");

const formatPeriode = (periode: string) => {
  const [annee, mois] = periode.split("-").map(Number);
  return new Date(annee, mois - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const DetailFichePaie = ({ fiche, onClose }: Props) => {
  // En mode démo, pas de PDF disponible
  const salaireBase    = Number(fiche.salaire_base);
  const deduction      = Number(fiche.deduction_absence);
  const montantSup     = Number(fiche.montant_heures_sup);
  const salaireNet     = Number(fiche.salaire_net);
  const nbJoursAbs     = Number(fiche.nb_jours_absence);
  const nbHeuresSup    = Number(fiche.nb_heures_sup);

  // Calculs dérivés pour affichage
  const tauxHoraire    = salaireBase / DIVISEUR;
  const salaireJour    = tauxHoraire * HEURES_JOUR;

  // Tranches heures sup
  const tranche1H      = nbHeuresSup > 0 ? Math.min(nbHeuresSup, 8) : 0;
  const tranche2H      = nbHeuresSup > 8 ? nbHeuresSup - 8 : 0;
  const montantT1      = tauxHoraire * 1.12 * tranche1H;
  const montantT2      = tauxHoraire * 1.35 * tranche2H;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "var(--color-card)", borderRadius: "0.75rem", width: "100%", maxWidth: "560px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", maxHeight: "90dvh", overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)", color: "var(--color-primary)" }}>
              <Wallet style={{ width: "18px", height: "18px" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.0625rem", fontWeight: 700 }}>Bulletin de paie</h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{formatPeriode(fiche.periode)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-muted-foreground)", padding: "0.25rem" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* ── Employé ── */}
          <div style={{ padding: "0.875rem 1rem", borderRadius: "0.5rem", backgroundColor: "var(--color-muted)", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-primary)", flexShrink: 0 }}>
              {fiche.employee.prenom?.[0]}{fiche.employee.nom?.[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "0.9375rem" }}>{fiche.employee.prenom} {fiche.employee.nom}</p>
              {fiche.employee.poste && <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>{fiche.employee.poste}</p>}
              {fiche.employee.email && <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{fiche.employee.email}</p>}
            </div>
          </div>

          {/* ── Taux de référence ── */}
          <Section titre="Taux de référence" icon={<Calculator style={{ width: "13px", height: "13px" }} />}>
            <LigneDetail label="Salaire mensuel de base" valeur={`${fmt(salaireBase)} FCFA`} />
            <LigneDetail label={`Taux horaire (base ÷ 173,33)`} valeur={`${fmt(tauxHoraire)} FCFA/h`} sous />
            <LigneDetail label={`Salaire journalier (taux × 8h)`} valeur={`${fmt(salaireJour)} FCFA/j`} sous />
          </Section>

          {/* ── Absences ── */}
          {nbJoursAbs > 0 ? (
            <Section titre="Absences" couleur="var(--color-destructive)">
              <LigneDetail label={`Jours d'absence`} valeur={`${nbJoursAbs} jour${nbJoursAbs > 1 ? "s" : ""}`} />
              <LigneDetail label={`Déduction (${nbJoursAbs}j × ${fmt(salaireJour)} FCFA)`} valeur={`− ${fmt(deduction)} FCFA`} couleur="var(--color-destructive)" />
            </Section>
          ) : (
            <Section titre="Absences" couleur="var(--color-success)">
              <LigneDetail label="Aucune absence ce mois-ci" valeur="0 FCFA déduit" couleur="var(--color-success)" />
            </Section>
          )}

          {/* ── Heures supplémentaires ── */}
          {nbHeuresSup > 0 ? (
            <Section titre="Heures supplémentaires" couleur="var(--color-success)">
              <LigneDetail label="Heures déclarées et validées" valeur={`${nbHeuresSup}h`} />
              {tranche1H > 0 && (
                <LigneDetail
                  label={`Tranche 1 — ${tranche1H}h × taux × 1,12 (+12%)`}
                  valeur={`+ ${fmt(montantT1)} FCFA`}
                  couleur="var(--color-success)"
                  sous
                />
              )}
              {tranche2H > 0 && (
                <LigneDetail
                  label={`Tranche 2 — ${tranche2H}h × taux × 1,35 (+35%)`}
                  valeur={`+ ${fmt(montantT2)} FCFA`}
                  couleur="var(--color-success)"
                  sous
                />
              )}
              <LigneDetail label="Total heures supplémentaires" valeur={`+ ${fmt(montantSup)} FCFA`} couleur="var(--color-success)" gras />
            </Section>
          ) : (
            <Section titre="Heures supplémentaires">
              <LigneDetail label="Aucune heure supplémentaire ce mois-ci" valeur="+ 0 FCFA" />
            </Section>
          )}

          {/* ── Récapitulatif ── */}
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <div style={{ padding: "0.625rem 1rem", backgroundColor: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Récapitulatif
            </div>
            <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <LigneDetail label="Salaire de base" valeur={`${fmt(salaireBase)} FCFA`} />
              {nbJoursAbs > 0 && <LigneDetail label={`− Déduction absences (${nbJoursAbs}j)`} valeur={`− ${fmt(deduction)} FCFA`} couleur="var(--color-destructive)" />}
              {nbHeuresSup > 0 && <LigneDetail label={`+ Heures supplémentaires (${nbHeuresSup}h)`} valeur={`+ ${fmt(montantSup)} FCFA`} couleur="var(--color-success)" />}
              <div style={{ borderTop: "1px dashed var(--color-border)", margin: "0.25rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.5rem", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", borderRadius: "0.375rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem" }}>Salaire net à payer</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-primary)" }}>{fmt(salaireNet)} FCFA</span>
              </div>
            </div>
          </div>

          {/* ── Métadonnées ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <Meta label="Période" valeur={formatPeriode(fiche.periode)} />
            <Meta label="Généré le" valeur={new Date(fiche.date_generation).toLocaleDateString("fr-FR")} />
          </div>

          {/* ── Actions PDF ── */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "var(--color-muted)", fontSize: "0.8125rem", color: "var(--color-muted-foreground)", width: "100%" }}>
              <FileText style={{ width: "15px", height: "15px" }} /> PDF non disponible en mode démo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sous-composants ────────────────────────────────────────────────────────────

const Section = ({ titre, couleur, icon, children }: { titre: string; couleur?: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ border: "1px solid var(--color-border)", borderRadius: "0.5rem", overflow: "hidden" }}>
    <div style={{ padding: "0.625rem 1rem", backgroundColor: "var(--color-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
      {icon && <span style={{ color: couleur ?? "var(--color-muted-foreground)" }}>{icon}</span>}
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: couleur ?? "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{titre}</span>
    </div>
    <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      {children}
    </div>
  </div>
);

const LigneDetail = ({ label, valeur, couleur, sous, gras }: { label: string; valeur: string; couleur?: string; sous?: boolean; gras?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: sous ? "0.8rem" : "0.875rem", color: sous ? "var(--color-muted-foreground)" : "var(--color-foreground)", paddingLeft: sous ? "0.75rem" : 0 }}>
      {sous ? "↳ " : ""}{label}
    </span>
    <span style={{ fontSize: gras ? "0.9375rem" : "0.875rem", fontWeight: gras ? 700 : 500, color: couleur ?? "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
      {valeur}
    </span>
  </div>
);

const Meta = ({ label, valeur }: { label: string; valeur: string }) => (
  <div style={{ padding: "0.625rem 0.75rem", borderRadius: "0.375rem", backgroundColor: "var(--color-muted)" }}>
    <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
    <p style={{ margin: "0.125rem 0 0", fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>{valeur}</p>
  </div>
);

export default DetailFichePaie;

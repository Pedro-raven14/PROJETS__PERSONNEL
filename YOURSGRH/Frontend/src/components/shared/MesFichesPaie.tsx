import { useEffect, useState } from "react";
import {
  Wallet, ChevronLeft, ChevronRight,
  ExternalLink, Download, X, FileText, Calculator,
} from "lucide-react";
import axios from "axios";
import { PageHeader } from "../element/PageHeader";
import { Button } from "../UI/Button";
import { API_URL } from "../../config/api";
import { useIsMobile } from "../../hooks/Use-mobile";

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
  employee?: { userId: number; nom: string; prenom: string; poste?: string };
};

const DIVISEUR = 173.33;
const HEURES_JOUR = 8;

const fmt = (n: number) =>
  Number(n).toLocaleString("fr-FR", { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/\s/g, "\u00a0");

const formatPeriode = (periode: string) => {
  const [annee, mois] = periode.split("-").map(Number);
  return new Date(annee, mois - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

// ── Sous-composants partagés ──────────────────────────────────────────────────

const Section = ({ titre, couleur, icon, children }: { titre: string; couleur?: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ border: "1px solid var(--color-border)", borderRadius: "0.5rem", overflow: "hidden" }}>
    <div style={{ padding: "0.5rem 0.875rem", backgroundColor: "var(--color-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
      {icon && <span style={{ color: couleur ?? "var(--color-muted-foreground)" }}>{icon}</span>}
      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: couleur ?? "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{titre}</span>
    </div>
    <div style={{ padding: "0.625rem 0.875rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {children}
    </div>
  </div>
);

const LigneDetail = ({ label, valeur, couleur, sous, gras }: { label: string; valeur: string; couleur?: string; sous?: boolean; gras?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: sous ? "0.78rem" : "0.8125rem", color: sous ? "var(--color-muted-foreground)" : "var(--color-foreground)", paddingLeft: sous ? "0.625rem" : 0 }}>
      {sous ? "↳ " : ""}{label}
    </span>
    <span style={{ fontSize: gras ? "0.875rem" : "0.8125rem", fontWeight: gras ? 700 : 500, color: couleur ?? "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
      {valeur}
    </span>
  </div>
);

// ── Modal détail ──────────────────────────────────────────────────────────────
const ModalDetail = ({ fiche, onClose }: { fiche: FichePaie; onClose: () => void }) => {
  const token  = localStorage.getItem("token");
  const pdfUrl = `${API_URL}/fiche-paie/${fiche.ficheId}/document?token=${token}`;

  const salaireBase = Number(fiche.salaire_base);
  const deduction   = Number(fiche.deduction_absence);
  const montantSup  = Number(fiche.montant_heures_sup);
  const salaireNet  = Number(fiche.salaire_net);
  const nbJoursAbs  = Number(fiche.nb_jours_absence);
  const nbHeuresSup = Number(fiche.nb_heures_sup);

  const tauxHoraire = salaireBase / DIVISEUR;
  const salaireJour = tauxHoraire * HEURES_JOUR;
  const tranche1H   = nbHeuresSup > 0 ? Math.min(nbHeuresSup, 8) : 0;
  const tranche2H   = nbHeuresSup > 8 ? nbHeuresSup - 8 : 0;
  const montantT1   = tauxHoraire * 1.12 * tranche1H;
  const montantT2   = tauxHoraire * 1.35 * tranche2H;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "var(--color-card)", borderRadius: "0.75rem", width: "100%", maxWidth: "540px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", maxHeight: "90dvh", overflowY: "auto" }}>

        {/* Header */}
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

        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>

          {/* Taux de référence */}
          <Section titre="Taux de référence" icon={<Calculator style={{ width: "12px", height: "12px" }} />}>
            <LigneDetail label="Salaire mensuel de base" valeur={`${fmt(salaireBase)} FCFA`} />
            <LigneDetail label="Taux horaire (base ÷ 173,33)" valeur={`${fmt(tauxHoraire)} FCFA/h`} sous />
            <LigneDetail label="Salaire journalier (taux × 8h)" valeur={`${fmt(salaireJour)} FCFA/j`} sous />
          </Section>

          {/* Absences */}
          {nbJoursAbs > 0 ? (
            <Section titre="Absences" couleur="var(--color-destructive)">
              <LigneDetail label="Jours d'absence" valeur={`${nbJoursAbs} jour${nbJoursAbs > 1 ? "s" : ""}`} />
              <LigneDetail label={`Déduction (${nbJoursAbs}j × ${fmt(salaireJour)} FCFA)`} valeur={`− ${fmt(deduction)} FCFA`} couleur="var(--color-destructive)" sous />
            </Section>
          ) : (
            <Section titre="Absences" couleur="var(--color-success)">
              <LigneDetail label="Aucune absence ce mois-ci" valeur="0 FCFA déduit" couleur="var(--color-success)" />
            </Section>
          )}

          {/* Heures sup */}
          {nbHeuresSup > 0 ? (
            <Section titre="Heures supplémentaires" couleur="var(--color-success)">
              <LigneDetail label="Heures déclarées et validées" valeur={`${nbHeuresSup}h`} />
              {tranche1H > 0 && <LigneDetail label={`Tranche 1 — ${tranche1H}h × taux × 1,12 (+12%)`} valeur={`+ ${fmt(montantT1)} FCFA`} couleur="var(--color-success)" sous />}
              {tranche2H > 0 && <LigneDetail label={`Tranche 2 — ${tranche2H}h × taux × 1,35 (+35%)`} valeur={`+ ${fmt(montantT2)} FCFA`} couleur="var(--color-success)" sous />}
              <LigneDetail label="Total heures supplémentaires" valeur={`+ ${fmt(montantSup)} FCFA`} couleur="var(--color-success)" gras />
            </Section>
          ) : (
            <Section titre="Heures supplémentaires">
              <LigneDetail label="Aucune heure supplémentaire" valeur="+ 0 FCFA" />
            </Section>
          )}

          {/* Récapitulatif */}
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <div style={{ padding: "0.5rem 0.875rem", backgroundColor: "var(--color-muted)" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Récapitulatif</span>
            </div>
            <div style={{ padding: "0.625rem 0.875rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <LigneDetail label="Salaire de base" valeur={`${fmt(salaireBase)} FCFA`} />
              {nbJoursAbs > 0 && <LigneDetail label={`− Absences (${nbJoursAbs}j)`} valeur={`− ${fmt(deduction)} FCFA`} couleur="var(--color-destructive)" />}
              {nbHeuresSup > 0 && <LigneDetail label={`+ Heures sup. (${nbHeuresSup}h)`} valeur={`+ ${fmt(montantSup)} FCFA`} couleur="var(--color-success)" />}
              <div style={{ borderTop: "1px dashed var(--color-border)", margin: "0.25rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0.5rem", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", borderRadius: "0.375rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem" }}>Salaire net à payer</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1875rem", color: "var(--color-primary)" }}>{fmt(salaireNet)} FCFA</span>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[{ label: "Période", valeur: formatPeriode(fiche.periode) }, { label: "Généré le", valeur: new Date(fiche.date_generation).toLocaleDateString("fr-FR") }].map(({ label, valeur }) => (
              <div key={label} style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", backgroundColor: "var(--color-muted)" }}>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                <p style={{ margin: "0.125rem 0 0", fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-display)" }}>{valeur}</p>
              </div>
            ))}
          </div>

          {/* Actions PDF */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {fiche.documentPath ? (
              <>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
                  <Button variant="outline" style={{ width: "100%", gap: "0.375rem" }}>
                    <ExternalLink style={{ width: "15px", height: "15px" }} /> Voir le PDF
                  </Button>
                </a>
                <a href={pdfUrl} download style={{ textDecoration: "none", flex: 1 }}>
                  <Button style={{ width: "100%", gap: "0.375rem" }}>
                    <Download style={{ width: "15px", height: "15px" }} /> Télécharger
                  </Button>
                </a>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "var(--color-muted)", fontSize: "0.8125rem", color: "var(--color-muted-foreground)", width: "100%" }}>
                <FileText style={{ width: "15px", height: "15px" }} /> PDF en cours de génération…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
const MesFichesPaie = () => {
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const isMobile = useIsMobile();

  const [fiches, setFiches]         = useState<FichePaie[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [ficheDetail, setFicheDetail] = useState<FichePaie | null>(null);
  const LIMIT = 10;

  const fetchFiches = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/fiche-paie/mes-fiches`, {
        params: { page: p, limit: LIMIT },
        headers,
      });
      setFiches(res.data.data ?? res.data);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
      setPage(p);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiches(1); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Salaire & Paie"
        subtitle={total > 0 ? `${total} bulletin${total > 1 ? "s" : ""} de paie` : "Aucun bulletin disponible"}
      />

      <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
        {isMobile ? (
          /* ── Vue carte mobile ── */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {loading ? (
              <p style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)" }}>Chargement…</p>
            ) : fiches.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <Wallet style={{ width: "2rem", height: "2rem", margin: "0 auto 0.75rem", display: "block", color: "var(--color-muted-foreground)" }} />
                <p style={{ color: "var(--color-muted-foreground)", margin: 0 }}>Aucun bulletin de paie disponible</p>
                <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", margin: "0.5rem 0 0" }}>
                  Vos bulletins apparaîtront ici une fois générés.
                </p>
              </div>
            ) : fiches.map((f, i) => (
              <div
                key={f.ficheId}
                style={{ padding: "0.875rem 1rem", borderBottom: i < fiches.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.375rem" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem", fontFamily: "var(--font-display)" }}>
                      {formatPeriode(f.periode)}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                      Généré le {new Date(f.date_generation).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.9375rem" }}>
                    {fmt(f.salaire_net)} FCFA
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                    {f.nb_jours_absence > 0 && (
                      <span style={{ color: "var(--color-destructive)" }}>−{f.nb_jours_absence}j</span>
                    )}
                    {Number(f.nb_heures_sup) > 0 && (
                      <span style={{ color: "var(--color-success)" }}>+{f.nb_heures_sup}h sup.</span>
                    )}
                  </div>
                  <button
                    onClick={() => setFicheDetail(f)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.3rem 0.625rem", borderRadius: "0.375rem",
                      border: "1px solid var(--color-border)", background: "transparent",
                      cursor: "pointer", fontSize: "0.75rem", color: "var(--color-primary)",
                      fontFamily: "var(--font-display)", fontWeight: 500,
                    }}
                  >
                    Voir plus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Vue tableau desktop ── */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {["Période", "Salaire base", "Absences", "Heures sup", "Salaire net", "Généré le", ""].map((h) => (
                    <th key={h} className="table-header" style={{ padding: "0.75rem 1.25rem", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)" }}>Chargement…</td></tr>
                ) : fiches.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "3rem", textAlign: "center" }}>
                      <Wallet style={{ width: "2rem", height: "2rem", margin: "0 auto 0.75rem", display: "block", color: "var(--color-muted-foreground)" }} />
                      <p style={{ color: "var(--color-muted-foreground)", margin: 0 }}>Aucun bulletin de paie disponible</p>
                      <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.875rem", margin: "0.5rem 0 0" }}>
                        Vos bulletins apparaîtront ici une fois générés.
                      </p>
                    </td>
                  </tr>
                ) : fiches.map((f) => (
                  <tr
                    key={f.ficheId}
                    style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem" }}>
                        {formatPeriode(f.periode)}
                      </span>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{f.periode}</p>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--color-muted-foreground)" }}>
                      {fmt(f.salaire_base)} FCFA
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem" }}>
                      {f.nb_jours_absence > 0 ? (
                        <span style={{ color: "var(--color-destructive)" }}>
                          {f.nb_jours_absence}j (−{fmt(f.deduction_absence)} FCFA)
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem" }}>
                      {Number(f.nb_heures_sup) > 0 ? (
                        <span style={{ color: "var(--color-success)" }}>
                          {f.nb_heures_sup}h (+{fmt(f.montant_heures_sup)} FCFA)
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-primary)", fontSize: "0.9375rem" }}>
                        {fmt(f.salaire_net)} FCFA
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--color-muted-foreground)" }}>
                      {new Date(f.date_generation).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <button
                        onClick={() => setFicheDetail(f)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "0.3rem 0.75rem", borderRadius: "0.375rem",
                          border: "1px solid var(--color-border)", background: "transparent",
                          cursor: "pointer", fontSize: "0.8125rem", color: "var(--color-primary)",
                          fontFamily: "var(--font-display)", fontWeight: 500, whiteSpace: "nowrap",
                        }}
                      >
                        Voir plus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid var(--color-border)", padding: "0.75rem 1.25rem",
          }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-muted-foreground)" }}>
              {total} bulletin{total > 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchFiches(page - 1)}>
                <ChevronLeft style={{ width: "14px", height: "14px" }} />
              </Button>
              <span style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem", color: "var(--color-muted-foreground)" }}>
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchFiches(page + 1)}>
                <ChevronRight style={{ width: "14px", height: "14px" }} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {ficheDetail && (
        <ModalDetail fiche={ficheDetail} onClose={() => setFicheDetail(null)} />
      )}
    </div>
  );
};

export default MesFichesPaie;

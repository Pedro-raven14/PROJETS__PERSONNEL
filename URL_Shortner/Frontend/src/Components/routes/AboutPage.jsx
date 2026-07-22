/* ── À propos ───────────────────────────────────────────────────────────────
   Maquette :
   - Hero : grand bandeau avec gradient bleu→violet (about-hero-bg), titre
     "À propos" en bas à gauche, hauteur ~280px
   - Corps : fond #0d1117, deux paragraphes de texte
   - Trois cartes stat : 2024 / 12k+ / 1.2M avec valeur en gradient
────────────────────────────────────────────────────────────────────────── */

const stats = [
  { value: '2024', label: 'Année de création' },
  { value: '12k+', label: 'Utilisateurs actifs' },
  { value: '1.2M', label: 'Liens raccourcis' },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero bandeau ── */}
      <section
        className="about-hero-bg"
        style={{
          minHeight: 260,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 48px 40px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          À propos
        </h1>
      </section>

      {/* ── Corps ── */}
      <section
        style={{
          background: '#0d1117',
          padding: '64px 48px 80px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p
            style={{
              color: '#cbd5e1',
              fontSize: 16,
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            LinkShort est né d'une idée simple : partager un lien devrait être aussi
            élégant qu'efficace. Nous construisons un outil moderne pour les marketeurs,
            créateurs et professionnels qui veulent des URLs propres, mémorables et
            mesurables.
          </p>
          <p
            style={{
              color: '#94a3b8',
              fontSize: 15,
              lineHeight: 1.8,
              marginBottom: 48,
            }}
          >
            Notre approche mise sur trois piliers : rapidité, clarté et
            confidentialité. Aucune URL ne devrait ralentir votre travail — chaque
            raccourci que vous créez est instantané, fiable et accompagné d'analyses
            détaillées pour comprendre l'engagement de votre audience.
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.value}
                className="card-dark"
                style={{ padding: '28px 20px', textAlign: 'center' }}
              >
                <div
                  className="gradient-text"
                  style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}
                >
                  {s.value}
                </div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { useState, useEffect } from 'react';
import {
  Link2,
  Zap,
  Send,
  Copy,
  Check,
  ArrowRight,
  BarChart2,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { shortenUrl, getStats } from '../../Config/api';

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
function StatCard({ icon, value, label, badge }) {
  return (
    <div className="card-dark p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#34d399',
            background: 'rgba(52,211,153,0.1)',
            borderRadius: 20,
            padding: '3px 8px',
          }}
        >
          {badge}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hero Section  (badge + titre + input + stats)
───────────────────────────────────────────── */
function HeroSection({ stats }) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const data = await shortenUrl(url.trim());
      setResult(data);
      setUrl('');
      toast.success('Lien raccourci avec succès !');
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        "Impossible de raccourcir ce lien. Vérifiez qu'il est valide.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    /*
      La section hero occupe toute la hauteur de l'écran (100svh),
      fond avec le double radial-gradient bleu/violet en haut.
    */
    <section
      className="hero-bg"
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 16px 80px',
        textAlign: 'center',
      }}
    >
      {/* Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999,
          padding: '6px 16px',
          fontSize: 13,
          color: '#94a3b8',
          marginBottom: 28,
        }}
      >
        <Sparkles size={13} color="#38bdf8" />
        Nouveau · Analytics temps réel
      </div>

      {/* Titre */}
      <h1
        style={{
          fontSize: 'clamp(48px, 8vw, 80px)',
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.08,
          marginBottom: 20,
          maxWidth: 720,
        }}
      >
        Raccourcissez vos liens{' '}
        <span className="gradient-text">en un clic</span>
      </h1>

      {/* Sous-titre */}
      <p
        style={{
          fontSize: 18,
          color: '#64748b',
          maxWidth: 520,
          lineHeight: 1.6,
          marginBottom: 48,
        }}
      >
        Transformez vos longues URLs en liens courts, esthétiques et traçables.
      </p>

      {/* Formulaire */}
      <form
        onSubmit={handleShorten}
        style={{
          display: 'flex',
          gap: 8,
          width: '100%',
          maxWidth: 620,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 6,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 10, padding: '0 12px' }}>
          <Link2 size={17} color="#4b5563" style={{ flexShrink: 0 }} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Collez votre long URL ici..."
            required
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: 15,
              padding: '10px 0',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient"
          style={{
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            padding: '12px 22px',
            borderRadius: 12,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <span
              style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }}
            />
          ) : (
            <>
              Raccourcir <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Exemple */}
      <p style={{ fontSize: 13, color: '#4b5563', marginBottom: result ? 0 : 0 }}>
        Exemple :{' '}
        <span style={{ color: '#64748b' }}>https://exemple.com/page-tres-longue</span>{' '}
        → <span style={{ color: '#38bdf8' }}>linkshort.xyz/abc123</span>
      </p>

      {/* Carte résultat */}
      {result && (
        <div
          style={{
            marginTop: 20,
            width: '100%',
            maxWidth: 620,
            background: '#161b27',
            border: '1px solid #1e2a3a',
            borderLeft: '4px solid #10b981',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            textAlign: 'left',
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
              Votre lien raccourci
            </p>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', fontWeight: 600, fontSize: 15, wordBreak: 'break-all' }}
            >
              {result.shortUrl}
            </a>
          </div>
          <CopyToClipboard text={result.shortUrl} onCopy={handleCopy}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid #1e2a3a',
                background: 'transparent',
                color: copied ? '#10b981' : '#94a3b8',
                fontSize: 13,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'color 0.2s',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </CopyToClipboard>
        </div>
      )}

      {/* ── Séparation stats ── */}
      <div style={{ width: '100%', maxWidth: 900, marginTop: 72 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            marginBottom: 8,
          }}
        >
          Suivez vos liens en temps réel
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
          Une vue d'ensemble claire de la performance de vos liens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <StatCard
            icon={<Link2 size={18} color="#fff" />}
            value={stats ? stats.totalLinks.toLocaleString('fr-FR') : '0'}
            label="Liens créés"
            badge="+12%"
          />
          <StatCard
            icon={<MousePointerClick size={18} color="#fff" />}
            value={stats ? stats.totalClicks.toLocaleString('fr-FR') : '0'}
            label="Clics totaux"
            badge="+34%"
          />
          <StatCard
            icon={<BarChart2 size={18} color="#fff" />}
            value={stats ? `${stats.conversionRate}%` : '0%'}
            label="Taux de conversion"
            badge="+2.4%"
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Section "Comment ça fonctionne"
───────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      icon: <Link2 size={22} color="#fff" />,
      title: 'Collez votre lien',
      desc: "Ajoutez n'importe quelle URL longue dans le champ prévu à cet effet.",
    },
    {
      icon: <Zap size={22} color="#fff" />,
      title: 'Générez le lien court',
      desc: 'LinkShort crée instantanément une URL propre et mémorable.',
    },
    {
      icon: <Send size={22} color="#fff" />,
      title: 'Partagez-le',
      desc: 'Diffusez votre lien et suivez ses performances en direct.',
    },
  ];

  return (
    <section
      style={{
        background: '#0d1117',
        padding: '100px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 10,
          }}
        >
          Comment ça fonctionne ?
        </h2>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 56 }}>
          Trois étapes, quelques secondes.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                background: '#161b27',
                border: '1px solid #1e2a3a',
                borderRadius: 16,
                padding: '28px 24px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                }}
              >
                {step.icon}
              </div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                {step.title}
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <>
      {/* CSS keyframe pour le spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <HeroSection stats={stats} />
      <HowItWorksSection />
    </>
  );
}

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-4 py-24 text-center">
      <p
        className="text-8xl font-black mb-4"
        style={{ color: "var(--color-accent)" }}
      >
        404
      </p>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ color: "var(--color-text)" }}
      >
        Page introuvable
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--color-text-muted)" }}>
        La page que tu cherches n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        ← Retour à l'accueil
      </Link>
    </main>
  );
}

import { Link } from "react-router-dom";
import { Globe, ExternalLink, X as IconX } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-16"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            © {year} MyBlog — Écrit avec{" "}
            <span className="text-red-500">♥</span> par Alex Dupont.
          </p>

          {/* Liens */}
          <div className="flex items-center gap-2">
            <Link
              to="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Globe size={18} />
            </Link>
            <Link
              to="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              style={{ color: "var(--color-text-muted)" }}
            >
              <ExternalLink size={18} />
            </Link>
            <Link
              to="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              style={{ color: "var(--color-text-muted)" }}
            >
              <IconX size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useSearchParams } from "react-router-dom";
import { useBlog } from "../../context/BlogContext";
import ArticleCard from "../ui/ArticleCard";

export default function Recherche() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchArticles } = useBlog();
  const results = searchArticles(query);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        Résultats pour "{query}"
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        {results.length} article{results.length !== 1 ? "s" : ""} trouvé
        {results.length !== 1 ? "s" : ""}
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Aucun résultat
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Essaie avec d'autres mots-clés.
          </p>
        </div>
      )}
    </main>
  );
}

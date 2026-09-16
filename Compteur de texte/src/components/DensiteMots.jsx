import { useMemo } from "react";

// Nombre maximum de mots-clés affichés dans le tableau
const MAX_MOTS_AFFICHES = 10;

// Mots vides français à exclure de l'analyse (stop words)
const MOTS_VIDES = new Set([
  "le", "la", "les", "de", "du", "des", "un", "une", "et", "en",
  "à", "au", "aux", "ce", "cet", "cette", "ces", "il", "elle",
  "ils", "elles", "je", "tu", "nous", "vous", "on", "que", "qui",
  "quoi", "dont", "où", "se", "sa", "son", "ses", "mon", "ma",
  "mes", "ton", "ta", "tes", "leur", "leurs", "y", "ne", "pas",
  "plus", "par", "sur", "sous", "dans", "avec", "pour", "est",
  "sont", "être", "avoir", "fait", "tout", "mais", "ou", "si",
  "car", "or", "ni", "car", "très", "bien", "aussi", "comme",
]);

const DensiteMots = ({ texte }) => {
  const topMots = useMemo(() => {
    if (!texte.trim()) return [];

    // On réutilise la même logique de split que Compteurs.jsx
    const mots = texte
      .toLowerCase()
      .split(/[,;:!?.' "/*\-+`|`$%\n]+/)
      .filter((mot) => mot.trim().length > 1 && !MOTS_VIDES.has(mot.trim()));

    if (mots.length === 0) return [];

    // Comptage des occurrences
    const frequence = mots.reduce((acc, mot) => {
      acc[mot] = (acc[mot] || 0) + 1;
      return acc;
    }, {});

    const total = mots.length;

    // Tri décroissant par fréquence, puis par ordre alphabétique à égalité
    return Object.entries(frequence)
      .sort(([a, fa], [b, fb]) => fb - fa || a.localeCompare(b))
      .slice(0, MAX_MOTS_AFFICHES)
      .map(([mot, count]) => ({
        mot,
        count,
        pourcentage: ((count / total) * 100).toFixed(1),
      }));
  }, [texte]);

  if (!texte.trim()) return null;

  return (
    <div className="mt-8 px-35">
      <h2 className="font-bold text-2xl mb-4">Densité de mots-clés</h2>
      {topMots.length === 0 ? (
        <p className="color-gray">Aucun mot significatif détecté.</p>
      ) : (
        <div className="boxi">
          <table className="w-full text-left" aria-label="Tableau de densité des mots-clés">
            <thead>
              <tr className="border-b border-[#272727]">
                <th className="py-2 pr-6 font-bold color-gray text-sm uppercase tracking-wide">
                  Mot
                </th>
                <th className="py-2 pr-6 font-bold color-gray text-sm uppercase tracking-wide">
                  Occurrences
                </th>
                <th className="py-2 font-bold color-gray text-sm uppercase tracking-wide">
                  Densité
                </th>
              </tr>
            </thead>
            <tbody>
              {topMots.map(({ mot, count, pourcentage }) => (
                <tr key={mot} className="border-b border-[#1e1e1e] last:border-0">
                  <td className="py-2 pr-6 font-semibold">{mot}</td>
                  <td className="py-2 pr-6">{count}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      {/* Barre de progression visuelle */}
                      <div className="w-32 h-2 bg-[#272727] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(parseFloat(pourcentage) * 5, 100)}%` }}
                          role="presentation"
                        />
                      </div>
                      <span className="text-sm">{pourcentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DensiteMots;

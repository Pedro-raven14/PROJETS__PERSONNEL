import { useMemo } from "react";

const VITESSE_LECTURE_MPM = 200; // mots par minute, vitesse moyenne adulte

const Compteurs = ({ espace, texte }) => {
  const { sansespace, phrases, mots, paragraphes, tempsLecture } = useMemo(() => {
    const sansespace = texte.replace(/\s/g, "");

    const phrases = texte
      .split(/[.!?]+|\n+/)
      .filter((phrase) => phrase.trim().length > 0);

    // Tiret échappé (\-) pour éviter le range ASCII implicite
    const mots = texte
      .split(/[,;:!?.' "/*\-+`|`$%]+|\n+/)
      .filter((mot) => mot.trim().length > 0);

    // Un paragraphe = bloc de texte séparé par une ou plusieurs lignes vides
    const paragraphes = texte
      .split(/\n{2,}/)
      .filter((p) => p.trim().length > 0);

    // Temps de lecture basé sur le nombre de mots
    const minutesExactes = mots.length / VITESSE_LECTURE_MPM;
    const minutes = Math.floor(minutesExactes);
    const secondes = Math.round((minutesExactes - minutes) * 60);
    const tempsLecture =
      mots.length === 0
        ? "0 sec"
        : minutes > 0
        ? `${minutes} min ${secondes > 0 ? secondes + " sec" : ""}`.trim()
        : `${secondes} sec`;

    return { sansespace, phrases, mots, paragraphes, tempsLecture };
  }, [texte]);

  return (
    <div className="mt-8 px-35">
      {/* Ligne 1 : lettres, mots, phrases */}
      <div className="flex justify-between items-center gap-10">
        <div className="boxi bg-secondary flex-1">
          <p className="font-bold text-4xl">
            {espace
              ? texte.length.toString().padStart(2, "0")
              : sansespace.length.toString().padStart(2, "0")}
          </p>
          <p className="mt-4 font-bold text-3xl">Total de lettres</p>
        </div>
        <div className="boxi bg-warning flex-1">
          <p className="font-bold text-4xl">
            {mots.length.toString().padStart(2, "0")}
          </p>
          <p className="mt-4 font-bold text-3xl">Total de mots</p>
        </div>
        <div className="boxi bg-accent flex-1">
          <p className="font-bold text-4xl">
            {phrases.length.toString().padStart(2, "0")}
          </p>
          <p className="mt-4 font-bold text-3xl">Total de phrases</p>
        </div>
      </div>

      {/* Ligne 2 : paragraphes, temps de lecture */}
      <div className="flex justify-between items-center gap-10 mt-6">
        <div className="boxi bg-info flex-1">
          <p className="font-bold text-4xl">
            {paragraphes.length.toString().padStart(2, "0")}
          </p>
          <p className="mt-4 font-bold text-3xl">Total de paragraphes</p>
        </div>
        <div className="boxi bg-success flex-1">
          <p className="font-bold text-4xl">{tempsLecture}</p>
          <p className="mt-4 font-bold text-3xl">Temps de lecture</p>
        </div>
      </div>
    </div>
  );
};

export default Compteurs;

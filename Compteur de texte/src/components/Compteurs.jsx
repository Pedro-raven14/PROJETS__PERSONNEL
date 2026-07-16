import React from "react";

const Compteurs = ({ espace, texte }) => {
  const sansespace = texte.replace(/\s/g, "");

  const phrases = texte
    .split(/[.!?]+|\n+/)
    .filter((phrase) => phrase.trim().length > 0);

  const mots = texte
    .split(/[,;:!?.' "/*-+`|`$%]+|\n+/)
    .filter((mot) => mot.trim().length > 0);

  return (
    <div className="mt-8 px-35">
      <div className=" flex justify-between items-center gap-10">
        <div className="boxi bg-secondary">
          <p className="font-bold text-4xl">
            {espace
              ? texte.length.toString().padStart(2, "0")
              : sansespace.length.toString().padStart(2, "0")}{" "}
          </p>
          <p className="mt-4.5 font-bold text-3xl">Total de lettres</p>
        </div>
        <div className="boxi bg-warning">
          <p className="font-bold text-4xl">
            {mots.length.toString().padStart(2, "0")}
          </p>
          <p className="mt-4.5 font-bold text-3xl">Total de mots</p>
        </div>
        <div className="boxi bg-accent">
          <p className="font-bold text-4xl">
            {phrases.length.toString().padStart(2, "0")}
          </p>
          <p className="mt-4.5 font-bold text-3xl">Total de phrases</p>
        </div>
      </div>
    </div>
  );
};

export default Compteurs;

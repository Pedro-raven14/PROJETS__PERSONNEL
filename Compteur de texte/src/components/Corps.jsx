import { useState } from "react";
import Compteurs from "./Compteurs";
import DensiteMots from "./DensiteMots";

const Corps = () => {
  const [texte, setTexte] = useState("");
  const [espace, setEspace] = useState(true);
  const [copie, setCopie] = useState(false);

  const change = () => {
    setEspace(!espace);
  };
  const add = (e) => {
    setTexte(e.target.value);
  };
  const efface = () => {
    setTexte("");
  };
  const copier = async () => {
    if (!texte) return;
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Fallback pour les navigateurs sans API Clipboard
      const el = document.getElementById("textarea-input");
      el.select();
      document.execCommand("copy");
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    }
  };

  return (
    <div>
      <div className="mt-10 px-4">
        <h1 className="text-center font-bold text-2xl sm:text-[40px]">
          Analyse ton texte <br />
          en temps réel.
        </h1>
      </div>
      <div className="px-4">
        {/* Zone textarea + boutons : colonne sur mobile, ligne sur sm+ */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
          <div className="flex-1">
            <label htmlFor="textarea-input" className="sr-only">
              Votre texte à analyser
            </label>
            <textarea
              id="textarea-input"
              value={texte}
              onChange={add}
              rows="6"
              className="box w-full resize-y"
              placeholder="Entrer votre texte ici"
            ></textarea>
          </div>

          {/* Boutons d'action */}
          <div className="flex sm:flex-col flex-row gap-3">
            <button
              onClick={copier}
              disabled={!texte}
              className="boxi btn btn-info text-white font-bold text-[15px] flex-1 sm:flex-none disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Copier le texte dans le presse-papiers"
            >
              {copie ? "✓ Copié !" : "Copier le texte"}
            </button>
            <button
              onClick={efface}
              className="boxi btn btn-error text-white font-bold text-[15px] flex-1 sm:flex-none"
              aria-label="Effacer le texte saisi"
            >
              Effacer le texte
            </button>
          </div>
        </div>

        <div className="mt-2 flex">
          <div className="flex gap-3.5 items-center">
            <input
              type="checkbox"
              id="toggle-espace"
              checked={!espace}
              onChange={change}
            />
            <label htmlFor="toggle-espace" className="font-bold cursor-pointer">
              {espace
                ? "Cocher pour exclure les espaces"
                : "Décocher pour inclure les espaces"}
            </label>
          </div>
        </div>

        <Compteurs espace={espace} texte={texte} />
        <DensiteMots texte={texte} />
      </div>
    </div>
  );
};

export default Corps;

import React, { useState } from "react";
import Compteurs from "./Compteurs";

const Corps = () => {
  const [texte, setTexte] = useState("");
  const [espace, setEspace] = useState(true);
  const change = () => {
    setEspace(!espace);
  };
  const add = (e) => {
    setTexte(e.target.value);
  };
  const efface = () => {
    setTexte("");
  };

  return (
    <div>
      <div className="mt-10">
        <h1 className="text-center font-bold text-[40px]">
          Analise ton texte <br />
          en temps réel.
        </h1>
      </div>
      <div>
        <div className="flex justify-center items-center">
          <div className=" mt-10 flex items-center gap-10  justify-center">
            <textarea
              value={texte}
              onChange={add}
              cols="100"
              rows="6"
              className=" ml-50 box"
              placeholder="Entrer votre texte ici"
            ></textarea>
          </div>
          <div className="ml-10 boxi btn btn-error">
            <p onClick={efface} className="text-white font-bold text-[15px]">
              Effacer le texte
            </p>
          </div>
        </div>

        <div className=" mt-2 flex ml-56">
          <div className="flex gap-3.5">
            <input type="checkbox" onClick={change} />
            <p className="font-bold">
              {espace
                ? " Cocher pour Exclure les espaces"
                : " Décocher pour Inclure les espaces"}
            </p>
          </div>
        </div>
        <div>
          <Compteurs espace={espace} texte={texte} />
        </div>
      </div>
    </div>
  );
};

export default Corps;

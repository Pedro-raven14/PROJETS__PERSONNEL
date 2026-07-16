import { CheckCheck, Smile, SmileIcon } from "lucide-react";
import React, { useState } from "react";

const Input = ({ add }) => {
  const [title, setTitle] = useState("");
  const change = (e) => {
    setTitle(e.target.value);
  };
  const hre = (e) => {
    e.preventDefault();
    if (title.trim()) {
      add(title);
      setTitle("");
    }
  };

  return (
    <div className="box mt-15 mb-5">
      <h2 className="font-bold flex items-center gap-5 ">
        Ajoute une tâche petit
        <Smile size={30} color="green" />
      </h2>
      <form
        className="mt-5 flex justify-between gap-5 items-center"
        action=""
        onSubmit={hre}
      >
        <input
          value={title}
          onChange={change}
          className="input"
          type="text"
          placeholder="Entre ta tâche ici"
        />
        <button className="button-primary" type="submit">
          Ajouter
        </button>
      </form>
    </div>
  );
};

export default Input;

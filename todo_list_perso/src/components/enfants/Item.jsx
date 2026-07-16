import { Delete } from "lucide-react";
import React from "react";

const Item = ({ task, edit, del }) => {
  return (
    <li
      onClick={() => edit(task.id, !task.complete)}
      className={` container `}
    >
      <div className='item'>
        <div className="id idDefault"> {task.id} </div>
        <div className="text-white font-bold ">{task.title} </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          del(task.id);
        }}
        className="button-primary"
      >
        <Delete />
      </button>
    </li>
  );
};

export default Item;

import React from "react";
import Item from "./Item";

const List = ({ tasks, edit, del, incompletetask }) => {
  const list = tasks.map((task) => (
    <Item key={task.id} task={task} edit={edit} del={del} />
  ));
  if (tasks && tasks.length > 0) {
    return (
      <div className="flex flex-col gap-3 box">
        <h2 className="font-bold  ">
          Il te reste encore <span className="important">{incompletetask}</span>{" "}
          tâches à accomplir
        </h2>
        <ul className=" flex flex-col  gap-2.5">{list}</ul>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 box">
      <h2 className="font-bold flex items-center gap-5 justify-center text-accent">
        Génial tu n'as rien a faire !!
      </h2>
    </div>
  );
};

export default List;

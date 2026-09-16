import React, { useState } from "react";
import Header from "./enfants/Header";
import Input from "./enfants/Input";
import List from "./enfants/List";
import Footer from "./enfants/Footer";

const Container = () => {
  const [tasks, setTasks] = useState([]);

  const add = (title) => {
    const newtask = {
      id: tasks.length + 1,
      title: title,
      complete: false,
    };
    setTasks([...tasks, newtask]);
  };

  const edit = (id, completevalue) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, complete: completevalue } : task
      )
    );
  };

  const del = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completetask = tasks.filter((task) => task.complete).length;
  const incompletetask = tasks.length - completetask

  return (
    <main>
      <Header />
      <Input add={add} />
      <List tasks={tasks} edit={edit} del={del} incompletetask={incompletetask} />
      <Footer completetask={completetask} />
    </main>
  );
};

export default Container;

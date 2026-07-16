import React from "react";

const Footer = ({ completetask }) => {
  if (completetask > 0) {
    return (
      <footer className="text-center mt-5">
        Avec moi tu as éliminés {completetask} tâche{completetask > 1 ? 's' : null}
      </footer>
    );
  }

  return <footer className="text-center mt-5">By Pedro AKPAOKA !</footer>;
};

export default Footer;

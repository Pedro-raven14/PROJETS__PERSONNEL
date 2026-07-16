import { Container, Icon } from "lucide-react";
import React from "react";

const Header = () => {
  return (
    <header>
      <div className="flex justify-between">
        <div className="flex items-center justify-center">
          <Container size={55} className="mr-5 ml-[-20px]" />
          <div>
            <h1 className="font-bold ">Personnelle</h1>
            <code className="text-[gray]  ">
                Elimine toutes tes tâches aujourd'hui aussi
            </code>
          </div>
        </div>
        <code className="text-[#0808c5] text-sm hover:underline ">
            Pedro personnellae
        </code>
      </div>
    </header>
  );
};

export default Header;

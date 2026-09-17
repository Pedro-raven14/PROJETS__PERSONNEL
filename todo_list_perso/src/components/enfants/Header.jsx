import { Container, Icon } from "lucide-react";
import React from "react";

const Header = () => {
  return (
    <header>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center">
          <Container size={45} className="mr-3 shrink-0" />
          <div>
            <h1 className="font-bold">Personnelle</h1>
            <code className="text-[gray] text-sm">
              Elimine toutes tes tâches aujourd'hui aussi
            </code>
          </div>
        </div>
        <code className="text-[#0808c5] text-sm hover:underline">
          Pedro personnellae
        </code>
      </div>
    </header>
  );
};

export default Header;

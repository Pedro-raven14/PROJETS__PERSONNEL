import { Construction } from "lucide-react";

const Header = () => {
  return (
    <div>
      <div>
        <div className="flex items-center gap-5">
          <Construction />
          <p className="font-bold text-[25px] font-serif">
            Compteur de lettres
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;

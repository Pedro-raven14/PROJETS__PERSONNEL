import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import SidebarEtudiant from "../../Components/SidebarEtudiant";
import { useResponsive } from "../../../hooks/useResponsive";
import EspacePedagogique from "../Directeur/EspacePedagogique/EspacePedagogique";
import Promotion from "../Directeur/Promotions/Promotion";
import DashboardEtudiants from "./DashboardEtudiant/DashboardEtudiants";
import ProfilEtudiantPage from "./ProfilEtudiant/ProfilEtudiantPage";
import Recherche from "./Recherche/Recherche";
import Equipe from "./Equipe/Equipe";

type EtudiantProps = {
  clearToken?: () => void;
  user?: any;
};

const Etudiant = ({ clearToken}: EtudiantProps) => {
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useResponsive();

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - responsive */}
      <div className={`${isMobile ? '' : 'shrink-0'} ${isMobile ? 'w-0' : 'w-64'} h-screen`}>
        <SidebarEtudiant 
          isOpen={isMobile ? sidebarOpen : true} 
          onClose={closeSidebar} 
        />
      </div>

      {/* Main area: navbar fixed at top of this column, routes scroll in the remaining area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-none">
          <Navbar 
            clearToken={clearToken} 
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
        </div>

        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardEtudiants />} />
            <Route path="espaceP" element={<EspacePedagogique />} />
            <Route path="recherche" element={<Recherche />} />
            <Route path="equipes" element={<Equipe />} />
            <Route path="promotion" element={<Promotion />} />
            <Route path="profile" element={<ProfilEtudiantPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Etudiant
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import SidebarDirecteur from "../../Components/SidebarDirecteur";
import { useResponsive } from "../../../hooks/useResponsive";
import DashboardDireceteur from "./DashboardDirecteur/DashboardDireceteur";
import EspacePedagogique from "./EspacePedagogique/EspacePedagogique";
import Formateur from "./Formateurs/Formateur";
import Etudiant from "./Etudiants/Etudiant";
import Promotion from "./Promotions/Promotion";

type DirecteurProps = {
  clearToken?: () => void;
  user?: any;
};

const Directeur = ({ clearToken }: DirecteurProps) => {
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useResponsive();

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - responsive */}
      <div className={`${isMobile ? '' : 'shrink-0'} ${isMobile ? 'w-0' : 'w-64'} h-screen`}>
        <SidebarDirecteur 
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
            <Route path="dashboard" element={<DashboardDireceteur />} />
            <Route path="espaceP" element={<EspacePedagogique />} />
            <Route path="formateur" element={<Formateur />} />
            <Route path="etudiant" element={<Etudiant />} />
            <Route path="promotion" element={<Promotion />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Directeur
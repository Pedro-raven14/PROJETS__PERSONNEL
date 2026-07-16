import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import SidebarFormateur from "../../Components/SidebarFormateur";
import { useResponsive } from "../../../hooks/useResponsive";
import Promotion from "../Directeur/Promotions/Promotion";
import DashboardFormateur from "./DashboardFormateur/DashboardFormateur";
import EspacePedagogique from "./EspacePedagogique/EspacePedagogique";

type FormateurProps = {
  clearToken?: () => void;
  user?: any;
};

const Formateur = ({ clearToken}: FormateurProps) => {
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useResponsive();
  
  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - responsive */}
      <div className={`${isMobile ? '' : 'shrink-0'} ${isMobile ? 'w-0' : 'w-64'} h-screen`}>
        <SidebarFormateur 
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
            <Route path="dashboard" element={<DashboardFormateur />} />
            <Route path="espaceP" element={<EspacePedagogique/>} />
            <Route path="promotion" element={<Promotion />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Formateur
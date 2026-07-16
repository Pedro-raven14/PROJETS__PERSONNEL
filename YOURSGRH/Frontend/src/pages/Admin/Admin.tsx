import { Route, Routes } from "react-router-dom";
import Admin_layout from "../../components/layout/Admin_layout";
import Dashboard from "./Dashboard/Dashboard";
import Employes from "./Employes/Employes";
import EmployeeProfile from "./Employes/EmployeeProfile";
import Parametres from "./Parametres/Parametres";
import Department from "./Department/Department";
import ConsulterDepartement from "./Department/ConsulterDepartement";
import Contrat from "./Contrat/Contrat";
import Conges from "./Conges/Conges";
import Profil from "./Profil/Profil";
import Notifications from "./Notifications/Notifications";
import Formations from "./Formations/Formations";
import CyclesEvaluation from "./Evaluations/CyclesEvaluation";
import Paie from "./Paie/Paie";
import AnalysesIA from "./AnalysesIA/AnalysesIA";
import Rapports from "./Rapports/Rapports";

type AdminProps = {
  employee: any;
  clearToken: () => void;
};

const Admin = ({ clearToken }: AdminProps) => {
  return (
    <Admin_layout clearToken={clearToken}>
      <Routes>
        {/* Les routes Admin seront ajoutées ici */}
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="dashboard" element={<Dashboard />} /> */}
        <Route path="employees" element={<Employes />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="departments" element={<Department />} />
        <Route path="departments/:id" element={<ConsulterDepartement />} />
        <Route path="contracts" element={<Contrat />} />
        <Route path="leaves" element={<Conges />} />
        <Route path="settings" element={<Parametres />} />
        <Route path="profile" element={<Profil />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="trainings"   element={<Formations />} />
        <Route path="evaluations" element={<CyclesEvaluation />} />
        <Route path="payroll"     element={<Paie />} />
        <Route path="ai"          element={<AnalysesIA />} />
        <Route path="reports"     element={<Rapports />} />
      </Routes>
    </Admin_layout>
  );
};

export default Admin;

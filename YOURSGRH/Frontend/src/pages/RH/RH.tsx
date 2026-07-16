import { Route, Routes } from "react-router-dom";
import RH_layout from "../../components/layout/RH_layout";

import Dashboard        from "./Dashboard/Dashboard";
import Employes         from "./Employes/Employes";
import EmployeeProfile  from "./Employes/EmployeeProfile";
import Department       from "./Department/Department";
import ConsulterDept    from "./Department/ConsulterDepartement";
import Contrat          from "./Contrats/Contrat";
import MesContrats      from "./Contrats/MesContrats";
import Conges           from "./Conges/Conges";
import CyclesEvaluation from "./Evaluations/CyclesEvaluation";
import Formations       from "./Formations/Formations";
import Paie             from "./Paie/Paie";
import Notifications    from "./Notifications/Notifications";
import Parametres       from "./Parametres/Parametres";
import Profil           from "./Profil/Profil";
import AnalysesIA       from "./AnalysesIA/AnalysesIA";
import Rapports         from "./Rapports/Rapports";

type RHProps = {
  employee: any;
  clearToken: () => void;
};

const RH = ({ clearToken }: RHProps) => {
  return (
    <RH_layout clearToken={clearToken}>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="employees"      element={<Employes />} />
        <Route path="employees/:id"  element={<EmployeeProfile />} />
        <Route path="departments"    element={<Department />} />
        <Route path="departments/:id" element={<ConsulterDept />} />
        <Route path="contracts"      element={<Contrat />} />
        <Route path="my-contracts"   element={<MesContrats />} />
        <Route path="leaves"         element={<Conges />} />
        <Route path="evaluations"    element={<CyclesEvaluation />} />
        <Route path="trainings"      element={<Formations />} />
        <Route path="payroll"        element={<Paie />} />
        <Route path="ai"             element={<AnalysesIA />} />
        <Route path="reports"        element={<Rapports />} />
        <Route path="notifications"  element={<Notifications />} />
        <Route path="settings"       element={<Parametres />} />
        <Route path="profile"        element={<Profil />} />
      </Routes>
    </RH_layout>
  );
};

export default RH;

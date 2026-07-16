import { Route, Routes } from "react-router-dom";
import Manager_layout from "../../components/layout/Manager_layout";
import Dashboard from "./Dashboard/Dashboard";
import Notifications from "./Notifications/Notifications";
import Contrats from "./Contrats/Contrats";
import Conges from "./Conges/Conges";
import MonEquipe from "./Equipe/Equipe";
import Formations from "./Formations/Formations";
import ManagerEvaluations from "./Evaluations/Evaluations";
import HeuresSupManager from "./HeuresSup/HeuresSup";
import Profil from "./Profil/Profil";
import Paie from "./Paie/Paie";

type ManagerProps = {
  employee: any;
  clearToken: () => void;
};

const Manager = ({ clearToken }: ManagerProps) => {
  return (
    <Manager_layout clearToken={clearToken}>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="contracts"     element={<Contrats />} />
        <Route path="leaves"        element={<Conges />} />
        <Route path="team"          element={<MonEquipe />} />
        <Route path="trainings"     element={<Formations />} />
        <Route path="evaluations"   element={<ManagerEvaluations />} />
        <Route path="overtime"      element={<HeuresSupManager />} />
        <Route path="profile"       element={<Profil />} />
        <Route path="payroll"       element={<Paie />} />
      </Routes>
    </Manager_layout>
  );
};

export default Manager;

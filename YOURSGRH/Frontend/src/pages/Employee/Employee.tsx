import { Route, Routes } from "react-router-dom";
import Emp_layout from "../../components/layout/Emp_layout";
import Dashboard from "./Dashboard/Dashboard";
import Notifications from "./Notifications/Notifications";
import Contrats from "./Contrats/Contrats";
import Conges from "./Conges/Conges";
import Formations from "./Formations/Formations";
import EmployeeEvaluation from "./Evaluation/Evaluation";
import Profil from "./Profil/Profil";
import MesHeuresSup from "./HeuresSup/HeuresSup";
import MonEquipe from "./Equipe/Equipe";
import Paie from "./Paie/Paie";

type EmployeeProps = {
  employee: any;
  clearToken: () => void;
};

const Employee = ({ clearToken }: EmployeeProps) => {
  return (
    <Emp_layout clearToken={clearToken}>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="contracts"     element={<Contrats />} />
        <Route path="leaves"        element={<Conges />} />
        <Route path="trainings"     element={<Formations />} />
        <Route path="evaluations"   element={<EmployeeEvaluation />} />
        <Route path="profile"       element={<Profil />} />
        <Route path="overtime"      element={<MesHeuresSup />} />
        <Route path="team"          element={<MonEquipe />} />
        <Route path="payroll"       element={<Paie />} />
      </Routes>
    </Emp_layout>
  );
};

export default Employee;

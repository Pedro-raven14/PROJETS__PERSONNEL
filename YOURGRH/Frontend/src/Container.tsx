import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import ChangePassword from "./pages/Connexion/ChangePassword";
import { Login } from "./pages/Connexion/Login";
import Admin from "./pages/Admin/Admin";
import RH from "./pages/RH/RH";
import Manager from "./pages/Manager/Manager";
import Employee from "./pages/Employee/Employee";

// --- Helpers localStorage ---

const getToken = (): string | null => localStorage.getItem("token");

const getEmployee = () => {
  try {
    const raw = localStorage.getItem("employee");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    );
    if (!payload.exp || typeof payload.exp !== 'number') return true;
    return payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

// --- Composant de redirection initiale ---

const RootRedirect = () => {
  const token = getToken();
  const emp   = getEmployee();

  if (!token || !emp || isTokenExpired(token)) return <Navigate to="/login" replace />;
  if (emp.mustChangePassword)  return <Navigate to="/change-password" replace />;
  if (emp.role === "ADMIN")    return <Navigate to="/admin" replace />;
  if (emp.role === "RH")       return <Navigate to="/rh" replace />;
  if (emp.role === "MANAGER")  return <Navigate to="/manager" replace />;
  return <Navigate to="/employee" replace />;
};

// --- Guard de route privée ---

type PrivateRouteProps = {
  children: React.ReactNode;
  role?: string;
};

const PrivateRoute = ({ children, role }: PrivateRouteProps) => {
  const token    = getToken();
  const employee = getEmployee();

  if (!token || !employee || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
    return <Navigate to="/login" replace />;
  }

  if (employee.mustChangePassword && window.location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (role && employee.role !== role.toUpperCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Composant principal ---

const Container = () => {
  const [employee, setEmployee] = useState<any>(() => getEmployee());
  const navigate = useNavigate();

  const setAuth = (token: string, emp: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("employee", JSON.stringify(emp));
    setEmployee(emp);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
    setEmployee(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/"                element={<RootRedirect />} />
      <Route path="/login"           element={<Login setAuth={setAuth} />} />
      <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

      <Route path="/admin/*"    element={<PrivateRoute role="ADMIN">   <Admin    employee={employee} clearToken={clearAuth} /></PrivateRoute>} />
      <Route path="/rh/*"       element={<PrivateRoute role="RH">      <RH       employee={employee} clearToken={clearAuth} /></PrivateRoute>} />
      <Route path="/manager/*"  element={<PrivateRoute role="MANAGER"> <Manager  employee={employee} clearToken={clearAuth} /></PrivateRoute>} />
      <Route path="/employee/*" element={<PrivateRoute role="EMPLOYEE"><Employee employee={employee} clearToken={clearAuth} /></PrivateRoute>} />
    </Routes>
  );
};

export default Container;

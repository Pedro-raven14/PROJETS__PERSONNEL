import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./Pages/Connexion/Login";
import Directeur from "./Pages/Directeur/Directeur";
import Formateur from "./Pages/Formateurs/Formateur";
import Etudiant from "./Pages/Etudiants/Etudiant";
import ChangePassword from "./Pages/Connexion/ChangePassword";

const getToken = (): string | null => localStorage.getItem("token");
const setToken = (t: string) => localStorage.setItem("token", t);
const clearToken = () => localStorage.removeItem("token");
const getUser = () => {
    try {
        const token = getToken();
        if (!token) return null;
        return jwtDecode(token as string); // { sub, name   , role }
    } catch {
        return null;
    }
};

type PrivateRouteProps = {
    children: React.ReactNode;
    role?: string;
};

const PrivateRoute = ({ children, role }: PrivateRouteProps) => {
    const user: any = getUser();

    if (!user) return <Navigate to="/login" replace />;

    if (user.mustChangePassword && window.location.pathname !== "/change-password") {
        return <Navigate to="/change-password" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const Container = () => {
    const [user, setUser] = useState<any>(() => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            return jwtDecode(token as string);
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                setUser(jwtDecode(token as string));
            } catch {
                setUser(null);
            }
        }
    }, []);

    return (
        <Routes>
            <Route
                path="/change-password"
                element={
                    <PrivateRoute>
                        <ChangePassword />
                    </PrivateRoute>
                }
            />
            {/* Redirection initiale */}
            <Route
                path="/"
                element={
                    user ? (
                        // @ts-ignore
                        (user.role === "directeur") ? (
                            <Navigate to="/directeur" />
                        ) : (user.role === "formateur") ? (
                            <Navigate to="/formateur" />
                        ) : (
                            <Navigate to="/etudiant" />
                        )
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
            {/* Page login */}
            <Route path="/login" element={<Login setToken={setToken} />} />

            {/* Dashboards */}
            <Route
                path="/directeur/*"
                element={
                    <PrivateRoute role="directeur">
                        <Directeur user={user} clearToken={clearToken} />
                    </PrivateRoute>
                }
            />

            <Route
                path="/formateur/*"
                element={
                    <PrivateRoute role="formateur">
                        <Formateur user={user} clearToken={clearToken} />
                    </PrivateRoute>
                }
            />

            <Route
                path="/etudiant/*"
                element={
                    <PrivateRoute role="etudiant">
                        <Etudiant clearToken={clearToken} user={user} />
                    </PrivateRoute>
                }
            />
        </Routes>
    )
}

export default Container
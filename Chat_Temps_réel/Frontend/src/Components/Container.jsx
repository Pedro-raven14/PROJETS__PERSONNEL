import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Room from './pages/Room';
import { useAuth } from '../Context/AuthContext';

/*
  ProtectedRoute : composant "gardien".
  Si l'utilisateur n'est pas authentifié (pas de JWT), il est renvoyé au /login.
  Sinon, il voit le composant demandé.
  
  C'est plus propre que de vérifier le JWT dans chaque page.
*/
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/*
  PublicRoute : si l'utilisateur est déjà connecté et essaie d'aller sur /login,
  on le redirige directement vers /chat. Pas besoin de se reconnecter.
*/
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/chat" replace /> : children;
};

const Container = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default Container;

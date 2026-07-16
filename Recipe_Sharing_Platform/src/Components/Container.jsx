import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import Accueil from "./Pages/Accueil";
import RecipesPage from "./Pages/Recipes";
import RecipeDetail from "./Pages/RecipeDetail";
import CreateRecipe from "./Pages/CreateRecipe";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import { useAuth } from "../context/AuthContext";

// Pages qui n'affichent pas le header/footer (plein écran)
const FULLSCREEN_ROUTES = ["/connexion", "/inscription"];

// Route protégée
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/connexion" state={{ from: location }} replace />;
  return children;
}

// Scroll en haut à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function Container() {
  const { pathname } = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ScrollToTop />
      {!isFullscreen && <Header />}

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Accueil />} />
          <Route path="/recettes" element={<RecipesPage />} />
          <Route path="/recettes/:id" element={<RecipeDetail />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/profil/:username" element={<Profile />} />

          {/* Protégées */}
          <Route
            path="/creer-recette"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modifier-recette/:id"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-recettes"
            element={
              <ProtectedRoute>
                <MyRecipesRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoris"
            element={
              <ProtectedRoute>
                <FavoritesRedirect />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
}

// Redirections vers le profil pour les pages "mes recettes" et "favoris"
function MyRecipesRedirect() {
  const { currentUser } = useAuth();
  return <Navigate to={`/profil/${currentUser.username}?tab=recipes`} replace />;
}

function FavoritesRedirect() {
  const { currentUser } = useAuth();
  return <Navigate to={`/profil/${currentUser.username}?tab=favorites`} replace />;
}

import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import Accueil from "./pages/Accueil";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import APropos from "./pages/A_propos";
import ArticleDetail from "./pages/ArticleDetail";
import Recherche from "./pages/Recherche";
import Connexion from "./pages/Connexion";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

// Layout public : header + contenu + footer
function PublicLayout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function Container() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Pages publiques */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Accueil />
          </PublicLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <PublicLayout>
            <Categories />
          </PublicLayout>
        }
      />
      <Route
        path="/categories/:slug"
        element={
          <PublicLayout>
            <CategoryDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/a-propos"
        element={
          <PublicLayout>
            <APropos />
          </PublicLayout>
        }
      />
      <Route
        path="/article/:slug"
        element={
          <PublicLayout>
            <ArticleDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/recherche"
        element={
          <PublicLayout>
            <Recherche />
          </PublicLayout>
        }
      />

      {/* Auth */}
      <Route path="/connexion" element={<Connexion />} />

      {/* Admin (son propre layout) */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
      </Routes>
    </>
  );
}

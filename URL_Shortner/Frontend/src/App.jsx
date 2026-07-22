import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './Components/Layouts/MainLayout';
import HomePage from './Components/routes/HomePage';
import AboutPage from './Components/routes/AboutPage';
import ContactPage from './Components/routes/ContactPage';
import LoginPage from './Components/routes/LoginPage';
import RegisterPage from './Components/routes/RegisterPage';
import NotFoundPage from './Components/routes/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1e293b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
          },
        }}
      />

      <Routes>
        {/* Routes avec Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route index path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

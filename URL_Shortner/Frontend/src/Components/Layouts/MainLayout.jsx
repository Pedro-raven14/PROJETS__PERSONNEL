import { Outlet } from 'react-router-dom';
import Navbar from '../ui/Navbar';
import Footer from '../ui/Footer';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      {/* paddingTop = hauteur navbar fixe (64px) */}
      <main style={{ flex: 1, paddingTop: 64 }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

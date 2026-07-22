import { Link } from 'react-router-dom';
import { Link2, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-3xl btn-gradient flex items-center justify-center mb-8 shadow-2xl">
        <Link2 size={36} className="text-white" />
      </div>
      <h1 className="text-7xl font-black gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">Lien introuvable</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Ce lien n'existe pas ou a peut-être expiré. Vérifiez l'URL ou retournez à
        l'accueil.
      </p>
      <Link
        to="/"
        className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
      >
        <ArrowLeft size={18} />
        Retour à l'accueil
      </Link>
    </section>
  );
}

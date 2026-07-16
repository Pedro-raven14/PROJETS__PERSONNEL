import React, { useState } from 'react';
// import { RefreshCw, Filter } from 'lucide-react';
import KpiCards from './components/KpiCards';
import AlertZone from './components/AlertZone';
import TeamTable from './components/TeamTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import ActionZone from './components/ActionZone';
import RecentHistory from './components/RecentHistory';

const DashboardFormateur: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction de rafraîchissement disponible pour utilisation future
  const _handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // En production, ici on ferait un appel API
    console.log('Actualisation des données...');
  };
  // Éviter l'erreur TypeScript en préfixant avec _
  void _handleRefresh;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Zone haute avec KPI */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord — Formateur SIL_Challenge</h1>
              <p className="text-gray-600">Système d'évaluation par monnaie pédagogique (UATM_Coin)</p>
            </div>
          </div>
          
          <KpiCards key={refreshKey} />
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche (2/3 de largeur) */}
          <div className="lg:col-span-2 space-y-6">
            <AlertZone />
            <TeamTable />
            <AnalyticsCharts />
          </div>
          
          {/* Colonne droite (1/3 de largeur) */}
          <div className="space-y-6">
            <ActionZone />
            <RecentHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFormateur;
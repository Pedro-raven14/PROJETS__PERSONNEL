import React, { useState } from 'react';
import KpiCards from './components/KpiCards';
import ProgressProjectCard from './components/ProgressProjectCard';
import RankingSection from './components/RankingSection';
import RecentActivities from './components/RecentActivities';
import PastProjects from './components/PastProjects';
import BadgesSection from './components/BadgesSection';

const DashboardEtudiants: React.FC = () => {
  const [rankingType, setRankingType] = useState<'individual' | 'team'>('individual');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord — Étudiant</h1>
          <p className="text-gray-600 mb-6">Bienvenue sur la plateforme SIL_Challenge 2025</p>

          {/* KPIs Cards */}
          <KpiCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche: Progression + Activités */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progression + Projet combinés */}
            <ProgressProjectCard />

            {/* Activités récentes */}
            <RecentActivities />

            {/* Projets passés */}
            <PastProjects />

          </div>

          {/* Colonne droite: Classement + Projets passés + Badges */}
          <div className="space-y-6">
            {/* Badges obtenus */}
            <BadgesSection />

            {/* Classement */}
            <RankingSection
              rankingType={rankingType}
              onRankingTypeChange={setRankingType}
            />



          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEtudiants;
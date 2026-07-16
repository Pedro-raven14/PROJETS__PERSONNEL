import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AnalyticsCharts: React.FC = () => {
  const [showAllTeams, setShowAllTeams] = useState(false);

  const teamsData = [
    { name: 'Équipe A', velocity: 22.5, color: 'bg-green-500' },
    { name: 'Équipe B', velocity: 16.2, color: 'bg-yellow-500' },
    { name: 'Équipe C', velocity: 12.8, color: 'bg-red-500' },
    { name: 'Équipe D', velocity: 24.1, color: 'bg-green-500' },
    { name: 'Équipe E', velocity: 18.5, color: 'bg-yellow-500' },
    { name: 'Équipe F', velocity: 21.3, color: 'bg-green-500' },
    { name: 'Équipe G', velocity: 11.2, color: 'bg-red-500' },
    { name: 'Équipe H', velocity: 23.7, color: 'bg-green-500' },
  ];

  const ucDistribution = [
    { label: '0-300 UC', count: 15, color: 'bg-red-100' },
    { label: '301-600 UC', count: 45, color: 'bg-yellow-100' },
    { label: '601-800 UC', count: 28, color: 'bg-blue-100' },
    { label: '801-1000 UC', count: 12, color: 'bg-green-100' },
  ];

  const displayedTeams = showAllTeams ? teamsData : teamsData.slice(0, 6);
  const maxVelocity = Math.max(...teamsData.map(t => t.velocity), 30);
  const maxCount = Math.max(...ucDistribution.map(d => d.count), 50);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Performance & Qualité</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graphique de vélocité */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Vélocité par équipe</h3>
            <button 
              onClick={() => setShowAllTeams(!showAllTeams)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              {showAllTeams ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAllTeams ? 'Voir moins' : 'Voir toutes'}
            </button>
          </div>
          <div className="space-y-4">
            {displayedTeams.map((team, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm truncate">{team.name}</div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${team.color} transition-all duration-500`}
                      style={{ width: `${(team.velocity / maxVelocity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right font-medium">{team.velocity.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution des UC */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Distribution des UC par étudiant</h3>
          <div className="space-y-3">
            {ucDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm">{item.label}</div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color.replace('bg-', 'bg-').replace('-100', '-500')} transition-all duration-500`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 text-right font-medium">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
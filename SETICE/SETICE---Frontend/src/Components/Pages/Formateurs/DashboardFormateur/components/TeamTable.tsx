import React, { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  sprint: number;
  status: 'ok' | 'risk' | 'critical';
  velocity: number;
  collectiveUC: number;
  alerts: number;
  lastActivity: string;
}

const TeamTable: React.FC = () => {
  const [teams] = useState<Team[]>([
    { id: '1', name: 'Équipe A', sprint: 3, status: 'ok', velocity: 22.5, collectiveUC: 185, alerts: 0, lastActivity: 'Aujourd\'hui' },
    { id: '2', name: 'Équipe B', sprint: 3, status: 'risk', velocity: 16.2, collectiveUC: 142, alerts: 1, lastActivity: 'Il y a 1 jour' },
    { id: '3', name: 'Équipe C', sprint: 3, status: 'critical', velocity: 12.8, collectiveUC: 98, alerts: 3, lastActivity: 'Il y a 2 jours' },
    { id: '4', name: 'Équipe D', sprint: 3, status: 'ok', velocity: 24.1, collectiveUC: 210, alerts: 0, lastActivity: 'Aujourd\'hui' },
    { id: '5', name: 'Équipe E', sprint: 3, status: 'risk', velocity: 18.5, collectiveUC: 165, alerts: 2, lastActivity: 'Il y a 1 jour' },
    { id: '6', name: 'Équipe F', sprint: 3, status: 'ok', velocity: 21.3, collectiveUC: 192, alerts: 0, lastActivity: 'Aujourd\'hui' },
    { id: '7', name: 'Équipe G', sprint: 3, status: 'critical', velocity: 11.2, collectiveUC: 87, alerts: 1, lastActivity: 'Il y a 3 jours' },
    { id: '8', name: 'Équipe H', sprint: 3, status: 'ok', velocity: 23.7, collectiveUC: 205, alerts: 0, lastActivity: 'Aujourd\'hui' },
  ]);

  const getStatusColor = (status: Team['status']) => {
    switch (status) {
      case 'ok': return 'bg-green-500';
      case 'risk': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getStatusLabel = (status: Team['status']) => {
    switch (status) {
      case 'ok': return 'OK';
      case 'risk': return 'Risque';
      case 'critical': return 'Critique';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Suivi des équipes</h2>
        <div className="text-sm text-gray-500">
          {teams.filter(t => t.status !== 'ok').length} équipes en difficulté
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Équipe</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Sprint</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">État</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Vélocité</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">UC collectifs</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Alertes</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Dernière activité</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium">{team.name}</td>
                  <td className="py-3 px-4">Sprint {team.sprint}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(team.status)}`}></div>
                      <span>{getStatusLabel(team.status)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{team.velocity.toFixed(1)} SP</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{team.collectiveUC} UC</td>
                  <td className="py-3 px-4">
                    {team.alerts > 0 ? (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        {team.alerts} alerte(s)
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Aucune</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{team.lastActivity}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      Détails →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamTable;
import React from 'react';
import { Eye, CheckCircle, AlertTriangle, Award, Shield, Trophy } from 'lucide-react';

const ActionZone: React.FC = () => {
  const actions = [
    { 
      id: 'examine', 
      label: 'Examiner free-riding', 
      icon: Eye, 
      intent: 'danger' as const,
      onClick: () => alert('Ouverture de l\'examen free-riding...')
    },
    { 
      id: 'validate', 
      label: 'Valider sprint', 
      icon: CheckCircle, 
      intent: 'success' as const,
      onClick: () => alert('Validation du sprint en cours...')
    },
    { 
      id: 'invalidate', 
      label: 'Invalider sprint', 
      icon: AlertTriangle, 
      intent: 'warning' as const,
      onClick: () => alert('Invalidation du sprint...')
    },
    { 
      id: 'badge', 
      label: 'Attribuer badge', 
      icon: Award, 
      intent: 'secondary' as const,
      onClick: () => alert('Ouverture du menu d\'attribution de badges...')
    },
    { 
      id: 'malus', 
      label: 'Appliquer malus', 
      icon: Shield, 
      intent: 'danger' as const,
      onClick: () => alert('Application d\'un malus...')
    },
    { 
      id: 'challenge', 
      label: 'Lancer défi', 
      icon: Trophy, 
      intent: 'primary' as const,
      onClick: () => alert('Lancement d\'un défi collectif...')
    },
  ];

  const intentColors = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-purple-600 hover:bg-purple-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    success: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Actions pédagogiques</h2>
      <p className="text-sm text-gray-600 mb-4">
        Actions contextuelles avec impact pédagogique direct
      </p>
      <div className="grid grid-cols-1 gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${intentColors[action.intent]}`}
            >
              <Icon className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Statistiques rapides */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Statistiques rapides</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">UC moyen/étudiant</span>
            <span className="font-semibold">645 UC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Équipes en difficulté</span>
            <span className="font-semibold text-red-600">5/20</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Free-riding détectés</span>
            <span className="font-semibold text-red-600">3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Badges attribués</span>
            <span className="font-semibold text-purple-600">42</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionZone;
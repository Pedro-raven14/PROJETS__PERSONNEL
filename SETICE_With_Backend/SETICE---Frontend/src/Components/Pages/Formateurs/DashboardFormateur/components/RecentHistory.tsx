import React from 'react';
import { Award, AlertTriangle, CheckCircle, MessageSquare, Clock } from 'lucide-react';

const RecentHistory: React.FC = () => {
  const activities = [
    {
      id: 1,
      icon: Award,
      title: 'Badge "Git Master" attribué',
      description: 'À Étudiant 42 (Équipe C)',
      time: 'Il y a 2h',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 2,
      icon: AlertTriangle,
      title: 'Malus free-riding appliqué',
      description: '-25 UC à 3 étudiants',
      time: 'Il y a 4h',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 3,
      icon: CheckCircle,
      title: 'Sprint 2 validé',
      description: 'Pour 18 équipes',
      time: 'Il y a 1j',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 4,
      icon: MessageSquare,
      title: 'Message pédagogique publié',
      description: 'Rappel standards de code',
      time: 'Il y a 1j',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 5,
      icon: Clock,
      title: 'Daily Scrum manqué',
      description: 'Équipe F (3 absences)',
      time: 'Il y a 2j',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Historique récent</h3>
        <span className="text-sm text-gray-500">{activities.length} activités</span>
      </div>
      <div className="space-y-3">
        {activities.map(activity => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg transition-all hover:shadow-sm"
              style={{ backgroundColor: activity.bgColor.replace('bg-', '') === 'purple-50' ? '#faf5ff' : '' }}
            >
              <Icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentHistory;
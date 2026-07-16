import React from 'react';
import { Activity, CheckCircle, AlertCircle, BarChart3, Award } from 'lucide-react';

const RecentActivities: React.FC = () => {
  const activities = [
    { id: '1', type: 'success' as const, text: 'Votre équipe a validé le Sprint 1', time: '2h', points: 40 },
    { id: '2', type: 'reward' as const, text: 'Badge "Git Master" obtenu', time: '4h', points: 10 },
    { id: '3', type: 'warning' as const, text: 'Build failed sur la branche main (PR #45)', time: '6h' },
    { id: '4', type: 'info' as const, text: 'Feedback formateur : "Excellent refactoring API"', time: '1j' },
    { id: '5', type: 'warning' as const, text: 'Daily Scrum manqué', time: '1j', points: -3 },
  ];

  const iconConfig = {
    success: { Icon: CheckCircle, color: 'text-green-500 bg-green-50 border border-green-100' },
    warning: { Icon: AlertCircle, color: 'text-red-500 bg-red-50 border border-red-100' },
    info: { Icon: BarChart3, color: 'text-blue-500 bg-blue-50 border border-blue-100' },
    reward: { Icon: Award, color: 'text-amber-500 bg-amber-50 border border-amber-100' },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-600" />
        Activités récentes
      </h2>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const { Icon, color } = iconConfig[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">{activity.text}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                  {activity.points && (
                    <span className={`text-xs font-medium ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.points > 0 ? '+' : ''}{activity.points} UC
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivities;
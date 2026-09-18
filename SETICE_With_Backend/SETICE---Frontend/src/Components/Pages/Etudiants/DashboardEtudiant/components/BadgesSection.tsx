import React from 'react';
import { Award } from 'lucide-react';

const BadgesSection: React.FC = () => {
  const badges = [
    { id: '1', name: 'Git Master', color: 'bg-purple-100 text-purple-800 border border-purple-200' },
    { id: '2', name: 'Security Hero', color: 'bg-red-100 text-red-800 border border-red-200' },
    { id: '3', name: 'Performance', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Award className="w-5 h-5 mr-2 text-amber-600" />
        Badges obtenus
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge.id} className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${badge.color}`}>
            <Award className="w-3 h-3 mr-1.5" />
            {badge.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BadgesSection;
import React from 'react';
import { Clock } from 'lucide-react';

const PastProjects: React.FC = () => {
  const projects = [
    { name: 'Introduction DevOps', note: 16, badge: 'Excellence' },
    { name: 'API Design Challenge', note: 14, badge: ' Bon' },
    { name: 'Refactoring Legacy', note: 11, badge: 'Moyen' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-gray-600" />
        Projets passés
      </h2>
      
      <div className="space-y-3">
        {projects.map((project, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{project.name}</div>
              <div className="text-sm text-gray-500">Note: {project.note}/20</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium">{project.badge}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
        Voir tous les projets
      </button>
    </div>
  );
};

export default PastProjects;
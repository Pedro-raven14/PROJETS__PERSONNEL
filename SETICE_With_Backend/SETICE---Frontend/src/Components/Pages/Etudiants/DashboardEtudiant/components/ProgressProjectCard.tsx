import React from 'react';
import { Activity, Rocket, Calendar, Code, Database, Cpu, GitBranch, AlertCircle } from 'lucide-react';

const ProgressProjectCard: React.FC = () => {
  const project = {
    name: 'Plateforme SIL_Challenge',
    status: 'delayed' as const,
    stack: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    teamName: 'Les React Masters',
    currentSprint: 2,
    totalSprints: 8,
    progress: 65,
    tasksCompleted: 8,
    tasksTotal: 12,
    deadline: '2024-03-28',
    delayedTasks: 2,
    velocityPersonal: 18,
    velocityTeam: 25,
  };

  const daysUntilDeadline = Math.ceil(
    (new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const StatusBadge = ({ status }: { status: typeof project.status }) => {
    const config = {
      'on-track': { label: 'EN COURS', color: 'bg-green-100 text-green-800 border border-green-200' },
      'delayed': { label: 'EN RETARD', color: 'bg-red-100 text-red-800 border border-red-200' },
      'validated': { label: 'VALIDÉ', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
    };
    const { label, color } = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {status === 'delayed' && <AlertCircle className="w-3 h-3 mr-1" />}
        {label}
      </span>
    );
  };

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-linear-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const getTechIcon = (tech: string) => {
    switch(tech) {
      case 'React': return <Code className="w-3 h-3 mr-1" />;
      case 'PostgreSQL': return <Database className="w-3 h-3 mr-1" />;
      case 'Node.js': return <Cpu className="w-3 h-3 mr-1" />;
      case 'Docker': return <GitBranch className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonne gauche: Progression globale */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Progression globale
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Avancement du cours</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <ProgressBar progress={project.progress} />
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Tâches ce sprint', value: `${project.tasksCompleted}/${project.tasksTotal}`, badge: project.delayedTasks > 0 ? `${project.delayedTasks} retard` : null },
              { label: 'Deadline', value: `${daysUntilDeadline}j`, icon: <Calendar className="w-4 h-4 text-gray-400 mr-2" /> },
              { label: 'Vélocité perso', value: `${project.velocityPersonal} SP` },
              { label: 'Vélocité équipe', value: `${project.velocityTeam} SP`, isTeam: true },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{item.label}</div>
                <div className="flex items-center">
                  {item.icon}
                  <div className={`text-lg font-bold ${item.isTeam ? 'text-green-700' : 'text-gray-900'}`}>
                    {item.value}
                  </div>
                  {item.badge && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Colonne droite: Projet en cours */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-blue-600" />
              Projet en cours
            </h2>
            <StatusBadge status={project.status} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">{project.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.stack.map((tech, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {getTechIcon(tech)}
                {tech}
              </span>
            ))}
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Équipe</span>
              <span className="font-medium text-gray-900">{project.teamName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sprint</span>
              <span className="font-medium text-gray-900">
                {project.currentSprint}/{project.totalSprints}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Workspace
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Soumettre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressProjectCard;
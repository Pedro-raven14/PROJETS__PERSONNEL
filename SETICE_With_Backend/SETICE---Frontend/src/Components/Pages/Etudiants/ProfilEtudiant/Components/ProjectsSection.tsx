import React from 'react';
import { ExternalLink, Github, Star, Users } from 'lucide-react';

const ProjectsSection: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: "Data Analytics Dashboard",
      description: "Une application web responsive pour visualiser des ensembles de données complexes avec des graphiques interactifs et des rapports en temps réel.",
      technologies: ["React", "D3.js", "Node.js", "Express", "MongoDB"],
      githubUrl: "https://github.com/oliviachen/analytics-dashboard",
      demoUrl: "https://analytics-demo.oliviachen.dev",
      stars: 42,
      teamSize: 3,
      status: "Completed"
    },
    {
      id: 2,
      title: "Project Management Tool",
      description: "Application de gestion de tâches de style Kanban conçue pour les équipes agiles pour suivre la progression et collaborer efficacement.",
      technologies: ["Vue.js", "Firebase", "Tailwind CSS", "Vuex"],
      githubUrl: "https://github.com/oliviachen/project-kanban",
      demoUrl: "https://kanban-demo.oliviachen.dev",
      stars: 28,
      teamSize: 4,
      status: "In Progress"
    },
    {
      id: 3,
      title: "E-commerce Platform",
      description: "Plateforme de commerce électronique complète avec système de paiement, gestion d'inventaire et tableau de bord administrateur.",
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Prisma"],
      githubUrl: "https://github.com/oliviachen/ecommerce-platform",
      demoUrl: "https://ecommerce.oliviachen.dev",
      stars: 65,
      teamSize: 5,
      status: "Completed"
    },
    {
      id: 4,
      title: "Health Tracking App",
      description: "Application mobile pour le suivi de la santé avec intégration d'appareils IoT et tableau de bord de visualisation des données.",
      technologies: ["React Native", "Firebase", "Chart.js", "Redux"],
      githubUrl: "https://github.com/oliviachen/health-tracker",
      demoUrl: null,
      stars: 19,
      teamSize: 2,
      status: "Planning"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projets Récents</h2>
          <p className="text-gray-600">Contributions et réalisations principales</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors">
          <span>Voir tous les projets</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900">{project.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status === 'Completed' ? 'Terminé' : 
                 project.status === 'In Progress' ? 'En cours' : 'Planification'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.teamSize} membres</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
                {project.demoUrl && (
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
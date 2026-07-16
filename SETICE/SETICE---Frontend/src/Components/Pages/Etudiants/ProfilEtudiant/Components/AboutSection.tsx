import React from 'react';
import { Code, Users, Target, Mail } from 'lucide-react';

interface AboutSectionProps {
  etudiant: any;
}

const AboutSection: React.FC<AboutSectionProps> = ({ etudiant }) => {
  const interests = [
    "Web Development",
    "Cloud Architecture",
    "UI/UX Design",
    "Agile Methodologies",
    "Open Source",
    "Machine Learning"
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">À Propos de Moi</h2>
        <div className="flex items-center gap-2 text-blue-600">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Voir le CV complet</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          Passionné par le développement Full-Stack avec un penchant pour la création d'expériences utilisateur intuitives et dynamiques. 
          Je m'épanouis en résolvant des problèmes complexes et je me concentre actuellement sur la création d'applications web évolutives 
          avec les frameworks JavaScript modernes. Motivé pour contribuer à des projets innovants et évoluer au sein d'une équipe collaborative.
        </p>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Objectifs actuels</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Maîtriser l'architecture microservices avec Docker et Kubernetes</li>
            <li>Développer une application mobile complète avec React Native</li>
            <li>Contribuer à un projet open-source significatif</li>
            <li>Obtenir la certification AWS Solutions Architect</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Centres d'intérêt</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-900">Contact</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Email académique:</span>
              <span className="text-sm font-medium">{etudiant.utilisateur.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Disponible pour:</span>
              <span className="text-sm font-medium">Stage • Projets collaboratifs • Mentorat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
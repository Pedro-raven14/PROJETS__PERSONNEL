import React from 'react';
import { Code, Database, Palette, Server, Smartphone, Cloud } from 'lucide-react';

interface SkillsSectionProps {
  competences: Array<{
    nom: string;
    niveau: string;
    categorie: string;
  }>;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ competences }) => {
  const categoryIcons: Record<string, any> = {
    frontend: Palette,
    backend: Server,
    database: Database,
    devops: Cloud,
    mobile: Smartphone,
    other: Code
  };

  const getIconForCategory = (category: string) => {
    return categoryIcons[category] || Code;
  };

  // Grouper par catégorie
  const groupedSkills = competences.reduce((acc: any, skill) => {
    if (!acc[skill.categorie]) {
      acc[skill.categorie] = [];
    }
    acc[skill.categorie].push(skill);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Compétences Techniques</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, skills]: [string, any]) => {
          const Icon = getIconForCategory(category);
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
              </div>
              <div className="space-y-3">
                {skills.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{skill.nom}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          skill.niveau === 'Avancé' ? 'bg-green-100 text-green-800' :
                          skill.niveau === 'Intermédiaire' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {skill.niveau}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${
                          skill.niveau === 'Avancé' ? 'bg-green-500 w-4/5' :
                          skill.niveau === 'Intermédiaire' ? 'bg-blue-500 w-3/5' :
                          'bg-yellow-500 w-2/5'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsSection;
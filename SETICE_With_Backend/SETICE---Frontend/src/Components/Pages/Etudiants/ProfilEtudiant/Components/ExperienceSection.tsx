import React from 'react';
import { Briefcase, Calendar, MapPin, Award, BookOpen } from 'lucide-react';

const ExperienceSection: React.FC = () => {
  const experiences = [
    {
      id: 1,
      title: "Développeur Full-Stack Stagiaire",
      company: "TechSolutions Inc.",
      location: "Paris, France",
      period: "Juin 2024 - Août 2024",
      description: "Développement d'une application web de gestion de projets avec React et Node.js. Contribution à l'architecture microservices et optimisation des performances.",
      achievements: [
        "Réduction du temps de chargement de 40%",
        "Implémentation de tests unitaires avec 95% de coverage",
        "Mentorat de 2 développeurs juniors"
      ]
    },
    {
      id: 2,
      title: "Assistant Développeur Web",
      company: "Digital Agency",
      location: "Remote",
      period: "Jan 2024 - Mai 2024",
      description: "Création de sites web pour divers clients en utilisant WordPress et technologies front-end modernes. Gestion de projets et communication client.",
      achievements: [
        "Développement de 10+ sites web responsive",
        "Formation des clients à l'utilisation des CMS",
        "Optimisation SEO améliorant le classement de 30%"
      ]
    },
    {
      id: 3,
      title: "Freelance Développeur",
      company: "Indépendant",
      location: "Remote",
      period: "2023 - Présent",
      description: "Prestations de développement web pour startups et petites entreprises. Spécialisation en applications React et API REST.",
      achievements: [
        "Développement d'une plateforme e-commerce générant 50k€ de CA",
        "Création d'une application mobile téléchargée 10k+ fois",
        "Consultation technique pour 5+ entreprises"
      ]
    }
  ];

  const education = [
    {
      id: 1,
      degree: "Licence en Génie Logiciel",
      institution: "UATM GASA Formation",
      period: "2023 - 2026",
      description: "Spécialisation en développement web, architecture logicielle et méthodes agiles."
    },
    {
      id: 2,
      degree: "Baccalauréat Scientifique",
      institution: "Lycée Descartes",
      period: "2020 - 2023",
      description: "Option Mathématiques et Sciences de l'Ingénieur."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Expériences professionnelles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Expériences Professionnelles</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Ajouter une expérience
          </button>
        </div>

        <div className="space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                  <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{exp.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{exp.period}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{exp.description}</p>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Réalisations</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Formation</h2>
        
        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu.id} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700 font-medium">{edu.institution}</p>
                <p className="text-gray-500 text-sm mt-1">{edu.period}</p>
                <p className="text-gray-600 mt-2">{edu.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;
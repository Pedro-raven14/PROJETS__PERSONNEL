import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { 
//   Edit2, 
//   Share2, 
//   Award, 
//   TrendingUp, 
//   Users, 
//   Globe, 
//   Github, 
//   Linkedin,
//   MapPin,
//   Calendar,
//   BookOpen,
//   Code,
//   Star,
//   ExternalLink,
//   ChevronRight,
//   Briefcase,
//   FolderGit2,
//   BarChart2,
//   CheckCircle
// } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import ProfileHeader from './Components/ProfileHeader';
import StatsCards from './Components/StatsCards';
import SkillsSection from './Components/SkillsSection';
import AboutSection from './Components/AboutSection';
import ExperienceSection from './Components/ExperienceSection';
import ProjectsSection from './Components/ProjectsSection';
import { Code } from 'lucide-react';


const ProfilEtudiantPage: React.FC = () => {
  const navigate = useNavigate();
  const [etudiant, setEtudiant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  // Mock data - À remplacer par l'API réelle
  const mockEtudiant = {
    id: 1,
    utilisateur: {
      prenom: "Olivia",
      nom: "Chen",
      email: "olivia.chen@edu.uatm.com",
      photo: null
    },
    matricule: "ETD2025001",
    centre: "Centre Principal GASA",
    niveau: "SIL3",
    competences: [
      { nom: "React", niveau: "Avancé", categorie: "frontend" },
      { nom: "Node.js", niveau: "Intermédiaire", categorie: "backend" },
      { nom: "TypeScript", niveau: "Avancé", categorie: "frontend" },
      { nom: "Laravel", niveau: "Intermédiaire", categorie: "backend" },
      { nom: "PostgreSQL", niveau: "Intermédiaire", categorie: "database" },
      { nom: "Docker", niveau: "Débutant", categorie: "devops" },
      { nom: "Flutter", niveau: "Débutant", categorie: "mobile" },
      { nom: "Next.js", niveau: "Avancé", categorie: "frontend" },
    ],
    portfolioUrl: "https://portfolio-olivia-chen.dev",
    githubUrl: "https://github.com/oliviachen",
    promotion: {
      nom: "SIL_Challenge 2025-2026",
      annee: "2025-2026"
    }
  };

  // Stats mockées
  const stats = {
    points: 12500,
    badges: 12,
    ranking: 24,
    totalStudents: 100,
    projectsCompleted: 8,
    sprintsParticipated: 5,
    averageVelocity: 18.5,
    teamContribution: 92
  };

  useEffect(() => {
    // Simuler chargement des données
    setTimeout(() => {
      // Récupérer les infos du token ou de l'API
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setEtudiant({ ...mockEtudiant, utilisateur: { ...mockEtudiant.utilisateur, ...userData } });
        } else if (token) {
          const decoded: any = jwtDecode(token);
          setEtudiant({ 
            ...mockEtudiant, 
            utilisateur: { 
              ...mockEtudiant.utilisateur, 
              prenom: decoded.prenom || "Olivia", 
              nom: decoded.nom || "Chen" 
            } 
          });
        } else {
          setEtudiant(mockEtudiant);
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
        setEtudiant(mockEtudiant);
      }
      setLoading(false);
    }, 500);
  }, []);

  const handleEditProfile = () => {
    navigate('/student/profile/edit');
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${etudiant?.utilisateur.prenom} ${etudiant?.utilisateur.nom}`,
        text: `Découvrez le portfolio de ${etudiant?.utilisateur.prenom} ${etudiant?.utilisateur.nom}, étudiant en Génie Logiciel`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papier !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['about', 'experience', 'projects', 'stacks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'about' && 'À Propos'}
                {tab === 'experience' && 'Expériences'}
                {tab === 'projects' && 'Projets'}
                {tab === 'stacks' && 'Stacks'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Informations statiques */}
          <div className="lg:col-span-1 space-y-6">
            {/* En-tête profil */}
            <ProfileHeader 
              etudiant={etudiant}
              onEdit={handleEditProfile}
              onShare={handleShareProfile}
            />

            {/* Cartes de statistiques */}
            <StatsCards stats={stats} />

            {/* Section compétences */}
            <SkillsSection competences={etudiant.competences} />
          </div>

          {/* Colonne droite - Contenu dynamique par onglet */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'about' && (
              <AboutSection etudiant={etudiant} />
            )}

            {activeTab === 'experience' && (
              <ExperienceSection />
            )}

            {activeTab === 'projects' && (
              <ProjectsSection />
            )}

            {activeTab === 'stacks' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Stacks Techniques</h2>
                    <p className="text-gray-600">Technologies maîtrisées et niveau de compétence</p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Code className="w-5 h-5" />
                    <span className="text-sm font-medium">Voir toutes</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {etudiant.competences.map((skill: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{skill.nom}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          skill.niveau === 'Avancé' ? 'bg-green-100 text-green-800' :
                          skill.niveau === 'Intermédiaire' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {skill.niveau}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          skill.niveau === 'Avancé' ? 'bg-green-500 w-4/5' :
                          skill.niveau === 'Intermédiaire' ? 'bg-blue-500 w-3/5' :
                          'bg-yellow-500 w-2/5'
                        }`}></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 capitalize">
                        {skill.categorie}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilEtudiantPage;
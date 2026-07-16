import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus,  
  X, 
  Search, 
  ChevronRight, 
  Trash2, 
  Mail, 
  Phone 
} from 'lucide-react';

// Définition des types TypeScript
interface TeamMember {
  id: number;
  name: string;
  role: string;
  skills: string[];
  email: string;
  phone: string;
}

interface Team {
  id: number;
  name: string;
  project: string;
  status: 'active' | 'inactive' | 'pending';
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

interface AvailableStudent {
  id: number;
  name: string;
  skills: string[];
  match: number;
}

const Equipe = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string>('');

  // Données initiales - simuleraient un appel API
  const initialTeams: Team[] = [
    {
      id: 1,
      name: 'Web Innovators',
      project: 'Plateforme de e-learning interactive',
      status: 'active',
      members: [
        {
          id: 101,
          name: 'Jean Dupont',
          role: 'Développeur Front-end',
          skills: ['React', 'Node.js', 'Figma', 'Tailwind CSS'],
          email: 'jean.dupont@email.com',
          phone: '+33 6 12 34 56 78'
        },
        {
          id: 102,
          name: 'Marie Curie',
          role: 'Développeur Back-end',
          skills: ['Python', 'Django', 'PostgreSQL'],
          email: 'marie.curie@email.com',
          phone: '+33 6 87 65 43 21'
        }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-03-10'
    },
    {
      id: 2,
      name: 'Data Squad',
      project: 'Analyse de données climatiques',
      status: 'active',
      members: [
        {
          id: 201,
          name: 'Thomas Martin',
          role: 'Data Scientist',
          skills: ['Python', 'Machine Learning', 'TensorFlow'],
          email: 'thomas.martin@email.com',
          phone: '+33 6 23 45 67 89'
        },
        {
          id: 202,
          name: 'Sophie Laurent',
          role: 'Data Analyst',
          skills: ['SQL', 'Tableau', 'Statistics'],
          email: 'sophie.laurent@email.com',
          phone: '+33 6 98 76 54 32'
        }
      ],
      createdAt: '2024-02-01',
      updatedAt: '2024-03-05'
    },
    {
      id: 3,
      name: 'Design Collective',
      project: 'Application mobile santé',
      status: 'inactive',
      members: [
        {
          id: 301,
          name: 'Léa Bernard',
          role: 'UI/UX Designer',
          skills: ['Figma', 'Adobe XD', 'Prototyping'],
          email: 'lea.bernard@email.com',
          phone: '+33 6 45 67 89 01'
        }
      ],
      createdAt: '2024-01-20',
      updatedAt: '2024-02-15'
    },
    {
      id: 4,
      name: 'DevOps Team',
      project: 'Pipeline CI/CD automatisé',
      status: 'pending',
      members: [
        {
          id: 401,
          name: 'Marc Dubois',
          role: 'DevOps Engineer',
          skills: ['Docker', 'Kubernetes', 'AWS'],
          email: 'marc.dubois@email.com',
          phone: '+33 6 56 78 90 12'
        }
      ],
      createdAt: '2024-03-01',
      updatedAt: '2024-03-08'
    }
  ];

  // Simuler le chargement des données depuis une API
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      // Simulation d'un appel API
      setTimeout(() => {
        setTeams(initialTeams);
        if (initialTeams.length > 0) {
          setSelectedTeam(initialTeams[0]);
        }
        setLoading(false);
      }, 800);
    };

    fetchTeams();
  }, []);

  // Simuler la recherche d'étudiants disponibles pour invitation
  const fetchAvailableStudents = () => {
    // Ces données viendraient normalement d'une API
    const students: AvailableStudent[] = [
      { id: 501, name: 'Paul Martin', skills: ['React', 'TypeScript'], match: 85 },
      { id: 502, name: 'Julie Petit', skills: ['Python', 'FastAPI'], match: 92 },
      { id: 503, name: 'Alexandre Durand', skills: ['DevOps', 'Docker'], match: 76 },
      { id: 504, name: 'Clara Moreau', skills: ['UI/UX', 'Figma'], match: 88 },
      { id: 505, name: 'Nicolas Blanc', skills: ['React Native', 'Firebase'], match: 79 }
    ];
    setAvailableStudents(students);
  };

  // Gérer la sélection d'une équipe
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  // Gérer l'invitation d'un membre
  const handleInviteMember = (studentId: number) => {
    if (!selectedTeam) return;
    
    // Simuler l'envoi d'invitation
    const student = availableStudents.find(s => s.id === studentId);
    if (student) {
      setInviteMessage(`Invitation envoyée à ${student.name}`);
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setInviteMessage('');
        setShowAddMember(false);
      }, 3000);
    }
  };

  // Gérer la suppression d'un membre
  const handleRemoveMember = (memberId: number) => {
    if (!selectedTeam) return;
    
    // Demander confirmation
    if (window.confirm("Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?")) {
      // Simuler la suppression
      const updatedMembers = selectedTeam.members.filter(m => m.id !== memberId);
      const updatedTeam: Team = { ...selectedTeam, members: updatedMembers };
      
      setSelectedTeam(updatedTeam);
      
      // Mettre à jour la liste des équipes
      const updatedTeams = teams.map(team => 
        team.id === updatedTeam.id ? updatedTeam : team
      );
      setTeams(updatedTeams);
    }
  };

  // Filtrer les équipes selon la recherche
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Rendu pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement de vos équipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Équipes</h1>
          <p className="text-gray-600">Gérez vos équipes de projet et leurs membres</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonne de gauche - Liste des équipes */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Barre de recherche */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                  placeholder="Rechercher une équipe..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Liste des équipes */}
              <div className="space-y-4">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <div
                      key={team.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                      onClick={() => handleTeamSelect(team)}
                      onDoubleClick={() => handleTeamSelect(team)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                          <p className="text-gray-600 text-sm truncate">{team.project}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${team.status === 'active' ? 'bg-green-100 text-green-800' : team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {team.status === 'active' ? 'Actif' : team.status === 'pending' ? 'En attente' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          <span>{team.members.length} membre{team.members.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight size={16} className={`${selectedTeam?.id === team.id ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune équipe trouvée</p>
                    <p className="text-gray-400 text-sm mt-1">Essayez une autre recherche</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne de droite - Détails de l'équipe sélectionnée */}
          <div className="lg:w-2/3">
            {selectedTeam ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* En-tête de l'équipe */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div>
                    <div className="flex items-center mb-2">
                      <h2 className="text-2xl font-bold text-gray-800 mr-3">{selectedTeam.name}</h2>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${selectedTeam.status === 'active' ? 'bg-green-100 text-green-800' : selectedTeam.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedTeam.status === 'active' ? 'Actif' : selectedTeam.status === 'pending' ? 'En attente' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-gray-600">{selectedTeam.project}</p>
                  </div>
                  
                  <button
                    className="mt-4 md:mt-0 flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    onClick={() => {
                      setShowAddMember(true);
                      fetchAvailableStudents();
                    }}
                  >
                    <UserPlus size={18} className="mr-2" />
                    Inviter un membre
                  </button>
                </div>

                {/* Section Membres */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Membres de l'équipe</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedTeam.members.map(member => (
                      <div key={member.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">{member.name}</h4>
                            <p className="text-gray-600">{member.role}</p>
                          </div>
                          
                          <div className="flex items-center">
                          
                            
                            <button
                              className="ml-3 text-gray-400 hover:text-red-500"
                              onClick={() => handleRemoveMember(member.id)}
                              title="Retirer de l'équipe"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Compétences</h5>
                          <div className="flex flex-wrap gap-2">
                            {member.skills.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Mail size={14} className="mr-1" />
                            {member.email}
                          </span>
                          <span className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            {member.phone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyses de l'équipe */}
                {/* <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Analyse de l'équipe</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-green-700 mb-3 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Forces
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Forte compétence en UI/UX</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Expertise en développement React</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Bonne communication d'équipe</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-amber-700 mb-3 flex items-center">
                        <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                        Points à améliorer
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <X size={16} className="text-amber-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Manque d'expérience en DevOps</span>
                        </li>
                        <li className="flex items-start">
                          <X size={16} className="text-amber-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Tests automatisés à améliorer</span>
                        </li>
                        <li className="flex items-start">
                          <X size={16} className="text-amber-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-gray-700">Documentation technique limitée</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div> */}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-700 mb-3">Aucune équipe sélectionnée</h3>
                <p className="text-gray-500 mb-6">Sélectionnez une équipe dans la liste pour voir ses détails</p>
                <p className="text-gray-400 text-sm">Double-cliquez sur une équipe pour la sélectionner rapidement</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'invitation de membre */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Inviter un membre</h3>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowAddMember(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              {inviteMessage ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
                  {inviteMessage}
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Invitez un nouvel étudiant à rejoindre l'équipe <span className="font-medium">{selectedTeam?.name}</span>
                  </p>
                  
                  <div className="space-y-4">
                    {availableStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-800">{student.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.skills.map((skill, index) => (
                              <span key={index} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-3">Match: {student.match}%</span>
                          <button
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            onClick={() => handleInviteMember(student.id)}
                          >
                            Inviter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Vous pouvez aussi inviter un étudiant en partageant ce lien d'invitation:
                    </p>
                    <div className="flex mt-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://projet.com/join/${selectedTeam?.id}`}
                        className="grow px-3 py-2 border border-gray-300 rounded-l-lg text-sm"
                      />
                      <button 
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-r-lg hover:bg-gray-200"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://projet.com/join/${selectedTeam?.id}`);
                          alert('Lien copié dans le presse-papier !');
                        }}
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowAddMember(false)}
              >
                {inviteMessage ? 'Fermer' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipe;
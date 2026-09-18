import { useState, useEffect } from 'react';
import { Search, Users, User, Filter, X, ChevronDown } from 'lucide-react';

const Recherche = () => {
  const [searchType, setSearchType] = useState('students'); // 'students' ou 'teams'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stack: '',
    level: '',
    center: ''
  });

  // Données des étudiants
  const [students] = useState([
    {
      id: 1,
      name: "Élise Durand",
      program: "L3 Informatique",
      matchPercentage: 85,
      skills: ["React", "Node.js", "Figma", "Tailwind CSS"],
      center: "Paris",
      level: "L3"
    },
    {
      id: 2,
      name: "Lucas Martin",
      program: "M1 Développement Web",
      matchPercentage: 70,
      skills: ["Laravel", "Vue.js", "PHP", "MySQL"],
      center: "Lyon",
      level: "M1"
    },
    {
      id: 3,
      name: "Camille Bernard",
      program: "L2 Design",
      matchPercentage: 92,
      skills: ["Figma", "Adobe XD", "UI/UX", "Sketch"],
      center: "Paris",
      level: "L2"
    },
    {
      id: 4,
      name: "Thomas Petit",
      program: "M2 Data Science",
      matchPercentage: 65,
      skills: ["Python", "SQL", "TensorFlow", "PyTorch"],
      center: "Lille",
      level: "M2"
    }
  ]);

  // Données des équipes
  const [teams] = useState([
    {
      id: 1,
      name: "Web Innovators",
      project: "Plateforme de e-learning",
      members: 3,
      neededSkills: ["React", "Node.js", "MongoDB"],
      center: "Paris",
      lookingFor: "Frontend Developer"
    },
    {
      id: 2,
      name: "Data Squad",
      project: "Analyse de données climatiques",
      members: 4,
      neededSkills: ["Python", "Data Visualization", "Machine Learning"],
      center: "Lyon",
      lookingFor: "Data Scientist"
    },
    {
      id: 3,
      name: "Design Collective",
      project: "Application mobile santé",
      members: 2,
      neededSkills: ["Figma", "UI/UX", "Prototyping"],
      center: "Paris",
      lookingFor: "UI Designer"
    }
  ]);

  // Filtrage des résultats
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [filteredTeams, setFilteredTeams] = useState(teams);

  useEffect(() => {
    // Filtrer les étudiants
    let filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStack = !filters.stack || student.skills.some(skill => 
        skill.toLowerCase().includes(filters.stack.toLowerCase())
      );
      
      const matchesLevel = !filters.level || student.level === filters.level;
      const matchesCenter = !filters.center || student.center === filters.center;
      
      return matchesSearch && matchesStack && matchesLevel && matchesCenter;
    });
    
    setFilteredStudents(filtered);
    
    // Filtrer les équipes
    let filteredTeamsResult = teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.neededSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStack = !filters.stack || team.neededSkills.some(skill => 
        skill.toLowerCase().includes(filters.stack.toLowerCase())
      );
      
      const matchesCenter = !filters.center || team.center === filters.center;
      
      return matchesSearch && matchesStack && matchesCenter;
    });
    
    setFilteredTeams(filteredTeamsResult);
  }, [searchTerm, filters, students, teams]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      stack: '',
      level: '',
      center: ''
    });
    setSearchTerm('');
  };

  const handleInvite = (id: number, type: string) => {
    alert(`${type === 'student' ? 'Étudiant' : 'Équipe'} avec ID ${id} invité!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Recherche & Matchmaking</h1>
          <p className="text-gray-600">Trouvez des étudiants ou des équipes pour vos projets</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Sélecteur de type de recherche */}
          <div className="flex mb-6">
            <button
              className={`flex items-center justify-center px-6 py-3 rounded-l-lg font-medium ${searchType === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setSearchType('students')}
            >
              <User size={18} className="mr-2" />
              Étudiants
            </button>
            <button
              className={`flex items-center justify-center px-6 py-3 rounded-r-lg font-medium ${searchType === 'teams' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setSearchType('teams')}
            >
              <Users size={18} className="mr-2" />
              Équipes
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
              placeholder={`Rechercher par nom, compétence, projet...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-700">Filtres</h3>
              <button 
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-1" />
                {showFilters ? 'Masquer' : 'Afficher'} les filtres
                <ChevronDown size={16} className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stack</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="React, Python..."
                    value={filters.stack}
                    onChange={(e) => handleFilterChange('stack', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Centre</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={filters.center}
                    onChange={(e) => handleFilterChange('center', e.target.value)}
                  >
                    <option value="">Tous les centres</option>
                    <option value="Paris">Paris</option>
                    <option value="Lyon">Lyon</option>
                    <option value="Lille">Lille</option>
                    <option value="Marseille">Marseille</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Filtres actifs */}
            {(filters.stack || filters.level || filters.center || searchTerm) && (
              <div className="flex items-center flex-wrap gap-2 mt-4">
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Recherche: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-2">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.stack && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Stack: {filters.stack}
                    <button onClick={() => handleFilterChange('stack', '')} className="ml-2">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Niveau: {filters.level}
                    <button onClick={() => handleFilterChange('level', '')} className="ml-2">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.center && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    Centre: {filters.center}
                    <button onClick={() => handleFilterChange('center', '')} className="ml-2">
                      <X size={14} />
                    </button>
                  </span>
                )}
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline ml-2"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {searchType === 'students' ? 'Étudiants' : 'Équipes'} trouvés
                <span className="text-gray-500 text-lg font-normal ml-2">
                  ({searchType === 'students' ? filteredStudents.length : filteredTeams.length} résultat{filteredStudents.length !== 1 ? 's' : ''})
                </span>
              </h2>
            </div>

            {/* Liste des résultats */}
            {searchType === 'students' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <div key={student.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{student.name}</h3>
                            <p className="text-gray-600">{student.program}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50">
                              <span className="font-bold text-blue-700">{student.matchPercentage}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Match</span>
                            <span>{student.matchPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${student.matchPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mb-5">
                          <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Centre: <span className="font-medium">{student.center}</span></span>
                          <span>Niveau: <span className="font-medium">{student.level}</span></span>
                        </div>
                      </div>
                      
                      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                        <button 
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          onClick={() => handleInvite(student.id, 'student')}
                        >
                          Inviter
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Aucun étudiant trouvé</h3>
                    <p className="text-gray-500">Essayez d'ajuster vos filtres pour trouver plus de profils.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <div key={team.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                            <p className="text-gray-600">{team.project}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50">
                              <span className="font-bold text-indigo-700">{team.members} membre{team.members > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-5">
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full mb-2">
                              Recherche: {team.lookingFor}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Compétences recherchées:</h4>
                            <div className="flex flex-wrap gap-2">
                              {team.neededSkills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <span>Centre: <span className="font-medium">{team.center}</span></span>
                        </div>
                      </div>
                      
                      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                        <button 
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                          onClick={() => handleInvite(team.id, 'team')}
                        >
                          Contacter l'équipe
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Users size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune équipe trouvée</h3>
                    <p className="text-gray-500">Essayez d'ajuster vos filtres pour trouver plus d'équipes.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Statistiques de recherche</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <User className="text-blue-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Étudiants disponibles</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="text-indigo-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Équipes actives</p>
                  <p className="text-2xl font-bold text-gray-800">{teams.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Filter className="text-green-600 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Recherches aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-800">42</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recherche
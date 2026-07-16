import React, { useEffect, useState } from 'react';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { Users, ChevronUp, ChevronDown, Minus, Target as TargetIcon } from 'lucide-react';
import { API_URL } from '../../../../../config/api';

interface RankingProps {
  rankingType: 'individual' | 'team';
  onRankingTypeChange: (type: 'individual' | 'team') => void;
}

// Types internes pour ce composant
type Student = {
  id: string;
  name: string;
  rank: number;
  uatmCoins: number;
  evolution: 'up' | 'down' | 'stable';
  evolutionValue: number;
  role: string;
  isCurrent?: boolean;
};

type Team = {
  id: string;
  name: string;
  rank: number;
  uatmCoins: number;
  evolution: 'up' | 'down' | 'stable';
  members: number;
  velocity?: number;
  multiplier: number;
  isCurrent?: boolean;
};


const EvolutionIcon: React.FC<{ type: 'up' | 'down' | 'stable'; value: number }> = ({ type, value }) => {
  if (type === 'up') return (
    <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded">
      <ChevronUp className="w-3 h-3" />
      <span className="text-xs font-medium ml-1">{value}</span>
    </div>
  );
  if (type === 'down') return (
    <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
      <ChevronDown className="w-3 h-3" />
      <span className="text-xs font-medium ml-1">{value}</span>
    </div>
  );
  return (
    <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded">
      <Minus className="w-3 h-3" />
      <span className="text-xs font-medium ml-1">{value}</span>
    </div>
  );
};

const ToggleButton: React.FC<{
  active: 'individual' | 'team';
  onChange: (type: 'individual' | 'team') => void;
}> = ({ active, onChange }) => {
  return (
    <div className="inline-flex bg-gray-50 rounded-lg p-1 border border-gray-200">
      <button
        onClick={() => onChange('individual')}
        className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 ${active === 'individual'
          ? 'bg-white text-blue-700 shadow-sm border border-gray-300'
          : 'text-gray-600 hover:text-gray-900'
          }`}
      >
        <Users className="w-3.5 h-3.5 mr-1.5" />
        Individuel
      </button>

      <button
        onClick={() => onChange('team')}
        className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 ${active === 'team'
          ? 'bg-white text-blue-700 shadow-sm border border-gray-300'
          : 'text-gray-600 hover:text-gray-900'
          }`}
      >

        Équipe
      </button>
    </div>
  );
};

const RankingSection: React.FC<RankingProps> = ({ rankingType, onRankingTypeChange }) => {
  // ==================== DONNÉES MOCKÉES (À REMPLACER PAR API) ====================
  const [individualData, setIndividualData] = useState<Student[]>([]);
  const [teamData, setTeamData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(`${API_URL}/ranking/${rankingType}?espaceId=1`)
      .then(res => res.json())
      .then(data => {
        if (rankingType === 'individual') {
          setIndividualData(data);
        } else {
          setTeamData(data);
        }
      })
      .finally(() => setLoading(false));
  }, [rankingType]);


  // Données actuelles de l'utilisateur/équipe (sera récupéré de la BD)


  const currentStudent = Array.isArray(individualData)
    ? individualData.find(s => s.isCurrent)
    : undefined;
  const currentTeam = Array.isArray(teamData)
    ? teamData.find(t => t.isCurrent)
    : undefined;

  if (rankingType === 'individual' && !currentStudent && !loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Aucun classement individuel disponible
      </div>
    );
  }

  if (rankingType === 'team' && !currentTeam && !loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Aucun classement d’équipe disponible
      </div>
    );
  }
  if (rankingType === 'individual' && !currentStudent) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center text-gray-500">
        Chargement du classement...
      </div>
    );
  }

  if (rankingType === 'team' && !currentTeam) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center text-gray-500">
        Chargement du classement...
      </div>
    );
  }

  // Top 10 individuel (récupéré de la BD)
  const individualRankings = individualData.filter(s => s.rank <= 10)

  // Top 10 équipes (récupéré de la BD)
  const teamRankings = teamData.filter(t => t.rank <= 10);

  // ==================== LOGIQUE ====================

  // Déterminer si l'utilisateur/équipe est dans le top 10
  const isInTop10 = rankingType === 'individual'
    ? (currentStudent?.rank ?? 999) <= 10
    : (currentTeam?.rank ?? 999) <= 10;

  // Récupérer le top 10 selon le type
  const top10Data = rankingType === 'individual' ? individualRankings : teamRankings;

  // Calculer les données à afficher
  let displayData = [...top10Data];

  if (!isInTop10) {
    // Si hors top 10, ajouter la ligne de l'utilisateur/équipe en dernier
    const currentData = rankingType === 'individual' ? currentStudent : currentTeam;
    if (!isInTop10 && currentData) {
      displayData = [...top10Data, currentData];
    }
  }

  // Calculer combien de points manquent pour entrer dans le top 10
  const getPointsToTop10 = () => {
    if (rankingType === 'individual') {
      if (!currentStudent) return 0;
      if (isInTop10) return 0;
      if (individualRankings.length < 10) return 0;

      const lastInTop10 = individualRankings[9].uatmCoins;
      return lastInTop10 - currentStudent.uatmCoins + 1;
    } else {
      if (!currentTeam) return 0;
      if (isInTop10) return 0;
      if (teamRankings.length < 10) return 0;

      const lastInTop10 = teamRankings[9].uatmCoins;
      return lastInTop10 - currentTeam.uatmCoins + 1;
    }
  };


  const pointsToTop10 = getPointsToTop10();
  const currentData = rankingType === 'individual' ? currentStudent : currentTeam;

  // ==================== CONFIGURATION DES COLONNES ====================

  const individualColumns: TableColumn<Student>[] = [
    {
      name: 'RANG',
      selector: (row) => row.rank,
      sortable: true,
      width: '70px',
      cell: (row) => {
        const isCurrentUser = row.id === currentStudent?.id;
        return (
          <div className="flex items-center justify-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${isCurrentUser
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}>
              #{row.rank}
            </div>
          </div>
        );
      },
    },
    {
      name: 'ÉTUDIANT',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => {
        const isCurrentUser = row.id === currentStudent?.id;
        return (
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${isCurrentUser
              ? 'bg-linear-to-r from-blue-600 to-cyan-500'
              : 'bg-linear-to-r from-blue-500 to-cyan-400'
              }`}>
              {row.name.charAt(0)}
            </div>
            <div>
              <div className={`font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                {row.name}
                {/* {isCurrentUser && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">VOUS</span>} */}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: 'POINTS',
      selector: (row) => row.uatmCoins,
      sortable: true,
      width: '120px',
      cell: (row) => {
        const isCurrentUser = row.id === currentStudent?.id;
        return (
          <div className={`font-bold ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
            {row.uatmCoins} <span className="text-xs text-gray-500">UC</span>
          </div>
        );
      },
    },
    {
      name: 'VAR.',
      selector: (row) => row.evolutionValue,
      sortable: true,
      width: '80px',
      cell: (row) => <EvolutionIcon type={row.evolution} value={row.evolutionValue} />,
    },
  ];

  const teamColumns: TableColumn<Team>[] = [
    {
      name: 'RANG',
      selector: (row) => row.rank,
      sortable: true,
      width: '70px',
      cell: (row) => {
        const isCurrentTeam = row.id === currentTeam?.id;
        return (
          <div className="flex items-center justify-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${isCurrentTeam
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}>
              #{row.rank}
            </div>
          </div>
        );
      },
    },
    {
      name: 'ÉQUIPE',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => {
        const isCurrentTeam = row.id === currentTeam?.id;
        return (
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${isCurrentTeam
              ? 'bg-gradient-to-r from-purple-600 to-pink-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-400'
              }`}>
              {row.name.charAt(0)}
            </div>
            <div>
              <div className={`font-medium flex flex-col justify-center ${isCurrentTeam ? 'text-purple-700' : 'text-gray-900'}`}>
                {row.name}
                {/* {isCurrentTeam && <span className="ml-2 text-[8px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded">votre équipe</span>} */}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: 'POINTS',
      selector: (row) => row.uatmCoins,
      sortable: true,
      width: '120px',
      cell: (row) => {
        const isCurrentTeam = row.id === currentTeam?.id;
        return (
          <div className={`font-bold ${isCurrentTeam ? 'text-purple-700' : 'text-gray-900'}`}>
            {row.uatmCoins} <span className="text-xs text-gray-500">UC</span>
            <div className="text-xs text-gray-500">×{row.multiplier}</div>
          </div>
        );
      },
    },
    {
      name: 'VAR.',
      selector: (row) => row.evolution,
      sortable: true,
      width: '80px',
      cell: (row) => <EvolutionIcon type={row.evolution} value={1} />,
    },
  ];

  // ==================== STYLES ====================

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">

          Classement {rankingType === 'individual' ? 'Individuel' : 'par Équipe'}
        </h2>
        <ToggleButton active={rankingType} onChange={onRankingTypeChange} />
      </div>

      <div className="mb-4" style={{ minHeight: '500px' }}>
        {loading && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Chargement du classement...
          </div>
        )}

        <DataTable
          columns={rankingType === 'individual' ? individualColumns as any : teamColumns as any}
          data={displayData}
          customStyles={{
            headRow: {
              style: {
                borderTopWidth: '1px',
                borderTopColor: '#e5e7eb',
                borderBottomWidth: '1px',
                borderBottomColor: '#e5e7eb',
                backgroundColor: '#f9fafb',
                minHeight: '45px',
              },
            },
            headCells: {
              style: {
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                paddingLeft: '8px',
                paddingRight: '8px',
              },
            },
            cells: {
              style: {
                fontSize: '0.875rem',
                paddingLeft: '8px',
                paddingRight: '8px',
              },
            },
            rows: {
              style: {
                fontSize: '0.875rem',
                minHeight: '60px',
                '&:not(:last-of-type)': {
                  borderBottomWidth: '1px',
                  borderBottomColor: '#f3f4f6',
                },
                '&:hover': {
                  backgroundColor: '#f8fafc',
                },
              },
            },
          }}
          pagination={false}
          dense
          noHeader
          responsive
        />

        {/* Section objectif */}
        <div className="mt-4 p-4 bg-linear-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <TargetIcon className="w-4 h-4 text-blue-600 mr-2" />
            <div className="text-sm font-medium text-blue-900">
              {isInTop10 ? '🎉 Félicitations !' : '🎯 Objectif'}
            </div>
          </div>

          {isInTop10 ? (
            <div className="text-sm text-blue-700">
              Vous êtes dans le <span className="font-semibold">top 10</span> !
              {rankingType === 'individual'
                ? ` Rang #${currentStudent?.rank} avec ${currentStudent?.uatmCoins} UC`
                : ` Rang #${currentTeam?.rank} avec ${currentTeam?.uatmCoins} UC`
              }
            </div>
          ) : (
            <>
              <div className="text-sm text-blue-700">
                Vous êtes actuellement <span className="font-semibold">#{currentData?.rank}</span>
                avec <span className="font-semibold">{currentData?.uatmCoins} UC</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-blue-800">
                ➡️ Il vous manque <span className="text-blue-900">{pointsToTop10} UC</span> pour entrer dans le top 10
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingSection;
import React from 'react';
import { Target, Trophy, Award, Users } from 'lucide-react';

const KpiCards: React.FC = () => {
  const currentStudent = {
    role: 'Frontend (React)',
    rank: 12,
    uatmCoins: 720,
    teamName: 'Les React Masters'
  };

  const kpis = [
    {
      title: 'Rôle actuel',
      value: currentStudent.role,
      icon: <Target className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-400'
    },
    {
      title: 'Rang actuel',
      value: `${currentStudent.rank}e / 100`,
      icon: <Trophy className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-amber-500 to-orange-400'
    },
    {
      title: 'UATM_Coins',
      value: `${currentStudent.uatmCoins} UC`,
      icon: <Award className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-emerald-500 to-green-400'
    },
    {
      title: 'Équipe',
      value: currentStudent.teamName,
      icon: <Users className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-br from-purple-500 to-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center mr-3`}>
              {kpi.icon}
            </div>
            <div>
              <div className="text-sm text-gray-500">{kpi.title}</div>
              <div className="font-semibold text-gray-900">{kpi.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
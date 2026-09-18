import React from 'react';
import { Award, TrendingUp, Users, BarChart2, CheckCircle, Star } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    points: number;
    badges: number;
    ranking: number;
    totalStudents: number;
    projectsCompleted: number;
    sprintsParticipated: number;
    averageVelocity: number;
    teamContribution: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: Star,
      label: "Points",
      value: stats.points.toLocaleString(),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Award,
      label: "Badges",
      value: stats.badges,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      label: "Classement",
      value: `#${stats.ranking}`,
      sublabel: `sur ${stats.totalStudents}`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: CheckCircle,
      label: "Projets terminés",
      value: stats.projectsCompleted,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: BarChart2,
      label: "Vélocité moyenne",
      value: stats.averageVelocity,
      sublabel: "SP/sprint",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Users,
      label: "Contribution équipe",
      value: `${stats.teamContribution}%`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div 
            key={index} 
            className={`${item.bgColor} rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${item.color.replace('text-', 'bg-')} bg-opacity-20`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
                {item.sublabel && (
                  <div className="text-xs text-gray-500">{item.sublabel}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
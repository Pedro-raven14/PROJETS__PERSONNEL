import React from 'react';
import { Users, Users2, AlertTriangle, Trophy, CheckCircle, Clock } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  unit?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, color, unit = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}{unit}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const KpiCards: React.FC = () => {
  const kpiData = [
    { label: 'Étudiants suivis', value: 100, icon: Users, color: 'blue' as const },
    { label: 'Équipes actives', value: 20, icon: Users2, color: 'green' as const },
    { label: 'Sprints en cours', value: 3, icon: Clock, color: 'purple' as const },
    { label: 'UC distribués', value: 2450, icon: Trophy, color: 'yellow' as const, unit: ' UC' },
    { label: 'Alertes critiques', value: 3, icon: AlertTriangle, color: 'red' as const },
    { label: 'Qualité globale', value: 87, icon: CheckCircle, color: 'green' as const, unit: '%' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default KpiCards;
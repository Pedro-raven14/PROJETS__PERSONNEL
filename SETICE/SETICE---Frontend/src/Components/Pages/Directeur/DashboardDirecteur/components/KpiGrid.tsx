import React from 'react';
import { Users, UserCheck, UserMinus, UserPlus, Calendar, BookOpen } from 'lucide-react';

type KPI = { id: string; label: string; value: number | string; Icon: React.ElementType };

const KPIS: KPI[] = [
  { id: 'total_students', label: 'Total étudiants', value: 1240, Icon: Users },
  { id: 'active_students', label: 'Étudiants actifs', value: 900, Icon: UserCheck },
  { id: 'inactive_students', label: 'Étudiants inactifs', value: 340, Icon: UserMinus },
  { id: 'total_teachers', label: 'Total formateurs', value: 58, Icon: UserPlus },
  { id: 'ongoing_promos', label: 'Promotions en cours', value: 12, Icon: Calendar },
  { id: 'subjects', label: 'Matières', value: 42, Icon: BookOpen },
];

const KpiCard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  <div className="flex items-center gap-3 md:gap-4 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-linear-to-br from-[#4361ee] to-[#4cc9f0] shrink-0">
      <kpi.Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-base md:text-lg font-semibold truncate">{kpi.value}</div>
      <div className="text-xs md:text-sm text-gray-500 truncate">{kpi.label}</div>
    </div>
  </div>
);
const KpiGrid: React.FC = () => {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
      {KPIS.map((k) => (
        <KpiCard key={k.id} kpi={k} />
      ))}
    </div>
  );
};

export default KpiGrid;
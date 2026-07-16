  import React, { useState, useEffect } from 'react';
import HeaderSection from './components/HeaderSection';
import KpiGrid from './components/KpiGrid';
import ChartsSection from './components/ChartsSection';
import RecentActivities from './components/RecentActivities';
import AlertsSection from './components/AlertsSection';
import QuickRecap from './components/QuickRecap';

const DashboardDirecteur: React.FC = () => {
  const [hideScrollbar, setHideScrollbar] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHideScrollbar(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {hideScrollbar && (
        <style>{`#dashboard-scroll::-webkit-scrollbar{display:none} #dashboard-scroll{scrollbar-width:none; -ms-overflow-style:none;}`}</style>
      )}
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        {/* Top fixed area: KPIs + actions (non-scrollable) */}
        <div className="flex-none bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <HeaderSection />
            <KpiGrid />
          </div>
        </div>

        {/* Bottom scrollable area */}
        <div id="dashboard-scroll" className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Left: charts & activities */}
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                <ChartsSection />
                <RecentActivities />
              </div>

              {/* Right: alerts & recap */}
              <aside className="space-y-4 sm:space-y-6">
                <AlertsSection />
                <QuickRecap />
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardDirecteur;
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 // import React, { useEffect, useState } from 'react';
  // import {
  //   Users,
  //   UserCheck,
  //   UserMinus,
  //   UserPlus,
  //   Calendar,
  //   BookOpen,
  //   PlusSquare,
  //   BarChart2,
  //   AlertCircle,
  //   BarChart2Icon,
  // } from 'lucide-react';
  // import { PiClockCounterClockwise } from 'react-icons/pi';

  // type KPI = { id: string; label: string; value: number | string; Icon: React.ElementType };

  // const KPIS: KPI[] = [
  //   { id: 'total_students', label: 'Total étudiants', value: 1240, Icon: Users },
  //   { id: 'active_students', label: 'Étudiants actifs', value: 900, Icon: UserCheck },
  //   { id: 'inactive_students', label: 'Étudiants inactifs', value: 340, Icon: UserMinus },
  //   { id: 'total_teachers', label: 'Total formateurs', value: 58, Icon: UserPlus },
  //   { id: 'ongoing_promos', label: 'Promotions en cours', value: 12, Icon: Calendar },
  //   { id: 'subjects', label: 'Matières', value: 42, Icon: BookOpen },
  // ];

  // const ALERTS = [
  //   { id: 1, text: "Promotion '2025 Printemps' sans formateur assigné" },
  //   { id: 2, text: "Matière 'Maths Avancés' sans cours planifié" },
  // ];

  // const ACTIVITIES = [
  //   { id: 1, text: "John Doe a ajouté l'étudiant Alice Martin", time: '2h' },
  //   { id: 2, text: 'Promotion 2024 clôturée', time: '1j' },
  //   { id: 3, text: 'Cours "Intro React" planifié', time: '2j' },
  //   { id: 4, text: 'Évaluation Q1 publiée', time: '4j' },
  // ];

  // const KpiCard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  //   <div className="flex items-center gap-4 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
  //     <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#4361ee] to-[#4cc9f0]">
  //       <kpi.Icon className="w-6 h-6 text-white" />
  //     </div>
  //     <div className="flex-1">
  //       <div className="text-lg font-semibold">{kpi.value}</div>
  //       <div className="text-sm text-gray-500">{kpi.label}</div>
  //     </div>
  //   </div>
  // );

  // const ActionButton: React.FC<{ label: string; intent?: string; Icon?: React.ElementType }> = ({ label, intent = 'primary', Icon }) => {
  //   const base = 'inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md font-medium';
  //   const variants: Record<string, string> = {
  //     primary: 'bg-blue-600 text-white hover:bg-blue-700',
  //     green: 'bg-green-600 text-white hover:bg-green-700',
  //     indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
  //     yellow: 'bg-yellow-600 text-white hover:bg-yellow-700',
  //   };
  //   const Cls = variants[intent] ?? variants.primary;
  //   return (
  //     <button className={`${base} ${Cls}`}>
  //       {Icon ? <Icon className="w-4 h-4" /> : null}
  //       <span>{label}</span>
  //     </button>
  //   );
  // };

  // const DashboardDireceteur: React.FC = () => {
  //   const [hideScrollbar, setHideScrollbar] = useState(false);

  //   useEffect(() => {
  //     // after 2 seconds hide the scrollbar
  //     const t = setTimeout(() => setHideScrollbar(true), 2000);
  //     return () => clearTimeout(t);
  //   }, []);

  //   return (
  //     <>
  //       {hideScrollbar && (
  //         <style>{`#dashboard-scroll::-webkit-scrollbar{display:none} #dashboard-scroll{scrollbar-width:none; -ms-overflow-style:none;}`}</style>
  //       )}
  //       <div className="min-h-screen flex flex-col overflow-x-hidden">
  //         {/* Top fixed area: KPIs + actions (non-scrollable) */}
  //         <div className="flex-none bg-white border-b border-gray-200">
  //           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  //             <div className="flex items-center justify-between">
  //               <div>
  //                 <h1 className="text-2xl font-semibold">Tableau de bord — Directeur</h1>
  //                 <p className="text-sm text-gray-500">Vue d'ensemble et actions rapides</p>
  //               </div>
  //               <div className="flex items-center gap-2">
  //                 <ActionButton label="Ajouter étudiant" intent="green" Icon={PlusSquare} />
  //                 <ActionButton label="Ajouter formateur" intent="indigo" Icon={UserPlus} />
  //                 <ActionButton label="Créer promotion" intent="primary" Icon={Calendar} />
  //                 <ActionButton label="Planifier cours" intent="yellow" Icon={PiClockCounterClockwise} />
  //               </div>
  //             </div>

  //             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  //               {KPIS.map((k) => (
  //                 <KpiCard key={k.id} kpi={k} />
  //               ))}
  //             </div>
  //           </div>
  //         </div>

  //         {/* Bottom scrollable area */}
  //         <div id="dashboard-scroll" className="flex-1 overflow-auto bg-gray-50">
  //           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  //             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  //               {/* Left: charts (placeholders) */}
  //               <div className="lg:col-span-2 space-y-6">
  //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                   {/* Students per promotion - simple vertical bar chart using KPIS mock values */}
  //                   <div className="bg-white rounded-lg border border-gray-100 p-4 h-60 flex flex-col">
  //                     <div className="flex items-center justify-between mb-3">
  //                       <h3 className="text-md font-medium">Étudiants par promotion</h3>
  //                       <BarChart2 className="w-5 h-5 text-gray-400" />
  //                     </div>
  //                     <div className="flex-1 flex items-center">
  //                       <StudentsByPromoChart kpis={KPIS} />
  //                     </div>
  //                   </div>

  //                   {/* Active vs Inactive - donut chart */}
  //                   <div className="bg-white rounded-lg border border-gray-100 p-4 h-60 flex flex-col">
  //                     <div className="flex items-center justify-between mb-3">
  //                       <h3 className="text-md font-medium">Actifs vs Inactifs</h3>
  //                       <BarChart2 className="w-5 h-5 text-gray-400" />
  //                     </div>
  //                     <div className="flex-1 flex items-center justify-center">
  //                       <ActiveDonut kpis={KPIS} />
  //                     </div>
  //                   </div>
  //                 </div>

  //                 <div className="bg-white rounded-lg border border-gray-100 p-4">
  //                   <h3 className="text-md font-medium mb-3">Activités récentes</h3>
  //                   <ul className="divide-y divide-gray-100">
  //                     {ACTIVITIES.map((a) => (
  //                       <li key={a.id} className="py-3 flex justify-between items-start">
  //                         <div className="text-sm text-gray-700">{a.text}</div>
  //                         <div className="text-xs text-gray-400">{a.time}</div>
  //                       </li>
  //                     ))}
  //                   </ul>
  //                 </div>
  //               </div>

  //               {/* Right: alerts & recap */}
  //               <aside className="space-y-6">
  //                 <div className="bg-white rounded-lg border border-gray-100 p-4">
  //                   <h3 className="text-md font-medium mb-3">Alertes importantes</h3>
  //                   <ul className="space-y-3">
  //                     {ALERTS.map((a) => (
  //                       <li key={a.id} className="flex items-start gap-3">
  //                         <div className="text-red-600 mt-1"><AlertCircle className="w-5 h-5" /></div>
  //                         <div className="text-sm text-gray-700">{a.text}</div>
  //                       </li>
  //                     ))}
  //                   </ul>
  //                 </div>

  //                 <div className="bg-white rounded-lg border border-gray-100 p-4">
  //                   <h3 className="text-md font-medium mb-3">Récap rapide</h3>
  //                   <div className="text-sm text-gray-600">Étudiants actifs: 980</div>
  //                   <div className="text-sm text-gray-600">Formateurs: 58</div>
  //                   <div className="text-sm text-gray-600">Promotions en cours: 12</div>
  //                 </div>
  //               </aside>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   );
  // };

  // export default DashboardDireceteur;

  // // --- Small chart components below (local, use KPIS mock data) ---

  // const StudentsByPromoChart: React.FC<{ kpis: KPI[] }> = ({ kpis }) => {
  //   const [animate, setAnimate] = useState(false);
  //   const total = Number(kpis.find(k => k.id === 'total_students')?.value ?? 0);
  //   const promos = Number(kpis.find(k => k.id === 'ongoing_promos')?.value ?? 3) || 3;
  //   // distribute students roughly evenly across promos
  //   const base = Math.floor(total / promos);
  //   const remainder = total % promos;
  //   const values = Array.from({ length: promos }).map((_, i) => base + (i < remainder ? 1 : 0));
  //   const max = Math.max(...values, 1);

  //   useEffect(() => {
  //     const t = setTimeout(() => setAnimate(true), 60);
  //     return () => clearTimeout(t);
  //   }, []);

  //   return (
  //     <div className="w-full flex items-end gap-3 px-2 h-40">
  //       {values.map((v, i) => (
  //         <div key={i} className="flex-1 flex flex-col items-center">
  //           <div className="w-full h-36 flex items-end">
  //             <div
  //               className="w-full rounded-t-md bg-gradient-to-t from-[#4361ee] to-[#4cc9f0] transition-all duration-800 ease-out"
  //               style={{ height: animate ? `${(v / max) * 100}%` : '2%', transitionDelay: `${i * 120}ms` }}
  //               title={`${v} étudiants`}
  //             />
  //           </div>
  //           <div className="text-xs text-gray-500 mt-2">P{i + 1}</div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  // const ActiveDonut: React.FC<{ kpis: KPI[] }> = ({ kpis }) => {
  //   const [animate, setAnimate] = useState(false);
  //   const active = Number(kpis.find(k => k.id === 'active_students')?.value ?? 0);
  //   const inactive = Number(kpis.find(k => k.id === 'inactive_students')?.value ?? 0);
  //   const total = Math.max(active + inactive, 1);
  //   const activePct = (active / total) * 100;

  //   // donut SVG
  //   const size = 120;
  //   const stroke = 16;
  //   const radius = (size - stroke) / 2;
  //   const circumference = 2 * Math.PI * radius;
  //   const dash = (active / total) * circumference;
  //   const targetOffset = circumference - dash;

  //   useEffect(() => {
  //     const promos = Number(kpis.find(k => k.id === 'ongoing_promos')?.value ?? 3) || 3;
  //     const delay = Math.max(200, promos * 120 + 80);
  //     const t = setTimeout(() => setAnimate(true), delay);
  //     return () => clearTimeout(t);
  //   }, []);

  //   return (
  //     <div className="flex items-center gap-6">
  //       <svg width={size} height={size}>
  //         <g transform={`translate(${size / 2}, ${size / 2})`}>
  //           <circle r={radius} fill="none" stroke="#e6edf8" strokeWidth={stroke} />
  //           <circle
  //             r={radius}
  //             fill="none"
  //             stroke="#4361ee"
  //             strokeWidth={stroke}
  //             strokeLinecap="round"
  //             strokeDasharray={circumference}
  //             strokeDashoffset={animate ? targetOffset : circumference}
  //             style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
  //             transform={`rotate(-90)`}
  //           />
  //           <text x="0" y="4" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-700" style={{ fontSize: 14 }}>
  //             {Math.round(activePct)}%
  //           </text>
  //         </g>
  //       </svg>
  //       <div>
  //         <div className="text-sm font-medium">Actifs</div>
  //         <div className="text-lg font-semibold text-gray-800">{active}</div>
  //         <div className="text-sm text-gray-500">Inactifs: {inactive}</div>
  //       </div>
  //     </div>
  //   );
  // };
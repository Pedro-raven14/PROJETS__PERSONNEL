import React from 'react';

const ACTIVITIES = [
  { id: 1, text: "John Doe a ajouté l'étudiant Alice Martin", time: '2h' },
  { id: 2, text: 'Promotion 2024 clôturée', time: '1j' },
  { id: 3, text: 'Cours "Intro React" planifié', time: '2j' },
  { id: 4, text: 'Évaluation Q1 publiée', time: '4j' },
];

const RecentActivities: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-md font-medium mb-3">Activités récentes</h3>
      <ul className="divide-y divide-gray-100">
        {ACTIVITIES.map((a) => (
          <li key={a.id} className="py-3 flex justify-between items-start">
            <div className="text-sm text-gray-700">{a.text}</div>
            <div className="text-xs text-gray-400">{a.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivities;
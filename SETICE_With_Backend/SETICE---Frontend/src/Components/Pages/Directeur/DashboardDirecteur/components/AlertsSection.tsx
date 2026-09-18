import React from 'react';
import { AlertCircle } from 'lucide-react';

const ALERTS = [
  { id: 1, text: "Promotion '2025 Printemps' sans formateur assigné" },
  { id: 2, text: "Matière 'Maths Avancés' sans cours planifié" },
];

const AlertsSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-md font-medium mb-3">Alertes importantes</h3>
      <ul className="space-y-3">
        {ALERTS.map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <div className="text-red-600 mt-1"><AlertCircle className="w-5 h-5" /></div>
            <div className="text-sm text-gray-700">{a.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertsSection;
import React from 'react';

const QuickRecap: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-md font-medium mb-3">Récap rapide</h3>
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Étudiants actifs: 980</div>
        <div className="text-sm text-gray-600">Formateurs: 58</div>
        <div className="text-sm text-gray-600">Promotions en cours: 12</div>
        <div className="text-sm text-gray-600">Matières: 42</div>
      </div>
    </div>
  );
};

export default QuickRecap;
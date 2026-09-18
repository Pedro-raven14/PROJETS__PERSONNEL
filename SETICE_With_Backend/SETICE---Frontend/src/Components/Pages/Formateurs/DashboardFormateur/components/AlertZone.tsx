import React from 'react';
import { Users, Activity, TrendingUp, Bug, BookOpen, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'free_riding' | 'no_pr' | 'low_velocity' | 'failed_tests' | 'no_docs';
  title: string;
  description: string;
  teamId?: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

const AlertZone: React.FC = () => {
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'free_riding',
      title: 'Free-riding détecté',
      description: '3 étudiants ont contribué moins de 20% de la moyenne équipe',
      teamId: 'Équipe C',
      severity: 'high',
      timestamp: '2025-12-30T10:30:00Z',
    },
    {
      id: '2',
      type: 'no_pr',
      title: 'Équipe sans PR',
      description: 'Aucune Pull Request depuis 5 jours',
      teamId: 'Équipe G',
      severity: 'medium',
      timestamp: '2025-12-29T14:20:00Z',
    },
    {
      id: '3',
      type: 'low_velocity',
      title: 'Sprint à risque',
      description: 'Vélocité < 15 SP pour le sprint actuel',
      teamId: 'Équipe L',
      severity: 'medium',
      timestamp: '2025-12-30T09:15:00Z',
    },
    {
      id: '4',
      type: 'failed_tests',
      title: 'Tests d’intégration échoués',
      description: '2 équipes ont des tests d’intégration en échec',
      teamId: 'Équipe E',
      severity: 'high',
      timestamp: '2025-12-30T16:45:00Z',
    },
  ];

  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      free_riding: Users,
      no_pr: Activity,
      low_velocity: TrendingUp,
      failed_tests: Bug,
      no_docs: BookOpen,
    };
    return icons[type];
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    return severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'blue';
  };

  const unresolvedAlerts = alerts.filter(a => !a.timestamp.includes('resolved'));
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'high');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Alertes pédagogiques intelligentes</h2>
        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
          {criticalAlerts.length} critiques
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map(alert => {
          const Icon = getAlertIcon(alert.type);
          const color = getSeverityColor(alert.severity);
          
          return (
            <div 
              key={alert.id} 
              className={`border-l-4 border-${color}-500 bg-white p-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 text-${color}-600`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    {alert.teamId && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {alert.teamId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        
        {alerts.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700">Aucune alerte en cours</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertZone;
import React, { useState } from 'react';
import { useEmailService } from '../../../../hooks/useEmailService';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';

const TestEmail: React.FC = () => {
  const { sendCredentials, testEmailService, isLoading } = useEmailService();
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [customEmail, setCustomEmail] = useState('');

  const handleTestDefault = async () => {
    const success = await testEmailService();
    setTestResult(success);
  };

  const handleTestCustom = async () => {
    if (!customEmail) {
      alert('Veuillez entrer un email');
      return;
    }

    const credentials = {
      email: customEmail,
      password: 'TestPassword123!',
      nom: 'Test',
      prenom: 'User'
    };

    const success = await sendCredentials(credentials);
    setTestResult(success);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Test EmailJS</h2>
        </div>

        <div className="space-y-6">
          {/* Configuration Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Configuration EmailJS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Service ID:</span>
                <span className={import.meta.env.VITE_EMAILJS_SERVICE_ID ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_EMAILJS_SERVICE_ID ? '✓ Configuré' : '✗ Manquant'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Template ID:</span>
                <span className={import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? '✓ Configuré' : '✗ Manquant'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Public Key:</span>
                <span className={import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '✓ Configuré' : '✗ Manquant'}
                </span>
              </div>
            </div>
          </div>

          {/* Test avec email par défaut */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Test avec email par défaut</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Envoie un email de test à test@example.com (ne sera pas vraiment envoyé)
            </p>
            <button
              onClick={handleTestDefault}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send size={16} />
              )}
              Test par défaut
            </button>
          </div>

          {/* Test avec email personnalisé */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Test avec email personnalisé</h3>
            <div className="space-y-3">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Entrez votre email pour le test"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTestCustom}
                disabled={isLoading || !customEmail}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send size={16} />
                )}
                Envoyer test
              </button>
            </div>
          </div>

          {/* Résultat du test */}
          {testResult !== null && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              testResult ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {testResult ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <XCircle className="text-red-600" size={20} />
              )}
              <span className="font-medium">
                {testResult ? 'Test réussi !' : 'Test échoué - vérifiez la console pour plus de détails'}
              </span>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>1. Créez un compte sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">EmailJS</a></p>
              <p>2. Configurez un service email (Gmail, Outlook, etc.)</p>
              <p>3. Créez un template d'email</p>
              <p>4. Copiez les IDs dans votre fichier .env</p>
              <p>5. Testez la configuration avec ce composant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmail;
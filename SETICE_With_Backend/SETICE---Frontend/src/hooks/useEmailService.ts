import { useState } from 'react';
import { emailService } from '../services/emailService';
import toast from 'react-hot-toast';

interface EmailCredentials {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendCredentials = async (credentials: EmailCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await emailService.sendUserCredentials(credentials);
      
      if (success) {
        toast.success(`Email envoyé à ${credentials.email}`);
      } else {
        toast.error('Erreur lors de l\'envoi de l\'email');
        // Afficher les identifiants dans une notification persistante
        toast.error(
          `Identifiants pour ${credentials.prenom} ${credentials.nom}:\nEmail: ${credentials.email}\nMot de passe: ${credentials.password}`,
          { duration: 10000 }
        );
      }
      
      return success;
    } catch (error) {
      console.error('Erreur useEmailService:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailService = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await emailService.testEmailService();
      
      if (success) {
        toast.success('Test EmailJS réussi');
      } else {
        toast.error('Test EmailJS échoué');
      }
      
      return success;
    } catch (error) {
      console.error('Erreur test EmailJS:', error);
      toast.error('Erreur lors du test EmailJS');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendCredentials,
    testEmailService,
    isLoading
  };
};
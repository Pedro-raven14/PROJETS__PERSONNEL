import emailjs from '@emailjs/browser';

interface EmailCredentials {
  email: string;
  nom: string;
  prenom: string;
  passwordTemp: string;
}

class EmailService {
  private readonly serviceId:  string;
  private readonly templateId: string;
  private readonly publicKey:  string;
  private isInitialized = false;

  constructor() {
    this.serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';

    if (this.publicKey) {
      emailjs.init(this.publicKey);
      this.isInitialized = true;
    }
  }

  async sendUserCredentials(credentials: EmailCredentials): Promise<boolean> {
    if (!this.isInitialized || !this.serviceId || !this.templateId) {
      console.warn('EmailJS non configuré — email non envoyé');
      return false;
    }

    try {
      await emailjs.send(this.serviceId, this.templateId, {
        to_email:      credentials.email,
        to_name:       `${credentials.prenom} ${credentials.nom}`,
        user_email:    credentials.email,
        user_nom:      credentials.nom,
        user_prenom:   credentials.prenom,
        password_temp: credentials.passwordTemp,
        login_url:     window.location.origin + '/login',
      });
      return true;
    } catch (err) {
      console.error('Erreur envoi email EmailJS :', err);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default emailService;

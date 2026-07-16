import emailjs from '@emailjs/browser';

interface EmailCredentials {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;
  private isInitialized: boolean = false;

  constructor() {
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
    
    this.init();
  }

  private init() {
    if (this.publicKey) {
      emailjs.init(this.publicKey);
      this.isInitialized = true;
      console.log('✅ EmailJS initialisé côté frontend');
    } else {
      console.warn('⚠️ EmailJS non configuré - variables d\'environnement manquantes');
    }
  }

  async sendUserCredentials(credentials: EmailCredentials): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('❌ EmailJS non initialisé');
      this.logCredentials(credentials);
      return false;
    }

    if (!this.serviceId || !this.templateId) {
      console.error('❌ Configuration EmailJS incomplète');
      this.logCredentials(credentials);
      return false;
    }

    try {
      const templateParams = {
        to_email: credentials.email,
        to_name: `${credentials.prenom} ${credentials.nom}`,
        user_email: credentials.email,
        user_password: credentials.password,
        user_nom: credentials.nom,
        user_prenom: credentials.prenom,
        login_url: window.location.origin + '/login',
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log(`✅ Email envoyé via EmailJS à ${credentials.email}`);
      console.log(`EmailJS Response: ${response.status} - ${response.text}`);
      
      return true;
      
    } catch (error: any) {
      console.error(`❌ Erreur EmailJS pour ${credentials.email}:`, error);
      
      // Fallback: log des identifiants
      this.logCredentials(credentials);
      
      return false;
    }
  }

  private logCredentials(credentials: EmailCredentials) {
    const loginUrl = window.location.origin + '/login';
    
    console.log('\n' + '='.repeat(70));
    console.log(`📧 EMAILJS FALLBACK - ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));
    console.log(`👤 ÉTUDIANT: ${credentials.prenom} ${credentials.nom}`);
    console.log(`📧 EMAIL: ${credentials.email}`);
    console.log(`🔑 MOT DE PASSE: ${credentials.password}`);
    console.log(`🔗 CONNEXION: ${loginUrl}`);
    console.log('='.repeat(70));
  }

  // Méthode pour tester EmailJS
  async testEmailService(): Promise<boolean> {
    console.log('🧪 Test du service EmailJS...');
    
    const testCredentials: EmailCredentials = {
      email: 'test@example.com',
      password: 'test123',
      nom: 'Test',
      prenom: 'User'
    };

    return await this.sendUserCredentials(testCredentials);
  }
}

// Export d'une instance singleton
export const emailService = new EmailService();
export default emailService;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import emailjs from '@emailjs/nodejs';

@Injectable()
export class EmailJSService {
  private readonly logger = new Logger(EmailJSService.name);

  constructor(private configService: ConfigService) {
    // Initialiser EmailJS avec tes clés
    emailjs.init({
      publicKey: this.configService.get<string>('EMAILJS_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('EMAILJS_PRIVATE_KEY'),
    });
  }

  async sendUserCredentials(
    email: string,
    password: string,
    nom: string,
    prenom: string,
  ): Promise<boolean> {
    try {
      const templateParams = {
        to_email: email,
        to_name: `${prenom} ${nom}`,
        user_email: email,
        user_password: password,
        user_nom: nom,
        user_prenom: prenom,
        login_url: this.configService.get('FRONT_URL', 'http://localhost:5173') + '/login',
      };

      const response = await emailjs.send(
        this.configService.get<string>('EMAILJS_SERVICE_ID'), // Gmail service
        this.configService.get<string>('EMAILJS_TEMPLATE_ID'), // Template ID
        templateParams
      );

      this.logger.log(`✅ Email envoyé via EmailJS à ${email}`);
      this.logger.debug(`EmailJS Response: ${response.status} - ${response.text}`);
      
      return true;
      
    } catch (error: any) {
      this.logger.error(`❌ Erreur EmailJS pour ${email}:`, error);
      
      // Fallback: log des identifiants
      this.logCredentials(email, password, nom, prenom);
      
      return false;
    }
  }

  private logCredentials(email: string, password: string, nom: string, prenom: string) {
    const frontUrl = this.configService.get('FRONT_URL', 'http://localhost:5173');
    
    console.log('\n' + '='.repeat(70));
    console.log(`📧 EMAILJS FALLBACK - ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));
    console.log(`👤 ÉTUDIANT: ${prenom} ${nom}`);
    console.log(`📧 EMAIL: ${email}`);
    console.log(`🔑 MOT DE PASSE: ${password}`);
    console.log(`🔗 CONNEXION: ${frontUrl}/login`);
    console.log('='.repeat(70));
  }
}
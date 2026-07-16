import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailJSService } from './emailjs.service';
import { SMTP2GOService } from './smtp2go.service';
import { MailtrapDemoEmailService } from '../etudiant/resend-email.service';

export interface EmailProvider {
  sendUserCredentials(email: string, password: string, nom: string, prenom: string): Promise<boolean>;
}

@Injectable()
export class UnifiedEmailService {
  private readonly logger = new Logger(UnifiedEmailService.name);
  private providers: EmailProvider[] = [];

  constructor(
    private configService: ConfigService,
    private emailJSService: EmailJSService,
    private smtp2goService: SMTP2GOService,
    private mailtrapService: MailtrapDemoEmailService,
  ) {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Ordre de priorité des providers
    const emailJSEnabled = false; // this.configService.get<string>('EMAILJS_PUBLIC_KEY'); // Désactivé car ne fonctionne pas en backend
    const smtp2goEnabled = this.configService.get<string>('SMTP2GO_USERNAME');
    // Désactiver Mailtrap temporairement pour éviter le blocage
    const mailtrapEnabled = false; // this.configService.get<string>('EMAIL_USER');

    if (emailJSEnabled) {
      this.providers.push(this.emailJSService);
      this.logger.log('✅ EmailJS activé (priorité 1)');
    }

    if (smtp2goEnabled) {
      this.providers.push(this.smtp2goService);
      this.logger.log('✅ SMTP2GO activé (priorité 1)');
    }

    if (mailtrapEnabled) {
      this.providers.push(this.mailtrapService);
      this.logger.log('✅ Mailtrap activé (priorité 3)');
    }

    if (this.providers.length === 0) {
      this.logger.warn('⚠️ Aucun provider email configuré - mode simulation');
    }

    this.logger.log(`📧 ${this.providers.length} provider(s) email disponible(s)`);
  }

  async sendUserCredentials(
    email: string,
    password: string,
    nom: string,
    prenom: string,
  ): Promise<boolean> {
    if (this.providers.length === 0) {
      this.logCredentialsOnly(email, password, nom, prenom);
      return true;
    }

    // Essayer chaque provider dans l'ordre
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const providerName = this.getProviderName(provider);
      
      try {
        this.logger.log(`📧 Tentative ${i + 1}/${this.providers.length} avec ${providerName}`);
        
        const success = await provider.sendUserCredentials(email, password, nom, prenom);
        
        if (success) {
          this.logger.log(`✅ Email envoyé avec succès via ${providerName}`);
          return true;
        } else {
          this.logger.warn(`⚠️ ${providerName} a échoué, essai du suivant...`);
        }
        
      } catch (error: any) {
        this.logger.error(`❌ Erreur ${providerName}:`, error.message);
        
        if (i === this.providers.length - 1) {
          this.logger.error('❌ Tous les providers ont échoué');
        }
      }
    }

    // Si tous échouent, log les identifiants
    this.logCredentialsOnly(email, password, nom, prenom);
    return true; // Ne pas bloquer l'inscription
  }

  private getProviderName(provider: EmailProvider): string {
    if (provider instanceof EmailJSService) return 'EmailJS';
    if (provider instanceof SMTP2GOService) return 'SMTP2GO';
    if (provider instanceof MailtrapDemoEmailService) return 'Mailtrap';
    return 'Unknown';
  }

  private logCredentialsOnly(email: string, password: string, nom: string, prenom: string) {
    const frontUrl = this.configService.get('FRONT_URL', 'http://localhost:5173');
    
    console.log('\n' + '🔥'.repeat(35));
    console.log('📧 IDENTIFIANTS ÉTUDIANT - FALLBACK MODE');
    console.log('🔥'.repeat(35));
    console.log(`👤 NOM COMPLET: ${prenom} ${nom}`);
    console.log(`📧 EMAIL: ${email}`);
    console.log(`🔑 MOT DE PASSE: ${password}`);
    console.log(`🔗 URL CONNEXION: ${frontUrl}/login`);
    console.log('🔥'.repeat(35));
    console.log('⚠️ COPIEZ CES IDENTIFIANTS POUR L\'ÉTUDIANT');
    console.log('🔥'.repeat(35) + '\n');
    
    // Log pour Render
    this.logger.warn(`[STUDENT_CREDENTIALS] ${email} | ${password} | ${prenom} ${nom}`);
  }

  // Méthode pour tester la connectivité
  async testEmailProviders(): Promise<void> {
    this.logger.log('🧪 Test des providers email...');
    
    for (const provider of this.providers) {
      const providerName = this.getProviderName(provider);
      try {
        // Test avec un email fictif
        await provider.sendUserCredentials(
          'test@example.com',
          'test123',
          'Test',
          'User'
        );
        this.logger.log(`✅ ${providerName} : OK`);
      } catch (error) {
        this.logger.error(`❌ ${providerName} : ERREUR`);
      }
    }
  }
}
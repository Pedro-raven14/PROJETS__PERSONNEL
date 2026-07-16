import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SMTP2GOService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(SMTP2GOService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // SMTP2GO ne nécessite pas de domaine vérifié
    this.transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: this.configService.get<string>('SMTP2GO_USERNAME'),
        pass: this.configService.get<string>('SMTP2GO_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    this.logger.log('✅ SMTP2GO transporter initialisé');
  }

  async sendUserCredentials(
    email: string,
    password: string,
    nom: string,
    prenom: string,
  ): Promise<boolean> {
    const fromEmail = this.configService.get<string>('SMTP2GO_FROM_EMAIL', 'noreply@votre-app.com');
    
    try {
      const mailOptions = {
        from: `"Support Étudiant" <${fromEmail}>`,
        to: email,
        subject: '🎓 Vos identifiants étudiant',
        html: this.generateEmailTemplate(nom, prenom, email, password),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`✅ Email envoyé via SMTP2GO à ${email}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
      
      return true;
      
    } catch (error: any) {
      this.logger.error(`❌ Erreur SMTP2GO pour ${email}:`, error.message);
      
      // Fallback
      this.logCredentials(email, password, nom, prenom);
      
      return false;
    }
  }

  private generateEmailTemplate(nom: string, prenom: string, email: string, password: string): string {
    const frontUrl = this.configService.get('FRONT_URL', 'http://localhost:5173');
    
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">🎓 Bienvenue ${prenom} !</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Votre compte étudiant est prêt</p>
          </div>
          
          <div style="background: white; padding: 30px;">
            <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
            <p>Voici vos identifiants de connexion :</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">🔐 Vos identifiants</h3>
              <p><strong>📧 Email :</strong> ${email}</p>
              <p><strong>🔑 Mot de passe :</strong></p>
              <div style="font-family: monospace; font-size: 18px; background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${password}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontUrl}/login" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                👉 Se connecter
              </a>
            </div>
            
            <p style="color: #dc3545; background: #f8d7da; padding: 15px; border-radius: 5px;">
              ⚠️ <strong>Important :</strong> Changez ce mot de passe lors de votre première connexion.
            </p>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Support Étudiant • Envoyé via SMTP2GO</p>
          </div>
        </body>
      </html>
    `;
  }

  private logCredentials(email: string, password: string, nom: string, prenom: string) {
    const frontUrl = this.configService.get('FRONT_URL', 'http://localhost:5173');
    
    console.log('\n' + '='.repeat(70));
    console.log(`📧 SMTP2GO FALLBACK - ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));
    console.log(`👤 ÉTUDIANT: ${prenom} ${nom}`);
    console.log(`📧 EMAIL: ${email}`);
    console.log(`🔑 MOT DE PASSE: ${password}`);
    console.log(`🔗 CONNEXION: ${frontUrl}/login`);
    console.log('='.repeat(70));
  }
}
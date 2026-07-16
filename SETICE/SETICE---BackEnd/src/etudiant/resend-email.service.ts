// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Resend } from 'resend';

// @Injectable()
// export class ResendEmailService {
//   private readonly logger = new Logger(ResendEmailService.name);
//   private resend: Resend;

//   constructor(private configService: ConfigService) {
//     const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
//     if (!apiKey) {
//       this.logger.warn('⚠️ RESEND_API_KEY non configurée');
//       return;
//     }
    
//     this.resend = new Resend(apiKey);
//     this.logger.log('✅ Resend initialisé');
//   }

//   async sendUserCredentials(
//     email: string,
//     password: string,
//     nom: string,
//     prenom: string,
//   ): Promise<boolean> {
//     const fromEmail = this.configService.get<string>('EMAIL_FROM', 'apexd@gmail.com');
//     const frontUrl = this.configService.get('FRONT_URL');
//     const isProduction = 'production';

//     // Si Resend n'est pas initialisé (pas de clé API)
//     if (!this.resend) {
//       if (isProduction) {
//         this.logger.warn(`📧 [SIMULATION] Pas de Resend API - Identifiants pour ${email}: ${password}`);
//       } else {
//         this.logger.error('❌ Resend non initialisé - configurez RESEND_API_KEY');
//       }
//       return false;
//     }

//     try {
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <meta charset="UTF-8">
//             <style>
//               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
//               .header { background: #4F46E5; color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
//               .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
//               .credentials { background: white; border: 2px solid #4F46E5; padding: 20px; margin: 20px 0; border-radius: 8px; }
//               .password { font-family: monospace; font-size: 18px; background: #f1f5f9; padding: 12px; border-radius: 5px; text-align: center; margin: 10px 0; }
//               .button { display: inline-block; background: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
//               .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; }
//             </style>
//           </head>
//           <body>
//             <div class="header">
//               <h1 style="margin: 0;">🎓 Bienvenue ${prenom} !</h1>
//             </div>
            
//             <div class="content">
//               <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
//               <p>Votre compte étudiant a été créé avec succès sur notre plateforme.</p>
              
//               <div class="credentials">
//                 <h3 style="color: #4F46E5; margin-top: 0;">🔐 Vos identifiants</h3>
//                 <p><strong>📧 Email :</strong> ${email}</p>
//                 <p><strong>🔑 Mot de passe temporaire :</strong></p>
//                 <div class="password">${password}</div>
//                 <p><small>Ce mot de passe a été généré automatiquement.</small></p>
//               </div>
              
//               <p style="color: #dc2626; background: #fef2f2; padding: 15px; border-radius: 5px;">
//                 ⚠️ <strong>IMPORTANT :</strong> Changez ce mot de passe dès votre première connexion.
//               </p>
              
//               <div style="text-align: center; margin: 30px 0;">
//                 <a href="${frontUrl}/login" class="button">
//                   👉 Se connecter maintenant
//                 </a>
//               </div>
              
//               <div class="footer">
//                 <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
//                 <strong>Support Étudiant</strong></p>
//               </div>
//             </div>
//           </body>
//         </html>
//       `;

//       const response = await this.resend.emails.send({
//         from: `Support Étudiant <${fromEmail}>`,
//         to: [email],
//         subject: 'Vos identifiants étudiant',
//         html: htmlContent,
//         tags: [
//           {
//             name: 'category',
//             value: 'account_creation',
//           },
//         ],
//       });

//       this.logger.log(`📧 Email envoyé via Resend à ${email}`);
//       this.logger.debug(`Resend ID: ${response.data?.id}`);
      
//       return true;
      
//     } catch (error: any) {
//       this.logger.error(`❌ Échec envoi Resend à ${email}:`, error.message);
      
//       if (isProduction) {
//         this.logger.warn(`📧 [SIMULATION] Échec envoi - Identifiants pour ${email}: ${password}`);
//         return true; // Continuer sans bloquer
//       }
      
//       return false;
//     }
//   }
// }

// Service Mailtrap avec gestion d'erreurs améliorée
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailtrapDemoEmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailtrapDemoEmailService.name);
  private isDemoDomain = false;
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Initialisation non-bloquante
    this.initializeTransporter().catch(error => {
      this.logger.error('❌ Erreur initialisation Mailtrap:', error.message);
    });
  }

  private async initializeTransporter() {
    try {
      const host = this.configService.get<string>('EMAIL_HOST', 'live.smtp.mailtrap.io');
      const user = this.configService.get<string>('EMAIL_USER');
      const fromEmail = this.configService.get<string>('EMAIL_FROM', '');
      
      // Détecte si c'est un domaine démo
      this.isDemoDomain = fromEmail.includes('mailtrap.io') || fromEmail.includes('demo.');
      
      this.logger.debug(`📧 Initializing Mailtrap${this.isDemoDomain ? ' DEMO' : ''} SMTP...`);
      
      const transporterConfig: any = {
        host: host,
        port: this.configService.get<number>('EMAIL_PORT', 587),
        secure: this.configService.get<boolean>('EMAIL_SECURE', true),
        auth: {
          user: user,
          pass: this.configService.get<string>('EMAIL_PASSWORD') || user,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
      };

      // Options spécifiques pour domaine démo
      if (this.isDemoDomain) {
        this.logger.log('🌐 Utilisation du domaine démo Mailtrap');
        transporterConfig.tls = {
          rejectUnauthorized: false,
        };
      }

      this.transporter = nodemailer.createTransport(transporterConfig);

      // Vérification avec timeout
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      this.logger.log(`✅ Mailtrap${this.isDemoDomain ? ' Demo' : ''} SMTP connecté!`);
      this.logger.log(`📧 From: ${fromEmail}`);
      this.isInitialized = true;
      
    } catch (error: any) {
      this.logger.error(`❌ Erreur Mailtrap: ${error.message}`);
      this.logger.warn('📧 Les emails seront simulés');
      this.isInitialized = false;
    }
  }

  async sendUserCredentials(
    email: string,
    password: string,
    nom: string,
    prenom: string,
  ): Promise<boolean> {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    
    // Log d'information
    this.logger.log(`📧 Tentative envoi depuis: ${fromEmail}`);
    this.logger.log(`📧 Vers: ${email}`);
    
    if (this.isDemoDomain) {
      this.logger.log('⚠️ Envoi via domaine démo Mailtrap - vérifiez le spam');
    }

    if (!this.transporter || !this.isInitialized) {
      this.logCredentials(email, password, nom, prenom, 'SIMULATION (no transporter)');
      return true;
    }

    try {
      const mailOptions = {
        from: `"Support Étudiant" <${fromEmail}>`,
        to: email,
        subject: '🎓 Vos identifiants étudiant - Université',
        html: this.generateCredentialsEmail(nom, prenom, password, email),
        headers: {
          'X-Demo-Domain': 'true',
          'X-Priority': '1',
        },
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`✅ Email envoyé via Mailtrap${this.isDemoDomain ? ' Demo' : ''}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
      this.logger.log(`📩 Vérifiez le dashboard Mailtrap pour le suivi`);
      
      // Avertissement pour domaine démo
      if (this.isDemoDomain) {
        this.logger.warn('⚠️ EMAIL ENVOYÉ VIA DOMAINE DÉMO - VÉRIFIEZ LE SPAM');
        this.logger.warn('⚠️ Pour production, utilisez votre propre domaine vérifié');
      }
      
      this.logCredentials(email, password, nom, prenom, 'MAILTRAP DEMO');
      
      return true;
      
    } catch (error: any) {
      this.logger.error(`❌ Erreur détaillée Mailtrap:`, {
        message: error.message,
        code: error.code,
        command: error.command,
      });
      
      // Erreurs communes Mailtrap
      if (error.message.includes('550')) {
        this.logger.error('❌ Erreur 550: Vérifiez le domaine démo dans Mailtrap');
      }
      if (error.message.includes('Authentication')) {
        this.logger.error('❌ Erreur Auth: Vérifiez EMAIL_USER/EMAIL_PASSWORD');
      }
      
      this.logCredentials(email, password, nom, prenom, 'FALLBACK (erreur Mailtrap)');
      
      return true;
    }
  }

  private logCredentials(email: string, password: string, nom: string, prenom: string, method: string) {
    const frontUrl = this.configService.get('FRONT_URL', 'http://localhost:5173');
    
    console.log('\n' + '='.repeat(70));
    console.log(`📧 ${method} - ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));
    console.log(`👤 ÉTUDIANT: ${prenom} ${nom}`);
    console.log(`📧 DESTINATAIRE: ${email}`);
    console.log(`🔑 MOT DE PASSE: ${password}`);
    console.log(`🔗 LIEN CONNEXION: ${frontUrl}/login`);
    console.log('='.repeat(70));
    
    // Pour Render logs
    this.logger.log(`[STUDENT_CREDS] ${email} | ${password.substring(0, 3)}... | ${prenom} ${nom}`);
  }

  private generateCredentialsEmail(nom: string, prenom: string, password: string, email: string): string {
    const frontUrl = this.configService.get('FRONT_URL', 'http://localhost:5173');
    
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎓 Bienvenue ${prenom} !</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Votre compte étudiant est activé</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
            <p>Voici vos identifiants pour accéder à la plateforme :</p>
            
            <div style="background: white; border-radius: 10px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="color: #4F46E5; margin-top: 0;">🔐 Identifiants de connexion</h3>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0 0 10px;"><strong>📧 Email :</strong></p>
                <div style="font-size: 16px; color: #1e293b;">${email}</div>
                
                <p style="margin: 15px 0 10px;"><strong>🔑 Mot de passe temporaire :</strong></p>
                <div style="font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 15px; border-radius: 6px; letter-spacing: 1px;">
                  ${password}
                </div>
              </div>
              
              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚠️ IMPORTANT :</strong> 
                  Pour des raisons de sécurité, vous devez changer ce mot de passe lors de votre première connexion.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontUrl}/login" 
                 style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                👉 Accéder à la plateforme
              </a>
            </div>
            
            <p style="text-align: center; color: #64748b; font-size: 14px;">
              Si le bouton ne fonctionne pas :<br>
              <code style="background: #e2e8f0; padding: 5px 10px; border-radius: 4px;">${frontUrl}/login</code>
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #64748b; font-size: 14px;">
                Service Étudiant • Plateforme Universitaire<br>
                <em>Email envoyé via Mailtrap Demo</em>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
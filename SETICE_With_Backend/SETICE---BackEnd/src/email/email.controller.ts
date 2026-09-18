import { Controller, Post, Body, Get } from '@nestjs/common';
import { UnifiedEmailService } from './unified-email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly unifiedEmailService: UnifiedEmailService) {}

  @Get('test-providers')
  async testProviders() {
    await this.unifiedEmailService.testEmailProviders();
    return { message: 'Test des providers terminé - vérifiez les logs' };
  }

  @Post('test-send')
  async testSend(@Body() body: { email: string; nom: string; prenom: string }) {
    const { email, nom, prenom } = body;
    const testPassword = 'Test123!';
    
    const success = await this.unifiedEmailService.sendUserCredentials(
      email,
      testPassword,
      nom,
      prenom
    );

    return {
      success,
      message: success 
        ? `Email de test envoyé à ${email}` 
        : `Échec envoi - vérifiez les logs pour les identifiants`
    };
  }
}
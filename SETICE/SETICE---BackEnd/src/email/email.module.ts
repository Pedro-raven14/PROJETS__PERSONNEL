import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailJSService } from './emailjs.service';
import { SMTP2GOService } from './smtp2go.service';
import { UnifiedEmailService } from './unified-email.service';
import { MailtrapDemoEmailService } from '../etudiant/resend-email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailJSService,
    SMTP2GOService,
    MailtrapDemoEmailService,
    UnifiedEmailService,
  ],
  controllers: [EmailController],
  exports: [
    UnifiedEmailService, // Service principal à utiliser
    EmailJSService,
    SMTP2GOService,
  ],
})
export class EmailModule {}
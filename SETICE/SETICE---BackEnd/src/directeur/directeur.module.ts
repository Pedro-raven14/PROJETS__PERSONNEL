import { Module } from '@nestjs/common';
import { DirecteurService } from './directeur.service';
import { DirecteurController } from './directeur.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Directeur } from './directeur.entity';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Directeur]),
    TypeOrmModule.forFeature([Utilisateur]),
    EmailModule,
  ],
  providers: [DirecteurService],
  controllers: [DirecteurController],
})
export class DirecteurModule {}

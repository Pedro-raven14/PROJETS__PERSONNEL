import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule, // Pour accéder à UsersService
    PassportModule,
    /*
      JwtModule.registerAsync() : on attend que ConfigModule soit chargé
      pour lire JWT_SECRET depuis .env. C'est la version "async" car
      les variables d'env ne sont pas disponibles au démarrage synchrone.
    */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): { secret: string; signOptions: { expiresIn: number } } => ({
        secret: config.get<string>('JWT_SECRET') ?? '',
        signOptions: {
          /*
            @nestjs/jwt v11 attend un nombre (secondes) ou un type StringValue de la lib "ms".
            On passe l'expiration en secondes pour éviter tout problème de typage :
            604800 = 7 jours en secondes (7 * 24 * 60 * 60).
          */
          expiresIn: 604800,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  /*
    On exporte JwtAuthGuard et JwtModule pour que d'autres modules
    (notamment le Gateway WebSocket) puissent valider les tokens.
  */
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

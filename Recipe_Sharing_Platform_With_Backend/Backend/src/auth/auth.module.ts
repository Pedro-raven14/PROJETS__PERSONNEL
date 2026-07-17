/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH MODULE — auth.module.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un Module NestJS est une classe qui regroupe et organise des composants
 * liés (controllers, services, stratégies).
 *
 * POURQUOI des modules ?
 * - Organisation : tout ce qui concerne l'auth est dans auth/
 * - Encapsulation : les providers d'un module ne sont pas accessibles
 *   ailleurs sauf s'ils sont explicitement exportés
 * - Testabilité : on peut tester le module en isolation
 *
 * Les 4 propriétés du décorateur @Module :
 * - imports  : modules dont on a besoin (TypeOrmModule, JwtModule...)
 * - controllers : les controllers qui définissent les routes
 * - providers : services, strategies, guards (injectables)
 * - exports : ce qu'on expose aux autres modules qui importent AuthModule
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { User } from '../users/user.entity';

@Module({
  imports: [
    ConfigModule,

    /**
     * TypeOrmModule.forFeature([User])
     * Enregistre le repository de l'entité User dans ce module.
     * Permet d'injecter Repository<User> avec @InjectRepository(User).
     *
     * IMPORTANT : forFeature() s'utilise dans chaque module qui a besoin
     * d'accéder à une entité. forRoot() (dans AppModule) configure la connexion.
     */
    TypeOrmModule.forFeature([User]),

    /**
     * PassportModule.register({ defaultStrategy: 'jwt' })
     * Enregistre Passport et définit la stratégie par défaut.
     * Avec cette config, @UseGuards(AuthGuard()) utilise 'jwt' par défaut.
     */
    PassportModule.register({ defaultStrategy: 'jwt' }),

    /**
     * JwtModule.register({ secret, signOptions })
     * Configure le module JWT global pour ce module.
     *
     * NOTE : on ne met PAS de secret ici car on le passe directement dans
     * jwtService.signAsync() dans auth.service.ts (pour gérer deux secrets
     * différents : access et refresh).
     * On enregistre juste le module pour avoir accès à JwtService.
     */
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,       // Stratégie pour les access tokens
    JwtRefreshStrategy, // Stratégie pour les refresh tokens
  ],
  exports: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}

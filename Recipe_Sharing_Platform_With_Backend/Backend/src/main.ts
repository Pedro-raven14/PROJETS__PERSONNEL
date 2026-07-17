/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAIN.TS — Point d'entrée de l'application NestJS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Ce fichier bootstrappe (démarre) l'application.
 * C'est ici qu'on configure les middlewares globaux :
 * - CORS (Cross-Origin Resource Sharing)
 * - ValidationPipe (validation des DTOs)
 * - Swagger (documentation auto de l'API)
 * - Préfixe global de l'API
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  /**
   * NestFactory.create(AppModule) : crée l'application NestJS.
   * NestJS instancie tous les modules, services et contrôleurs
   * en résolvant l'arbre de dépendances.
   */
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';

  // ── CORS ────────────────────────────────────────────────────────────────────
  /**
   * CORS (Cross-Origin Resource Sharing) permet au frontend (localhost:5173)
   * d'appeler le backend (localhost:3000) sans être bloqué par le navigateur.
   *
   * Sans CORS, le navigateur bloquerait toutes les requêtes "cross-origin"
   * (depuis un domaine/port différent) pour des raisons de sécurité.
   *
   * credentials: true → nécessaire pour envoyer/recevoir des cookies
   * (si on décide d'utiliser des cookies pour les tokens plus tard).
   */
  app.enableCors({
    origin: isProd
      ? (process.env.FRONTEND_URL || '').split(',').filter(Boolean)
      : [process.env.FRONTEND_URL || 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── PRÉFIXE GLOBAL ──────────────────────────────────────────────────────────
  /**
   * Préfixe global pour toutes les routes : /api
   * - /auth/register → /api/auth/register
   * - /recipes       → /api/recipes
   *
   * Bonne pratique : versionner l'API pour éviter les breaking changes.
   * Version pourrait être 'api/v1' pour permettre /api/v2 plus tard.
   */
  app.setGlobalPrefix('api');

  // ── VALIDATION PIPE GLOBAL ──────────────────────────────────────────────────
  /**
   * ValidationPipe global : active la validation des DTOs sur TOUS les endpoints.
   *
   * Options importantes :
   * - whitelist: true → supprime automatiquement les champs non déclarés dans le DTO
   *   (protection contre les injections de champs non prévus)
   * - forbidNonWhitelisted: true → renvoie une erreur 400 si des champs inconnus sont reçus
   * - transform: true → convertit automatiquement les types :
   *   "1" (string) → 1 (number) pour les @Type(() => Number) dans les DTOs
   *   Indispensable pour les query params qui sont toujours des strings HTTP.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── SWAGGER DOCUMENTATION ────────────────────────────────────────────────────
  /**
   * Swagger génère automatiquement une documentation interactive de l'API.
   * Accessible sur http://localhost:3000/api/docs
   *
   * DocumentBuilder configure les métadonnées du document Swagger.
   * SwaggerModule.createDocument() parcourt tous les controllers et DTOs
   * pour générer la spécification OpenAPI.
   *
   * C'est TRÈS utile pour :
   * - Tester les endpoints sans Postman
   * - Documenter l'API pour le frontend
   * - Générer des clients API automatiquement
   */
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CookShare API')
      .setDescription(
        'API REST pour la plateforme de partage de recettes CookShare. ' +
        'Authentification via JWT (Bearer token).',
      )
      .setVersion('1.0')
      /**
       * addBearerAuth() → ajoute un champ dans Swagger UI pour entrer le JWT.
       * Cliquer sur "Authorize" en haut de la page pour entrer votre token.
       */
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    /**
     * SwaggerModule.setup('docs', app, document)
     * Monte la documentation Swagger sur /api/docs
     * (le préfixe /api est ajouté automatiquement).
     */
    SwaggerModule.setup('docs', app, document);
  }

  // ── DÉMARRAGE ────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════════════╗
║           🍽️  CookShare Backend démarré            ║
╠════════════════════════════════════════════════════╣
║  Mode     : ${isProd ? 'PRODUCTION         ' : 'DÉVELOPPEMENT      '}             ║
║  URL      : http://localhost:${port}              ║
║  API      : http://localhost:${port}/api          ║
${!isProd ? `║  Swagger  : http://localhost:${port}/api/docs    ║\n` : ''}╚════════════════════════════════════════════════════╝
  `);
}

bootstrap();

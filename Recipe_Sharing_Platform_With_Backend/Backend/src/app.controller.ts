/**
 * APP CONTROLLER — app.controller.ts
 *
 * Controller minimal pour le healthcheck de l'application.
 * GET /api → vérifie que le backend est bien démarré.
 * Utile pour les services d'hébergement (Railway, Render) qui pingent
 * régulièrement l'API pour vérifier qu'elle est en vie.
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Vérifier que l\'API est en ligne' })
  healthCheck() {
    return {
      status: 'ok',
      message: '🍽️ CookShare API is running',
      timestamp: new Date().toISOString(),
    };
  }
}

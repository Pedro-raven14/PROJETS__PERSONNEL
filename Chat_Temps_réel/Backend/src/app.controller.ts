import { Controller, Get } from '@nestjs/common';

/*
  Route de healthcheck : GET /
  Utile pour vérifier que le serveur tourne (Railway, Render, etc. l'utilisent).
*/
@Controller()
export class AppController {
  @Get()
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

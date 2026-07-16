import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Route keep-alive pour Render (ping toutes les 9 min depuis le frontend ou UptimeRobot)
  @Get('health')
  health() {
    return { status: 'ok', env: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() };
  }
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  /**
   * POST /urls — Créer un lien court
   */
  @Post('urls')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createUrl(@Body() dto: CreateUrlDto) {
    const url = await this.urlsService.create(dto);
    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL ?? 'http://localhost:3000'}/${url.shortCode}`,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
    };
  }

  /**
   * GET /urls/stats — Statistiques globales
   */
  @Get('urls/stats')
  async getStats() {
    return this.urlsService.getStats();
  }

  /**
   * GET /urls — Liste de tous les liens
   */
  @Get('urls')
  async findAll() {
    return this.urlsService.findAll();
  }

  /**
   * DELETE /urls/:id — Supprimer un lien
   */
  @Delete('urls/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.urlsService.remove(id);
  }

  /**
   * GET /:shortCode — Redirection vers l'URL originale
   * Cette route doit être en dernier pour ne pas interférer avec les autres.
   */
  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    const originalUrl = await this.urlsService.redirect(shortCode);
    return res.redirect(HttpStatus.MOVED_PERMANENTLY, originalUrl);
  }
}

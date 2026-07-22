import {
  Injectable,
  NotFoundException,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../entities/urls.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  /**
   * Crée un lien court. Si l'URL originale existe déjà (et n'est pas expirée),
   * retourne le lien existant (gestion des doublons).
   */
  async create(dto: CreateUrlDto): Promise<Url> {
    const { originalUrl, expiresInDays } = dto;

    // Vérification des doublons (URL existante non expirée)
    const existing = await this.urlRepository.findOne({
      where: { originalUrl },
    });

    if (existing) {
      const isExpired =
        existing.expiresAt && new Date() > new Date(existing.expiresAt);
      if (!isExpired) {
        return existing;
      }
      // Lien expiré → on le supprime et on en crée un nouveau
      await this.urlRepository.remove(existing);
    }

    // Générer un code unique de 7 caractères
    let shortCode: string;
    let attempt = 0;
    do {
      shortCode = nanoid(7);
      attempt++;
      if (attempt > 10) {
        throw new BadRequestException('Impossible de générer un code unique.');
      }
    } while (await this.urlRepository.findOne({ where: { shortCode } }));

    // Calculer la date d'expiration si fournie
    let expiresAt: Date | null = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const url = this.urlRepository.create({
      originalUrl,
      shortCode,
      expiresAt,
      clicks: 0,
    });

    return this.urlRepository.save(url);
  }

  /**
   * Redirige vers l'URL originale et incrémente le compteur de clics.
   */
  async redirect(shortCode: string): Promise<string> {
    const url = await this.urlRepository.findOne({ where: { shortCode } });

    if (!url) {
      throw new NotFoundException('Lien court introuvable.');
    }

    // Vérifier l'expiration
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      throw new GoneException('Ce lien a expiré.');
    }

    // Incrémenter les clics
    await this.urlRepository.increment({ id: url.id }, 'clicks', 1);

    return url.originalUrl;
  }

  /**
   * Récupérer les statistiques globales (pour la section stats de la page d'accueil).
   */
  async getStats(): Promise<{
    totalLinks: number;
    totalClicks: number;
    conversionRate: number;
  }> {
    const totalLinks = await this.urlRepository.count();
    const result = await this.urlRepository
      .createQueryBuilder('url')
      .select('SUM(url.clicks)', 'total')
      .getRawOne<{ total: string }>();

    const totalClicks = parseInt(result?.total ?? '0', 10);

    // Taux de conversion : % de liens ayant reçu au moins 1 clic
    const linksWithClicks = await this.urlRepository
      .createQueryBuilder('url')
      .where('url.clicks > 0')
      .getCount();

    const conversionRate =
      totalLinks > 0
        ? parseFloat(((linksWithClicks / totalLinks) * 100).toFixed(1))
        : 0;

    return { totalLinks, totalClicks, conversionRate };
  }

  /**
   * Récupérer tous les liens (pour un futur tableau de bord).
   */
  async findAll(): Promise<Url[]> {
    return this.urlRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Supprimer un lien par son ID.
   */
  async remove(id: string): Promise<void> {
    const url = await this.urlRepository.findOne({ where: { id } });
    if (!url) {
      throw new NotFoundException('Lien introuvable.');
    }
    await this.urlRepository.remove(url);
  }
}

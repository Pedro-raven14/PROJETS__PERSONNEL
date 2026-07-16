import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preferences } from './entities/preferences.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

/**
 * @Injectable PreferencesService
 *
 * implements OnModuleInit : on crée les préférences par défaut au démarrage
 * si elles n'existent pas encore en base.
 *
 * Pattern SINGLETON : il n'y a qu'un seul enregistrement (id = 1).
 * C'est l'approche "mono-utilisateur" décrite dans le BACKEND_GUIDE §8.
 */
@Injectable()
export class PreferencesService implements OnModuleInit {
  constructor(
    @InjectRepository(Preferences)
    private readonly repo: Repository<Preferences>,
  ) {}

  /**
   * Crée les préférences par défaut au premier démarrage.
   * Si l'enregistrement existe déjà (id = 1), on ne fait rien.
   */
  async onModuleInit() {
    const existing = await this.repo.findOne({ where: { id: 1 } });
    if (!existing) {
      await this.repo.save(
        this.repo.create({
          id: 1,
          nom: 'Utilisateur',
          devise: '€',
          premierJour: 'lundi',
          notifications: true,
        }),
      );
      console.log('✅ Préférences par défaut créées');
    }
  }

  /**
   * Retourne les préférences de l'utilisateur.
   * On cherche toujours l'enregistrement avec id = 1 (singleton).
   * Si absent (ne devrait pas arriver grâce à onModuleInit), retourne null.
   */
  async get(): Promise<Preferences | null> {
    return this.repo.findOne({ where: { id: 1 } });
  }

  /**
   * Met à jour partiellement les préférences.
   *
   * On appelle get() qui peut retourner null si (par bug) l'enregistrement
   * n'existe pas malgré onModuleInit. Dans ce cas on lève une 404.
   * Le `if (!preferences)` satisfait TypeScript : après ce check,
   * TypeScript sait que `preferences` est forcément un `Preferences` et non null,
   * ce qui permet d'utiliser Object.assign et repo.save sans erreur de type.
   */
  async update(dto: UpdatePreferencesDto): Promise<Preferences> {
    const preferences = await this.get();
    if (!preferences) {
      throw new NotFoundException('Préférences introuvables');
    }
    Object.assign(preferences, dto);
    return this.repo.save(preferences);
  }
}

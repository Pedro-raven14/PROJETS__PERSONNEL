import { Body, Controller, Get, Patch } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

/**
 * @Controller PreferencesController
 *
 * Routes exposées :
 * GET  /preferences  → lire les préférences actuelles
 * PATCH /preferences → mettre à jour une ou plusieurs préférences
 *
 * Pas de POST car les préférences sont créées automatiquement au démarrage.
 * Pas de DELETE car les préférences doivent toujours exister.
 */
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  /**
   * GET /preferences
   * Retourne les préférences utilisateur :
   * { "id": 1, "nom": "Alice", "devise": "€", "premierJour": "lundi", "notifications": true }
   */
  @Get()
  get() {
    return this.preferencesService.get();
  }

  /**
   * PATCH /preferences
   * Met à jour les préférences (envoi partiel accepté).
   * Exemple : { "nom": "Alice", "devise": "$" }
   */
  @Patch()
  update(@Body() dto: UpdatePreferencesDto) {
    return this.preferencesService.update(dto);
  }
}

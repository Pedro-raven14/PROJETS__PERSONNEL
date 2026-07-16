import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { Preferences } from './entities/preferences.entity';

/**
 * @Module PreferencesModule
 *
 * Encapsule tout ce qui concerne les préférences utilisateur.
 * Pas d'exports nécessaires ici car aucun autre module n'a besoin
 * de PreferencesService pour l'instant.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Preferences])],
  controllers: [PreferencesController],
  providers: [PreferencesService],
})
export class PreferencesModule {}

/**
 * Ce module est conservé pour compatibilité mais son contenu
 * a été migré vers le nouveau module `preferences`.
 *
 * Le module Preferences (src/preferences/) est le remplaçant complet :
 * - Entité Preferences avec tous les champs (nom, devise, premierJour, notifications)
 * - DTO UpdatePreferencesDto avec validation complète
 * - Routes : GET /preferences et PATCH /preferences
 *
 * Ce fichier peut être supprimé si ParametresModule n'est plus importé nulle part.
 */
import { Module } from '@nestjs/common';

@Module({})
export class ParametresModule {}

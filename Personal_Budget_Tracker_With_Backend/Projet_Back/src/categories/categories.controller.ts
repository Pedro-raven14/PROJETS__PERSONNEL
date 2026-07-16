import { Controller, Get, Query } from '@nestjs/common';
// IsIn est un décorateur de class-validator, pas de @nestjs/common — supprimé de l'import
import { CategoriesService } from './categories.service';

/**
 * @Controller CategoriesController
 *
 * Routes exposées :
 * GET /categories             → toutes les catégories
 * GET /categories?type=depense → seulement les dépenses
 * GET /categories?type=revenu  → seulement les revenus
 *
 * Ces endpoints sont optionnels (le frontend charge les catégories localement),
 * mais utiles pour des intégrations ou des clients tiers.
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('type') type?: 'revenu' | 'depense') {
    if (type === 'revenu' || type === 'depense') {
      return this.categoriesService.findByType(type);
    }
    return this.categoriesService.findAll();
  }
}

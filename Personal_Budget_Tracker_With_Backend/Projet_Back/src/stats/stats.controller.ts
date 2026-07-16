import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { StatsService } from './stats.service';

/**
 * @Controller StatsController
 *
 * Routes exposées :
 * GET /stats/summary?annee=2026&mois=3        → KPIs dashboard
 * GET /stats/evolution?mois=6                 → Graphique 6 mois
 * GET /stats/categories?annee=2026&mois=3     → Répartition dépenses
 * GET /stats/budget-usage?annee=2026&mois=3   → Budget vs réel
 *
 * POURQUOI pas /stats/:type mais des sous-routes ?
 * Chaque endpoint retourne une structure très différente.
 * Des noms explicites (/summary, /evolution...) sont plus clairs
 * qu'un paramètre de type qui demanderait une logique conditionnelle.
 */
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /stats/summary?annee=2026&mois=3
   *
   * @DefaultValuePipe : valeur par défaut si le query param est absent.
   * @ParseIntPipe : convertit la string "2026" en nombre 2026.
   * Les deux pipes sont appliqués dans l'ordre : DefaultValue puis ParseInt.
   *
   * Si ?annee et ?mois sont absents, on utilise le mois et l'année courants.
   */
  @Get('summary')
  getSummary(
    @Query('annee', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    annee: number,
    @Query('mois', new DefaultValuePipe(new Date().getMonth() + 1), ParseIntPipe)
    mois: number,
  ) {
    return this.statsService.getSummary(annee, mois);
  }

  /**
   * GET /stats/evolution?mois=6
   *
   * Par défaut 6 mois si le paramètre est absent.
   * Max raisonnable : 24 mois (2 ans d'historique).
   */
  @Get('evolution')
  getEvolution(
    @Query('mois', new DefaultValuePipe(6), ParseIntPipe)
    nbMois: number,
  ) {
    return this.statsService.getEvolution(nbMois);
  }

  /**
   * GET /stats/categories?annee=2026&mois=3
   *
   * Répartition des dépenses par catégorie pour un mois donné.
   */
  @Get('categories')
  getCategoriesRepartition(
    @Query('annee', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    annee: number,
    @Query('mois', new DefaultValuePipe(new Date().getMonth() + 1), ParseIntPipe)
    mois: number,
  ) {
    return this.statsService.getCategoriesRepartition(annee, mois);
  }

  /**
   * GET /stats/budget-usage?annee=2026&mois=3
   *
   * Comparison dépenses réelles vs budget défini, par catégorie.
   */
  @Get('budget-usage')
  getBudgetUsage(
    @Query('annee', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    annee: number,
    @Query('mois', new DefaultValuePipe(new Date().getMonth() + 1), ParseIntPipe)
    mois: number,
  ) {
    return this.statsService.getBudgetUsage(annee, mois);
  }
}

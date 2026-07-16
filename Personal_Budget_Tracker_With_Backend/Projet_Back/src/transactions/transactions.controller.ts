import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

/**
 * @Controller TransactionsController
 *
 * Le CONTROLLER gère uniquement la couche HTTP :
 * - Décoder les routes (GET, POST, PATCH, DELETE)
 * - Extraire les paramètres (body, query, params)
 * - Déléguer la logique au SERVICE
 * - Retourner la réponse
 *
 * @Controller('transactions') = préfixe toutes les routes par /transactions
 *
 * RÈGLE : Pas de logique métier ici.
 * Le controller est "stupide" : il reçoit, délègue, retourne.
 */
@Controller('transactions')
export class TransactionsController {
  /**
   * Injection de dépendance via le constructeur.
   * NestJS gère automatiquement l'instanciation du service.
   * Le paramètre `private readonly` crée ET assigne la propriété en une ligne.
   */
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * POST /transactions
   *
   * Crée une nouvelle transaction.
   * @Body() extrait et valide le body JSON de la requête.
   * Le ValidationPipe (configuré dans main.ts) valide le DTO automatiquement.
   *
   * Exemple de body :
   * {
   *   "type": "depense",
   *   "categorie": "alimentation",
   *   "description": "Courses du mois",
   *   "montant": 142.5,
   *   "date": "2026-03-05",
   *   "statut": "paye"
   * }
   */
  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  /**
   * GET /transactions
   * GET /transactions?type=depense&page=1&limit=10&recherche=courses
   *
   * Retourne la liste paginée et filtrée des transactions.
   * @Query() extrait tous les query params et les met dans le DTO.
   *
   * Réponse :
   * {
   *   "data": [...],
   *   "total": 42,
   *   "page": 1,
   *   "limit": 10
   * }
   */
  @Get()
  findAll(@Query() filters: FilterTransactionDto) {
    return this.transactionsService.findAll(filters);
  }

  /**
   * GET /transactions/:id
   *
   * Retourne une seule transaction par son UUID.
   * @Param('id') extrait le segment :id de l'URL.
   * @ParseUUIDPipe valide automatiquement que l'id est bien un UUID valide.
   * Si ce n'est pas un UUID, NestJS retourne 400 avant même d'appeler le service.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  /**
   * PATCH /transactions/:id
   *
   * Mise à jour PARTIELLE d'une transaction.
   * PATCH (et non PUT) car on n'envoie que les champs à modifier.
   * UpdateTransactionDto = CreateTransactionDto avec tous les champs optionnels.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto);
  }

  /**
   * DELETE /transactions/:id
   *
   * Supprime une transaction par son UUID.
   * Retourne { message: "Transaction #xxx supprimée avec succès" }.
   * Si l'id n'existe pas, le service lance une 404.
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.remove(id);
  }
}

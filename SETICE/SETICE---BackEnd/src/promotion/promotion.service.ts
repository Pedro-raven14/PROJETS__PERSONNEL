import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './promotion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async createPromo(promotion: Promotion) {
    const promo = await this.promotionRepository.save(promotion);
    return `La promotion ${promo.options},${promo.anneeAcademique} a bien été enregistrer `;
  }

  async getPromo() {
    return this.promotionRepository.find({
      relations: ['etudiants'],
    });
  }

  async updatePromo(id: number, promotion: Partial<Promotion>) {
    await this.promotionRepository.update(id, promotion);
    return `Promotion ${id} mise à jour avec succès`;
  }

  async deletePromo(id: number): Promise<{ message: string }> {
    // Utiliser une transaction pour garantir l'intégrité
    return await this.promotionRepository.manager.transaction(async (manager) => {
      // 1. Récupérer la promotion avec ses relations
      const promotion = await manager.findOne(Promotion, {
        where: { id },
        relations: ['etudiants', 'equipes', 'espacesPedagogiques']
      });

      if (!promotion) {
        throw new Error('Promotion non trouvée');
      }

      // 2. Dissocier les étudiants de la promotion (les garder mais sans promotion)
      if (promotion.etudiants && promotion.etudiants.length > 0) {
        await manager.query('UPDATE etudiants SET promotion_id = NULL WHERE promotion_id = ?', [id]);
      }

      // 3. Dissocier les équipes de la promotion (les garder mais sans promotion)
      if (promotion.equipes && promotion.equipes.length > 0) {
        await manager.query('UPDATE equipe SET promotionId = NULL WHERE promotionId = ?', [id]);
      }

      // 4. Dissocier les espaces pédagogiques de la promotion (les garder mais sans promotion)
      if (promotion.espacesPedagogiques && promotion.espacesPedagogiques.length > 0) {
        await manager.query('UPDATE espaces_pedagogiques SET promotion_id = NULL WHERE promotion_id = ?', [id]);
      }

      // 5. Supprimer la promotion
      await manager.delete(Promotion, { id });

      return {
        message: `Promotion ${promotion.anneeAcademique} - ${promotion.filiere} supprimée avec succès`
      };
    });
  }
}

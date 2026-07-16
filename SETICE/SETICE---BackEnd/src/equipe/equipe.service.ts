import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from 'src/promotion/promotion.entity';
import { Repository } from 'typeorm';
import { Equipe } from './equipe.entity';

@Injectable()
export class EquipeService {
  constructor(
    @InjectRepository(Equipe)
    private readonly equipeRepository: Repository<Equipe>,

    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}
  async createEquipe(nom: string, promotionId: number): Promise<Equipe> {
    // On vérifie que la promotion existe
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });
    if (!promotion) {
      throw new Error(`Promotion avec id ${promotionId} non trouvée`);
    }

    const equipe = this.equipeRepository.create({ nom, promotion });
    return this.equipeRepository.save(equipe);
  }
}

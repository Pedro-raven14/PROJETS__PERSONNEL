import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Travail } from './travail.entity';
import { CreateTravailDto } from './travail.dto';
import { EspacePedagogique } from '../espace_pedagogique/espace_pedagogique.entity';

@Injectable()
export class TravailService {
  constructor(
    @InjectRepository(Travail)
    private readonly travailRepository: Repository<Travail>,
  ) {}

  // Créer un travail lié à un espace
  async createTravail(espace: EspacePedagogique, dto: CreateTravailDto) {
    const travail = this.travailRepository.create({
      titre: dto.titre,
      description: dto.description,
      type: dto.type,
      debut: new Date(dto.dateDebut),
      fin: new Date(dto.dateFin),
      espace,
    });
    return this.travailRepository.save(travail);
  }

  // Récupérer tous les travaux d'un espace
  async findAllByEspace(espaceId: number) {
    return this.travailRepository.find({
      where: { espace: { id: espaceId } },
      relations: ['espace'],
      order: { debut: 'ASC' },
    });
  }
}

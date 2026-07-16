import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParametreRH } from '../entities/parametre-rh.entity';
import { CreateParametreRhDTO, UpdateParametreRhDTO } from '../dto/parametreRhDTO';

@Injectable()
export class ParametreRhService {
  constructor(
    @InjectRepository(ParametreRH)
    private readonly parametreRepo: Repository<ParametreRH>,
  ) {}

  // Créer ou mettre à jour les paramètres RH (singleton)
  async upsert(dto: CreateParametreRhDTO): Promise<ParametreRH> {
    let parametre = await this.parametreRepo.findOne({ where: {} });

    if (parametre) {
      Object.assign(parametre, dto);
    } else {
      parametre = this.parametreRepo.create(dto);
    }

    return this.parametreRepo.save(parametre);
  }

  async get(): Promise<ParametreRH> {
    const parametre = await this.parametreRepo.findOne({ where: {} });
    if (!parametre) {
      throw new NotFoundException('Aucun paramètre RH configuré');
    }
    return parametre;
  }

  async update(dto: UpdateParametreRhDTO): Promise<ParametreRH> {
    const parametre = await this.get();
    Object.assign(parametre, dto);
    return this.parametreRepo.save(parametre);
  }
}

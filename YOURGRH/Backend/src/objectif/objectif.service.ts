import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Objectif } from 'src/entities/objectif.entity';
import { Equipe } from 'src/entities/equipe.entity';
import { CreateObjectifDto, UpdateObjectifDto } from 'src/dto/objectifDTO';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class ObjectifService {
  constructor(
    @InjectRepository(Objectif)
    private readonly objectifRepo: Repository<Objectif>,

    @InjectRepository(Equipe)
    private readonly equipeRepo: Repository<Equipe>,
  ) {}

  async create(dto: CreateObjectifDto) {
    const equipe = await this.equipeRepo.findOne({ where: { equipeId: dto.equipeId } });
    if (!equipe) throw new NotFoundException(`Équipe introuvable`);

    const objectif = await this.objectifRepo.save(
      this.objectifRepo.create({ ...dto, equipe }),
    );
    return { message: `Objectif créé`, objectif };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.objectifRepo.findAndCount({
      relations: ['equipe'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  async getByEquipe(equipeId: number) {
    return this.objectifRepo.find({
      where: { equipe: { equipeId } },
      order: { date_debut: 'ASC' },
    });
  }

  async getById(objectifId: number) {
    const objectif = await this.objectifRepo.findOne({
      where: { objectifId },
      relations: ['equipe'],
    });
    if (!objectif) throw new NotFoundException(`Objectif introuvable`);
    return objectif;
  }

  async update(objectifId: number, dto: UpdateObjectifDto) {
    await this.getById(objectifId);
    await this.objectifRepo.update(objectifId, dto);
    return this.getById(objectifId);
  }

  async delete(objectifId: number) {
    await this.getById(objectifId);
    await this.objectifRepo.delete(objectifId);
    return { message: `Objectif supprimé` };
  }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departement } from 'src/entities/departement.entity';
import { CreateDepartementDto, UpdateDepartementDto } from 'src/dto/departementDTO';
import { paginate, buildResult } from 'src/common/pagination';

@Injectable()
export class DepartementService {
  constructor(
    @InjectRepository(Departement)
    private readonly departementRepo: Repository<Departement>,
  ) {}

  async create(dto: CreateDepartementDto) {
    const exists = await this.departementRepo.findOne({ where: { nom: dto.nom } });
    if (exists) {
      throw new ConflictException(`Le département "${dto.nom}" existe déjà`);
    }
    const departement = await this.departementRepo.save(
      this.departementRepo.create(dto),
    );
    return { message: `Département ${departement.nom} créé`, departement };
  }

  async getAll(page = 1, limit = 10) {
    const { skip, take } = paginate(page, limit);
    const [data, total] = await this.departementRepo.findAndCount({
      relations: ['equipes'],
      skip,
      take,
    });
    return buildResult(data, total, page, limit);
  }

  async getById(departId: number) {
    const departement = await this.departementRepo.findOne({
      where: { departId },
      relations: ['equipes'],
    });
    if (!departement) throw new NotFoundException(`Département introuvable`);
    return departement;
  }

  async update(departId: number, dto: UpdateDepartementDto) {
    await this.getById(departId);
    await this.departementRepo.update(departId, dto);
    return this.getById(departId);
  }

  async delete(departId: number) {
    await this.getById(departId);
    await this.departementRepo.delete(departId);
    return { message: `Département supprimé` };
  }
}

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeConge } from 'src/entities/typeconge.entity';
import { CreateTypeCongeDto } from 'src/dto/typecongeDTO';

@Injectable()
export class TypeCongesService {
  constructor(
    @InjectRepository(TypeConge)
    private readonly typeCongeRepo: Repository<TypeConge>,
  ) {}

  async create(dto: CreateTypeCongeDto) {
    const exists = await this.typeCongeRepo.findOne({ where: { nomType: dto.nomType } });
    if (exists) throw new ConflictException(`Le type de congé "${dto.nomType}" existe déjà`);

    const typeConge = await this.typeCongeRepo.save(this.typeCongeRepo.create(dto));
    return { message: `Type de congé ${typeConge.nomType} créé`, typeConge };
  }

  async getAll() {
    return this.typeCongeRepo.find();
  }

  async delete(typeCId: number) {
    const typeConge = await this.typeCongeRepo.findOne({ where: { typeCId } });
    if (!typeConge) throw new NotFoundException(`Type de congé introuvable`);
    await this.typeCongeRepo.delete(typeCId);
    return { message: `Type de congé supprimé` };
  }
}

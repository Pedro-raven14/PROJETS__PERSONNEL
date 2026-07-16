import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { createroleDTO } from 'src/dto/createroleDTO';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async createRole(dto: createroleDTO) {
    const existing = await this.roleRepo.findOne({ where: { nom: dto.nom } });
    if (existing) {
      throw new ConflictException('Ce rôle existe déjà au sein de l\'entreprise');
    }

    const role = await this.roleRepo.save({ nom: dto.nom });
    return {
      message: `Le rôle ${role.nom} a bien été enregistré`,
      role,
    };
  }

  async getAll() {
    return this.roleRepo.find();
  }
}

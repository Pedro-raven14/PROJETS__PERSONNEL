import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from 'src/entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(nom: string) {
    const nomUpper = nom.toUpperCase();
    const exists = await this.permissionRepo.findOne({ where: { nom: nomUpper } });
    if (exists) {
      throw new ConflictException(`La permission ${nomUpper} existe déjà`);
    }

    const permission = await this.permissionRepo.save({ nom: nomUpper });
    return {
      message: `Permission ${permission.nom} créée`,
      permission,
    };
  }

  async getAll() {
    return this.permissionRepo.find();
  }
}

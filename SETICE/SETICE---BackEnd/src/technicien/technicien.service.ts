
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technicien } from './technicien.entity';
import { CreateTechnicienDto } from './technicien.dto';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';

@Injectable()
export class TechnicienService {
  constructor(
    @InjectRepository(Technicien)
    private technicienRepo: Repository<Technicien>,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
  ) {}

  async create(dto: CreateTechnicienDto): Promise<Technicien> {
    const utilisateur = await this.utilisateurRepo.findOne({ where: { id: dto.utilisateurId } });
    if (!utilisateur) throw new NotFoundException('Utilisateur non trouvé');

    const technicien = this.technicienRepo.create({
      specialite: dto.specialite,
      utilisateur,
    });
    return this.technicienRepo.save(technicien);
  }

  findAll(): Promise<Technicien[]> {
    return this.technicienRepo.find({ relations: ['utilisateur'] });
  }

  async findOne(id: number): Promise<Technicien> {
    const technicien = await this.technicienRepo.findOne({ 
      where: { id }, 
      relations: ['utilisateur'] 
    });

    if (!technicien) {
      throw new NotFoundException(`Technicien avec l'id ${id} non trouvé`);
    }

    return technicien;
  }
}

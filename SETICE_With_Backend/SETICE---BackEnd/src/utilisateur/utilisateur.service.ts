import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

@Injectable()
export class UtilisateurService {
    constructor(
        @InjectRepository(Utilisateur)
        private readonly utilisateurRepository: Repository<Utilisateur>,
        
      ) {}
    async getUtilisateur(email: string) {
    return await this.utilisateurRepository.findOneBy({ ['email']: email });
  }
}

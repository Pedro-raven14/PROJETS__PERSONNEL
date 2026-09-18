import { ConflictException, Injectable } from '@nestjs/common';
import { Directeur } from './directeur.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';

import { hash } from 'bcrypt';
import { DirecteurDTO } from './directeur.dto';
import { UnifiedEmailService } from 'src/email/unified-email.service';

@Injectable()
export class DirecteurService {
  constructor(
    @InjectRepository(Directeur)
    private readonly directeRepository: Repository<Directeur>,
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    private unifiedEmailService: UnifiedEmailService,
  ) {}

  private async hashpassword(password: string) {
    const hashpassword = await hash(password, 9);
    return hashpassword;
  }

  async CreateDirecteur(directeurDTO: DirecteurDTO) {
    const { nom, prenom, email, password, telephone, bureau } = directeurDTO;

    const existingUser = await this.utilisateurRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const passHasher = await this.hashpassword(password);

    // const password = passHasher;

    const user = this.utilisateurRepository.create({
      nom,
      prenom,
      email,
      password: passHasher,
      telephone,
      role: 'directeur',
      mustChangePassword: false,
    });
    const savedUser = await this.utilisateurRepository.save(user);

    const student = await this.directeRepository.save({
      bureau,
      utilisateur: savedUser,
    });

    // Retourner les identifiants au frontend au lieu d'envoyer l'email ici
    return {
      directeur: student,
      user: savedUser,
      generatedPassword: password, // Le frontend se chargera de l'envoi d'email
    };
  }

  async deleteDirecteur(id: number): Promise<{ message: string }> {
    // Utiliser une transaction pour garantir l'intégrité
    return await this.directeRepository.manager.transaction(async (manager) => {
      // 1. Récupérer le directeur avec son utilisateur
      const directeur = await manager.findOne(Directeur, {
        where: { id },
        relations: ['utilisateur']
      });

      if (!directeur) {
        throw new Error('Directeur non trouvé');
      }

      const utilisateurId = directeur.utilisateur.id;

      // 2. Supprimer le directeur (pas de relations sortantes à gérer)
      await manager.delete(Directeur, { id });

      // 3. Supprimer l'utilisateur associé
      await manager.delete(Utilisateur, { id: utilisateurId });

      return {
        message: `Directeur ${directeur.utilisateur.prenom} ${directeur.utilisateur.nom} supprimé avec succès`
      };
    });
  }
}
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etudiant } from './etudiant.entity';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { hash } from 'bcrypt';
import { etudiantDTO } from './etudiant.dto';
import { UnifiedEmailService } from 'src/email/unified-email.service';

@Injectable()
export class EtudiantService {
  constructor(
    @InjectRepository(Etudiant)
    private readonly etudiantRepository: Repository<Etudiant>,
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private unifiedEmailService: UnifiedEmailService,
  ) {}

  private async hashpassword(password: string) {
    const hashpassword = await hash(password, 9);
    return hashpassword;
  }

  private generateRandomPassword(length: number = 12): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';

    // Assurer au moins un caractère de chaque type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(
      Math.floor(Math.random() * 26),
    );
    password += 'abcdefghijklmnopqrstuvwxyz'.charAt(
      Math.floor(Math.random() * 26),
    );
    password += '0123456789'.charAt(Math.floor(Math.random() * 10));
    password += '!@#$%^&*()_+'.charAt(Math.floor(Math.random() * 12));

    // Remplir le reste
    for (let i = 4; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Mélanger le mot de passe
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async CreateEtudiant(etudiant: etudiantDTO) {
    const {
      nom,
      prenom,
      email,
      telephone,
      matricule,
      centre,
      niveau,
      competences,
      portfolioUrl,
      githubUrl,
    } = etudiant;

    // const existingUser = await this.utilisateurRepository.findOne({ where: { email } });
    // if (existingUser) {
    //   throw new ConflictException('Cet email est déjà utilisé');
    // }
    const generatedPassword = this.generateRandomPassword(12);

    const passHasher = await this.hashpassword(generatedPassword);

    const password = passHasher;

    const user = this.utilisateurRepository.create({
      nom,
      prenom,
      email,
      password,
      telephone,
      role: 'etudiant',
      mustChangePassword: true,
    });
    const savedUser = await this.utilisateurRepository.save(user);

    const toSave: any = {
      matricule,
      centre,
      niveau,
      competences,
      portfolioUrl,
      githubUrl,
      utilisateur: savedUser,
    };
    if ((etudiant as any).promotionId) {
      const promo = await this.promotionRepository.findOne({ where: { id: (etudiant as any).promotionId } });
      if (promo) toSave.promotion = promo;
    }
    const student = await this.etudiantRepository.save(toSave);

    // Retourner les identifiants au frontend au lieu d'envoyer l'email ici
    return {
      student,
      user: savedUser,
      generatedPassword, // Le frontend se chargera de l'envoi d'email
    };
  }

  async getEtudiant() {
    return await this.etudiantRepository.find({
      relations: {
        utilisateur: true,
        promotion:true,
        equipe:true,
      },
    });
  }

  async deleteEtudiant(id: number): Promise<{ message: string }> {
    // Utiliser une transaction pour garantir l'intégrité
    return await this.etudiantRepository.manager.transaction(async (manager) => {
      // 1. Récupérer l'étudiant avec son utilisateur
      const etudiant = await manager.findOne(Etudiant, {
        where: { id },
        relations: ['utilisateur', 'soumissions', 'equipe']
      });

      if (!etudiant) {
        throw new Error('Étudiant non trouvé');
      }

      const utilisateurId = etudiant.utilisateur.id;

      // 2. Supprimer les soumissions individuelles de l'étudiant
      if (etudiant.soumissions && etudiant.soumissions.length > 0) {
        await manager.delete('Soumission', { etudiant: { id } });
      }

      // 3. Dissocier l'étudiant de son équipe (si il en a une)
      if (etudiant.equipe) {
        // Utiliser une requête SQL brute pour mettre à null la relation
        await manager.query('UPDATE etudiants SET equipe_id = NULL WHERE id = ?', [id]);
      }

      // 4. Supprimer l'étudiant
      await manager.delete(Etudiant, { id });

      // 5. Supprimer l'utilisateur associé
      await manager.delete(Utilisateur, { id: utilisateurId });

      return {
        message: `Étudiant ${etudiant.utilisateur.prenom} ${etudiant.utilisateur.nom} supprimé avec succès`
      };
    });
  }
}
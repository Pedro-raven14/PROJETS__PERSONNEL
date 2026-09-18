import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { Formateur } from './formateur.entity';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { FormateurDTO } from './formateur.dto';
import { UnifiedEmailService } from 'src/email/unified-email.service';


@Injectable()
export class FormateurService {
  constructor(
    @InjectRepository(Formateur)
    private readonly formateurRepository: Repository<Formateur>,

    @InjectRepository(Utilisateur)
    private readonly utilisateurRepository: Repository<Utilisateur>,
    private unifiedEmailService: UnifiedEmailService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, 9);
  }

  private generateRandomPassword(length = 12): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';

    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+'[Math.floor(Math.random() * 12)];

    for (let i = 4; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async createFormateur(dto: FormateurDTO): Promise<{
    formateur: Formateur;
    user: any;
    generatedPassword: string;
  }> {
    const { nom, prenom, email, telephone, specialite } = dto;

    const existingUser = await this.utilisateurRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const plainPassword = this.generateRandomPassword();
    const hashedPassword = await this.hashPassword(plainPassword);

    const utilisateur = this.utilisateurRepository.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone,
      role: 'formateur',
      mustChangePassword: true,
    } as Partial<Utilisateur>);

    const savedUtilisateur = await this.utilisateurRepository.save(utilisateur);

    const formateur = this.formateurRepository.create({
      specialite,
      utilisateur: savedUtilisateur,
    } as Partial<Formateur>);

    const savedFormateur = await this.formateurRepository.save(formateur);

    // Retourner les identifiants au frontend au lieu d'envoyer l'email ici
    return {
      formateur: savedFormateur,
      user: savedUtilisateur,
      generatedPassword: plainPassword, // Le frontend se chargera de l'envoi d'email
    };
  }

  async getFormateur() {
    return this.formateurRepository.find({
      relations: {
        utilisateur: true,
      },
    });
  }

  async deleteFormateur(id: number): Promise<{ message: string }> {
    // Utiliser une transaction pour garantir l'intégrité
    return await this.formateurRepository.manager.transaction(async (manager) => {
      // 1. Récupérer le formateur avec son utilisateur et ses espaces
      const formateur = await manager.findOne(Formateur, {
        where: { id },
        relations: ['utilisateur', 'espacesPedagogiques']
      });

      if (!formateur) {
        throw new Error('Formateur non trouvé');
      }

      const utilisateurId = formateur.utilisateur.id;

      // 2. Dissocier le formateur de ses espaces pédagogiques (mettre formateur_id à null)
      if (formateur.espacesPedagogiques && formateur.espacesPedagogiques.length > 0) {
        // Utiliser une requête SQL brute pour mettre à null la relation
        await manager.query('UPDATE espaces_pedagogiques SET formateur_id = NULL WHERE formateur_id = ?', [id]);
      }

      // 3. Supprimer le formateur
      await manager.delete(Formateur, { id });

      // 4. Supprimer l'utilisateur associé
      await manager.delete(Utilisateur, { id: utilisateurId });

      return {
        message: `Formateur ${formateur.utilisateur.prenom} ${formateur.utilisateur.nom} supprimé avec succès`
      };
    });
  }
}
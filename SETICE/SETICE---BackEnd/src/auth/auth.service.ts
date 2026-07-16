import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UtilisateurService } from 'src/utilisateur/utilisateur.service';
import { JwtService } from '@nestjs/jwt';
import { authDTO } from './authDTO';
import { compare } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Utilisateur)
    private readonly utilisateurRepo: Repository<Utilisateur>,
    private readonly utilisateurService: UtilisateurService,
    private readonly jwtService: JwtService,
  ) {}
  private async ispasswordvalid(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashPassword);
  }
  async login(authDTO: authDTO) {
    const { email, password } = authDTO;

    const user = await this.utilisateurService.getUtilisateur(email);

    //Admin
    if (user) {
      const ispasswordvalid = await this.ispasswordvalid(
        password,
        user.password,
      );
      if (!ispasswordvalid) {
        throw new UnauthorizedException(
          "Nom de l'Utilisateur ou mot de passe incorrecte",
        );
      }
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      };

      return {
        access_token: await this.jwtService.sign(payload),
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      };
    }
    return `Verifier que les informations sont correctes`;
  }
  async changePassword(userId: number, newPassword: string) {
    const user = await this.utilisateurRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // (optionnel mais recommandé)
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent de l’ancien',
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;

    await this.utilisateurRepo.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: false,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/*
  Le service Auth gère deux opérations fondamentales :
  1. register() : créer un compte
  2. login()    : vérifier les credentials et émettre un JWT

  Qu'est-ce qu'un JWT ?
  C'est un token signé contenant des informations (userId, username).
  Le client le stocke (localStorage ou cookie) et l'envoie à chaque requête.
  Le serveur peut vérifier la signature sans toucher la base de données.
  C'est donc stateless et très performant.
*/
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    /*
      Après l'inscription, on connecte directement l'utilisateur
      en retournant un token. C'est l'UX attendue.
    */
    const token = this.generateToken(user.id, user.username);
    return { user, token };
  }

  async login(dto: LoginDto) {
    // 1. Récupérer l'utilisateur avec son password hashé
    const user = await this.usersService.findByUsernameWithPassword(dto.username);

    if (!user) {
      /*
        On retourne 400 Bad Request (pas 401) pour les identifiants invalides.
        401 = "tu n'as pas de token" → déclenche l'intercepteur Axios côté client
        400 = "tes données sont incorrectes" → affiché dans le formulaire
        
        On garde le même message pour éviter l'énumération d'utilisateurs.
      */
      throw new BadRequestException('Identifiants invalides.');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new BadRequestException('Identifiants invalides.');
    }

    // 3. Générer le JWT
    const token = this.generateToken(user.id, user.username);

    // Exclure le password de la réponse
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  private generateToken(userId: string, username: string): string {
    /*
      Le "payload" du JWT contient les infos qu'on veut accéder rapidement.
      On met sub (subject) = userId, c'est une convention JWT standard.
    */
    return this.jwtService.sign({ sub: userId, username });
  }
}

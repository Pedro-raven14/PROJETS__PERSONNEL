/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH SERVICE — auth.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Le service contient toute la logique métier de l'authentification.
 * Le controller, lui, ne fait que recevoir les requêtes HTTP et déléguer
 * au service. C'est le principe de "Separation of Concerns" (SoC) :
 * chaque couche a une responsabilité unique.
 *
 * Architecture en couches :
 * HTTP Request → Controller → Service → Repository (base de données)
 *                                    ↑
 *                              C'est ici qu'on est
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  /**
   * L'injection de dépendances de NestJS (IoC — Inversion of Control) :
   * On déclare ce dont on a besoin dans le constructeur, NestJS s'occupe
   * de créer et d'injecter les instances automatiquement.
   *
   * @InjectRepository(User) → injecte le Repository TypeORM pour l'entité User.
   * Un Repository est une classe qui expose des méthodes CRUD : find, save, delete...
   */
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── REGISTER ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Vérifier si l'email est déjà utilisé
    const existingEmail = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingEmail) {
      /**
       * ConflictException → code HTTP 409 Conflict.
       * Plus précis qu'un 400 Bad Request : ça indique un conflit de ressource.
       */
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifier si le username est déjà pris
    const existingUsername = await this.usersRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Ce nom d\'utilisateur est déjà pris');
    }

    /**
     * Créer l'entité User.
     * ATTENTION : on passe le mot de passe en clair ici.
     * Le hook @BeforeInsert dans user.entity.ts se charge de le hacher
     * automatiquement AVANT que TypeORM l'insère en base.
     * C'est pour ça qu'on utilise create() + save() plutôt que insert() :
     * insert() bypasse les hooks TypeORM.
     */
    const user = this.usersRepository.create({
      fullName: dto.fullName,
      username: dto.username,
      email: dto.email.toLowerCase(),
      password: dto.password, // Sera haché par le hook @BeforeInsert
    });

    const savedUser = await this.usersRepository.save(user);

    // Générer les tokens et les retourner avec les infos utilisateur
    return this.generateTokensAndResponse(savedUser);
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    /**
     * Pour récupérer le mot de passe (select: false dans l'entité),
     * on doit utiliser addSelect() dans un QueryBuilder.
     */
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .addSelect('user.password') // Forcer l'inclusion du champ password
      .getOne();

    if (!user) {
      /**
       * Message volontairement vague : on ne dit pas si c'est l'email ou le
       * mot de passe qui est faux. Cela évite l'énumération d'emails.
       */
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    /**
     * bcrypt.compare(plainText, hash) :
     * Compare le mot de passe en clair fourni avec le hash stocké en base.
     * bcrypt ne peut pas être "décrypté" (c'est un hash, pas un chiffrement).
     * On RECRÉE le hash depuis le mot de passe clair et on compare.
     */
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return this.generateTokensAndResponse(user);
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    /**
     * Invalider le refresh token en le mettant à null en base.
     * Ainsi, même si le client garde encore son refresh token,
     * la prochaine tentative de renouvellement échouera.
     *
     * Note : l'access token reste valide jusqu'à son expiration (15 min max).
     * Pour une invalidation immédiate, il faudrait une liste noire (blacklist)
     * avec Redis. Pour un projet perso, 15 min est acceptable.
     */
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  // ─── REFRESH TOKEN ─────────────────────────────────────────────────────────

  async refreshTokens(user: User) {
    /**
     * Cette méthode est appelée depuis le controller après validation
     * par JwtRefreshStrategy. L'utilisateur est déjà authentifié.
     * On génère de nouveaux tokens (rotation des refresh tokens).
     */
    return this.generateTokensAndResponse(user);
  }

  // ─── HELPERS PRIVÉS ────────────────────────────────────────────────────────

  /**
   * generateTokensAndResponse()
   *
   * Méthode privée réutilisée par register(), login() et refreshTokens().
   * Elle :
   * 1. Génère un access token (courte durée)
   * 2. Génère un refresh token (longue durée)
   * 3. Stocke le hash du refresh token en base
   * 4. Retourne la réponse formatée pour le client
   *
   * C'est le pattern DRY (Don't Repeat Yourself).
   */
  private async generateTokensAndResponse(user: User) {
    /**
     * Le payload JWT contient ce qui sera encodé dans le token.
     * "sub" est la convention JWT pour l'identifiant du sujet (ici l'user ID).
     * On met le minimum nécessaire pour identifier l'utilisateur.
     */
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    /**
     * jwtService.signAsync() génère le JWT signé.
     * Le token encode le payload + expiration + signature (via JWT_SECRET).
     *
     * Access token : courte durée (15 min par défaut)
     * Refresh token : longue durée (7 jours), clé secrète DIFFÉRENTE
     */
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    /**
     * Stocker le hash du refresh token en base.
     * On utilise update() directement pour bypasser le hook @BeforeUpdate
     * qui tenterait de re-hasher le mot de passe (il est déjà haché).
     *
     * ATTENTION : on passe le token en clair, le hook @BeforeUpdate va le hacher.
     * On doit donc d'abord créer une instance User puis la sauvegarder.
     */
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * sanitizeUser()
   * Retourne un objet utilisateur sans les champs sensibles (password, refreshToken).
   * On contrôle manuellement ce qu'on envoie au client.
   */
  private sanitizeUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}

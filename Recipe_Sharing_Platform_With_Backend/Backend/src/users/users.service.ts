/**
 * ─────────────────────────────────────────────────────────────────────────────
 * USERS SERVICE — users.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gère les opérations sur les utilisateurs :
 * - Récupérer son profil (GET /users/me)
 * - Modifier son profil (PATCH /users/me)
 * - Voir le profil public d'un utilisateur (GET /users/:username)
 * - Voir ses recettes favorites (GET /users/me/favorites)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Favorite } from '../favorites/favorite.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  /**
   * Récupérer les informations de l'utilisateur connecté.
   * C'est une version "enrichie" du profil avec toutes les infos privées.
   */
  async getMe(userId: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Retourner sans les champs sensibles
    const { refreshToken, ...safeUser } = user as any;
    return safeUser;
  }

  /**
   * Modifier le profil de l'utilisateur connecté.
   *
   * On utilise Object.assign() pour appliquer les mises à jour de manière
   * dynamique, puis save() pour persister (et déclencher @BeforeUpdate).
   *
   * POURQUOI Object.assign + save() plutôt que update() ?
   * - update() ne déclenche PAS les hooks TypeORM (@BeforeUpdate)
   * - save() sur une entité existante fait un UPDATE et déclenche les hooks
   */
  async updateMe(userId: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Appliquer seulement les champs fournis (les undefined sont ignorés par assign)
    Object.assign(user, dto);

    const updatedUser = await this.usersRepository.save(user);

    // Exclure les champs sensibles de la réponse
    const { password, refreshToken, ...safeUser } = updatedUser as any;
    return safeUser;
  }

  /**
   * Profil public d'un utilisateur (visible par tous, même non connectés).
   * On ne retourne que les infos non-sensibles.
   */
  async getUserByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur "${username}" introuvable`);
    }

    /**
     * On ne retourne que les champs publics.
     * Pas de déstructuration qui laisse traîner des infos sensibles.
     */
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }

  /**
   * Récupérer les recettes favorites de l'utilisateur connecté.
   *
   * On utilise une jointure pour récupérer les détails des recettes
   * depuis la table favorites.
   */
  async getMyFavorites(userId: string) {
    /**
     * QueryBuilder pour une requête plus complexe avec des jointures.
     * Équivalent SQL :
     * SELECT recipe.*, user.* FROM favorites
     * JOIN recipes recipe ON favorites.recipeId = recipe.id
     * JOIN users user ON recipe.authorId = user.id
     * WHERE favorites.userId = :userId
     */
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      relations: {
        recipe: {
          author: true,
        },
      },
      order: { createdAt: 'DESC' }, // Plus récemment ajoutés en premier
    });

    // Retourner seulement les recettes (sans l'objet Favorite)
    return favorites.map((fav) => fav.recipe);
  }
}

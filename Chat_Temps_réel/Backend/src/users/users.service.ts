import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    /*
      @InjectRepository injecte le repository TypeORM pour l'entité User.
      C'est le pattern Repository : on ne touche jamais la DB directement,
      on passe toujours par le repository qui fait le lien ORM <-> SQL.
    */
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /*
    Crée un nouvel utilisateur.
    On hash le mot de passe AVANT de l'enregistrer.
    Le facteur de coût bcrypt de 12 est un bon équilibre sécurité/performance.
  */
  async create(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    // Vérifier si le username est déjà pris
    const existing = await this.usersRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Ce nom d\'utilisateur est déjà pris.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepository.create({
      username: dto.username,
      password: hashedPassword,
      avatarColor: dto.avatarColor || '#6c5ce7',
    });

    const saved = await this.usersRepository.save(user);

    /*
      On destructure pour exclure le password de la réponse.
      Ne JAMAIS retourner le hash du mot de passe dans une réponse API.
    */
    const { password: _, ...userWithoutPassword } = saved;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /*
    Utilisé par le service d'auth pour vérifier les credentials.
    Le "select: ['password']" est nécessaire car on a mis "select: false"
    sur la colonne password dans l'entité.
  */
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password')
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /*
    Met à jour le statut en ligne de l'utilisateur.
    Appelé par le Gateway Socket.io lors de la connexion/déconnexion.
  */
  async updateStatus(userId: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    await this.usersRepository.update({ id: userId }, { status });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'avatarColor', 'status', 'createdAt'],
    });
  }
}

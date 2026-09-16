import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { DirectConversation } from './entities/direct-conversation.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DirectConversation)
    private readonly convRepo: Repository<DirectConversation>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /*
    Retrouve ou crée une DirectConversation entre deux users.

    La convention "user1 < user2" alphabétiquement sur les IDs garantit
    l'unicité : peu importe qui initie, on trouve toujours la même ligne.
    
    À ce stade, AUCUNE room n'est créée — juste la liaison entre les deux users.
  */
  async getOrCreate(userA: User, userB: User): Promise<DirectConversation> {
    // Tri déterministe par ID pour éviter les doublons
    const [user1, user2] = userA.id < userB.id
      ? [userA, userB]
      : [userB, userA];

    const existing = await this.convRepo.findOne({
      where: { user1: { id: user1.id }, user2: { id: user2.id } },
    });
    if (existing) return existing;

    const conv = this.convRepo.create({ user1, user2, room: null });
    return this.convRepo.save(conv);
  }

  /*
    Toutes les conversations d'un user qui ont au moins UN message
    (c'est-à-dire celles qui ont une room associée).

    C'est ce qu'on affiche dans la sidebar "Messages Directs".
  */
  async findActiveConversations(userId: string): Promise<DirectConversation[]> {
    return this.convRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.user1', 'user1')
      .leftJoinAndSelect('conv.user2', 'user2')
      .leftJoinAndSelect('conv.room', 'room')
      .where(
        '(conv.user1_id = :userId OR conv.user2_id = :userId) AND conv.room_id IS NOT NULL',
        { userId },
      )
      .orderBy('room.createdAt', 'DESC')
      .getMany();
  }

  /*
    Crée la Room DM et l'associe à la DirectConversation.
    Appelé lors du PREMIER message entre les deux users.

    La room est marquée isDm=true pour la distinguer des salons normaux.
    Son nom est généré automatiquement depuis les deux IDs (format stable).
  */
  async createRoomForConversation(conv: DirectConversation): Promise<Room> {
    // Nom déterministe et unique basé sur les IDs
    const roomName = `dm_${conv.user1.id.slice(0, 8)}_${conv.user2.id.slice(0, 8)}`;

    const room = this.roomRepo.create({
      name: roomName,
      isPrivate: true,
      isDm: true,
      description: `Conversation privée`,
    });
    const savedRoom = await this.roomRepo.save(room);

    // Associer la room à la conversation
    conv.room = savedRoom;
    await this.convRepo.save(conv);

    return savedRoom;
  }

  /*
    Trouver une conversation par ID.
  */
  async findById(convId: string): Promise<DirectConversation | null> {
    return this.convRepo.findOne({ where: { id: convId } });
  }

  /*
    Recherche d'utilisateurs par username (pour le modal de recherche).
    Exclut l'utilisateur courant des résultats.
    Limite à 10 résultats.
  */
  async searchUsers(query: string, excludeUserId: string): Promise<User[]> {
    if (!query || query.trim().length < 1) return [];

    return this.userRepo.find({
      where: { username: ILike(`%${query.trim()}%`) },
      select: ['id', 'username', 'avatarColor', 'status'],
      take: 10,
    }).then(users => users.filter(u => u.id !== excludeUserId));
  }
}

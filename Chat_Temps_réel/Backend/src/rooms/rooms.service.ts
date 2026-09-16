import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async create(dto: CreateRoomDto, creator: User): Promise<Room> {
    const existing = await this.roomsRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Le salon "#${dto.name}" existe déjà.`);
    }

    const room = this.roomsRepository.create({
      name: dto.name,
      description: dto.description,
      isPrivate: dto.isPrivate ?? false,
      createdBy: creator,
    });

    return this.roomsRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    // On exclut les rooms DM — elles sont gérées par DmService
    return this.roomsRepository.find({
      where: { isDm: false },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException(`Salon introuvable.`);
    return room;
  }

  /*
    Initialise les salons par défaut si la base est vide.
    Appelé au démarrage de l'application.
  */
  async seedDefaultRooms(): Promise<void> {
    const count = await this.roomsRepository.count();
    if (count > 0) return; // Déjà initialisé

    const defaults = [
      { name: 'général',     description: 'Discussion générale', isPrivate: false },
      { name: 'tech',        description: 'Sujets techniques',   isPrivate: false },
      { name: 'random',      description: 'Discussion libre',    isPrivate: false },
      { name: 'design',      description: 'UI/UX et design',     isPrivate: false },
    ];

    for (const room of defaults) {
      await this.roomsRepository.save(this.roomsRepository.create(room));
    }
    console.log('✅ Salons par défaut créés.');
  }
}

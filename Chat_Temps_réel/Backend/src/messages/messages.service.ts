import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  /*
    Crée et sauvegarde un message.
    Appelé par le Gateway WebSocket quand un client émet "message:send".
  */
  async create(content: string, author: User, room: Room): Promise<Message> {
    const message = this.messagesRepository.create({ content, author, room });
    return this.messagesRepository.save(message);
  }

  /*
    Récupère les derniers messages d'un salon, paginés.
    On charge l'auteur (eager) pour avoir username/avatarColor.
    Le tri DESC + limit donne les X derniers, puis on inverse pour
    les afficher dans l'ordre chronologique côté client.
  */
  async findByRoom(roomId: string, limit = 50, before?: string): Promise<Message[]> {
    const qb = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .where('message.room_id = :roomId', { roomId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    /*
      Cursor-based pagination : si "before" est fourni (UUID du dernier message vu),
      on ne charge que les messages AVANT celui-ci.
      C'est plus performant que offset/limit sur les grandes tables.
    */
    if (before) {
      const cursor = await this.messagesRepository.findOne({ where: { id: before } });
      if (cursor) {
        qb.andWhere('message.createdAt < :date', { date: cursor.createdAt });
      }
    }

    const messages = await qb.getMany();
    return messages.reverse(); // Ordre chronologique pour l'affichage
  }

  async findById(id: string): Promise<Message | null> {
    return this.messagesRepository.findOne({
      where: { id },
      relations: ['author', 'room'],
    });
  }

  /*
    Seul l'auteur du message peut le modifier.
    On vérifie l'ownership AVANT de modifier.
  */
  async updateContent(id: string, newContent: string, requesterId: string): Promise<Message> {
    const message = await this.findById(id);
    if (!message) throw new NotFoundException('Message introuvable.');
    if (message.author.id !== requesterId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce message.');
    }

    message.content = newContent;
    message.isEdited = true;
    return this.messagesRepository.save(message);
  }

  async delete(id: string, requesterId: string): Promise<void> {
    const message = await this.findById(id);
    if (!message) throw new NotFoundException('Message introuvable.');
    if (message.author.id !== requesterId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce message.');
    }
    await this.messagesRepository.remove(message);
  }

  /*
    Ajoute ou retire une réaction à un message.
    Logique toggle : si l'utilisateur a déjà réagi avec cet emoji, on retire.
  */
  async toggleReaction(
    messageId: string,
    emoji: string,
    user: User,
  ): Promise<Message> {
    const message = await this.findById(messageId);
    if (!message) throw new NotFoundException('Message introuvable.');

    const existingIndex = message.reactions.findIndex(
      (r) => r.emoji === emoji && r.userId === user.id,
    );

    if (existingIndex !== -1) {
      // L'utilisateur a déjà réagi → on retire
      message.reactions.splice(existingIndex, 1);
    } else {
      // Nouvelle réaction
      message.reactions.push({ emoji, userId: user.id, username: user.username });
    }

    return this.messagesRepository.save(message);
  }
}

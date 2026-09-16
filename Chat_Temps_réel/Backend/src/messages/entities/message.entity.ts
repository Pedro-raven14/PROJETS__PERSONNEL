import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

/*
  La table "messages" est le cœur du chat.
  Chaque message appartient à :
  - Un utilisateur (author)
  - Un salon (room)

  On stocke aussi les réactions sous forme de JSON simple.
*/
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  /*
    ManyToOne avec eager:true = TypeORM charge automatiquement
    l'auteur à chaque requête sur les messages, sans avoir à
    faire un JOIN manuel. Pratique mais à utiliser avec parcimonie
    sur les grosses tables (preferer lazy loading en prod).
  */
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  /*
    Réactions stockées en JSONB (PostgreSQL).
    Format : [{ emoji: '👍', userId: 'uuid', username: 'Alice' }]
    Le type 'simple-json' fonctionne pour PostgreSQL ET MySQL.
  */
  @Column({ type: 'simple-json', default: '[]' })
  reactions: Array<{ emoji: string; userId: string; username: string }>;

  @Column({ default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

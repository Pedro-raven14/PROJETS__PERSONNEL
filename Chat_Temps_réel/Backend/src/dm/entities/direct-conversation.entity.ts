import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

/*
  DirectConversation = une conversation privée entre deux utilisateurs.

  Design choisi :
  - On crée l'enregistrement DirectConversation dès que l'user ouvre une fenêtre DM
    MAIS on ne crée la Room associée qu'au premier message.
  - Ainsi côté DB, une DirectConversation sans room = conversation "vide" (jamais de message)
  - Une DirectConversation avec room = conversation active

  Pourquoi ne pas juste utiliser Room avec isPrivate=true ?
  Parce qu'une Room privée n'a pas de notion de "deux participants fixes".
  DirectConversation lie explicitement deux users, ce qui permet de retrouver
  "toutes les conversations de l'user X" facilement.
*/
@Entity('direct_conversations')
export class DirectConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /*
    Les deux participants. Par convention, user1 est toujours celui
    dont l'id est alphabétiquement inférieur — ça évite les doublons
    (userA↔userB et userB↔userA seraient la même conversation).
  */
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user2_id' })
  user2: User;

  /*
    La Room associée — null tant qu'aucun message n'a été envoyé.
    OneToOne car une Room DM appartient à exactement une DirectConversation.
  */
  @OneToOne(() => Room, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room: Room | null;

  @CreateDateColumn()
  createdAt: Date;
}

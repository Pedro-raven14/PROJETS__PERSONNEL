import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/*
  La table "rooms" représente les salons de chat.
  Un salon peut être public (#général) ou privé (🔒équipe-core).
  Le createdBy pointe vers l'utilisateur qui a créé le salon.
*/
@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ nullable: true, length: 200 })
  description: string;

  @Column({ default: false })
  isPrivate: boolean;

  /*
    isDm : true si c'est une room de message direct (DM).
    Permet de la distinguer des salons normaux dans les queries.
  */
  @Column({ default: false })
  isDm: boolean;

  /*
    Relation Many-to-One : plusieurs salons peuvent être créés
    par le même utilisateur. On charge l'auteur en eager pour
    l'afficher sans query supplémentaire.
  */
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}

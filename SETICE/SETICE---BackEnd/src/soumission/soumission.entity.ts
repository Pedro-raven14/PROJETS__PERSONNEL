import { Equipe } from 'src/equipe/equipe.entity';
import { Etudiant } from 'src/etudiant/etudiant.entity';
import { Travail } from 'src/travail/travail.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';


@Entity()
export class Soumission {
  @PrimaryGeneratedColumn()
  id: number;

  // Toujours lié à un travail
  @ManyToOne(() => Travail, (travail) => travail.soumissions)
  travail: Travail;

  // Pour un travail INDIVIDUEL
  @ManyToOne(() => Etudiant, (etudiant) => etudiant.soumissions, {
    nullable: true,
  })
  @JoinColumn({ name: 'etudiant_id' })
  etudiant?: Etudiant;

  // Pour un travail COLLECTIF
  @ManyToOne(() => Equipe, (equipe) => equipe.soumissions, {
    nullable: true,
  })
  @JoinColumn({ name: 'equipe_id' })
  equipe?: Equipe;

  @Column('float')
  note: number;

  @Column({ nullable: true })
  commentaire?: string;

  @CreateDateColumn()
  dateSoumission: Date;
}

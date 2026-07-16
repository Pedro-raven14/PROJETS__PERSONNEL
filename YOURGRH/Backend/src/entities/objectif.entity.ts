import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Equipe } from './equipe.entity';

@Entity('Objectif')
export class Objectif {
  @PrimaryGeneratedColumn()
  objectifId!: number;

  @Column({ length: 255 })
  titre!: string;

  @Column({ type: 'date' })
  date_debut!: Date;

  @Column({ type: 'date' })
  date_fin!: Date;

  @Column({ length: 50, default: 'EN_COURS' })
  status!: string; // EN_COURS | ATTEINT | NON_ATTEINT | ANNULE

  @Column({ default: 0 })
  points!: number;

  // Un objectif est lié à une équipe
  @ManyToOne(() => Equipe, (equipe) => equipe.objectifs, { nullable: false })
  @JoinColumn({ name: 'equipeId' })
  equipe!: Equipe;
}

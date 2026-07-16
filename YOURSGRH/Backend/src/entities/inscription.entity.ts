import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Formation } from './formation.entity';

@Entity('Inscription')
export class Inscription {
  // Clé primaire composite (userId, formationId) — cohérente avec la table existante
  @PrimaryColumn()
  userId!: number;

  @PrimaryColumn()
  formationId!: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date_inscription!: Date;

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  employee!: Employee;

  @ManyToOne(() => Formation, (f) => f.inscriptions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formationId' })
  formation!: Formation;
}

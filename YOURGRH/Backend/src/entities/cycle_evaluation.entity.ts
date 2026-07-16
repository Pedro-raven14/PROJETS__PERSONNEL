import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Evaluation } from './evaluation.entity';

@Entity('CycleEvaluation')
export class CycleEvaluation {
  @PrimaryGeneratedColumn()
  cycleId!: number;

  @Column({ length: 150 })
  nom!: string;

  @Column({ type: 'date' })
  date_debut!: Date;

  @Column({ type: 'date' })
  date_fin!: Date;

  // Critères d'évaluation définis par le RH (ex: ["Communication", "Technique", "Ponctualité"])
  @Column({ type: 'simple-array', nullable: true })
  criteres!: string[];

  // Un cycle contient plusieurs évaluations
  @OneToMany(() => Evaluation, (eval_) => eval_.cycle)
  evaluations!: Evaluation[];
}

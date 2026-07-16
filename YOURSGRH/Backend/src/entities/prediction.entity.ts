import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Prediction')
export class Prediction {
  @PrimaryGeneratedColumn()
  predictionId!: number;

  @Column({ length: 100 })
  type!: string; // PROMOTION | RISQUE_DEPART | RECOMMANDATION_FORMATION | etc.

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({ type: 'text' })
  message!: string; // JSON stringifié des résultats complets (iaResponse.resultats)

  // L'employé (RH/Admin) qui a lancé la prédiction
  @ManyToOne(() => Employee, (emp) => emp.predictionsLancees, { nullable: false })
  @JoinColumn({ name: 'lancePar' })
  lanceur!: Employee;

  // Les employés concernés par le résultat de la prédiction
  @ManyToMany(() => Employee, (emp) => emp.predictionsConcernees)
  @JoinTable({
    name: 'PredictionEmploye',
    joinColumn:        { name: 'predictionId' },
    inverseJoinColumn: { name: 'userId' },
  })
  employesConcernes!: Employee[];
}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { TypeConge } from './typeconge.entity';

@Entity('Conge')
export class Conge {
  @PrimaryGeneratedColumn()
  congeId!: number;

  @Column({ length: 500, nullable: true })
  commentaire!: string;

  @Column({ type: 'date' })
  date_debut!: Date;

  @Column({ type: 'date' })
  date_fin!: Date;

  @Column({ length: 50, default: 'EN_ATTENTE' })
  statut!: string; // EN_ATTENTE | APPROUVE | REFUSE

  // L'employé qui demande le congé
  @ManyToOne(() => Employee, (emp) => emp.congesDemandes, { nullable: false })
  @JoinColumn({ name: 'demandeurId' })
  demandeur!: Employee;

  // L'employé (manager/RH) qui valide le congé
  @ManyToOne(() => Employee, (emp) => emp.congesValides, { nullable: true })
  @JoinColumn({ name: 'validateurId' })
  validateur!: Employee;

  // Le type de congé
  @ManyToOne(() => TypeConge, (type) => type.conges, { nullable: false })
  @JoinColumn({ name: 'typeCId' })
  typeConge!: TypeConge;
}

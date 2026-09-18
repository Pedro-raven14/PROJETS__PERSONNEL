import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Competence } from './competence.entity';

@Entity('EmployeCompetence')
export class EmployeCompetence {
  @PrimaryGeneratedColumn()
  id!: number;

  // Niveau de maîtrise de l'employé sur cette compétence (1 à 5)
  // 1 = débutant, 2 = basique, 3 = intermédiaire, 4 = avancé, 5 = expert
  @Column({ type: 'int', default: 1 })
  niveau!: number;

  @ManyToOne(() => Employee, (emp) => emp.competences, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  employee!: Employee;

  @ManyToOne(() => Competence, (comp) => comp.employeCompetences, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competenceId' })
  competence!: Competence;
}

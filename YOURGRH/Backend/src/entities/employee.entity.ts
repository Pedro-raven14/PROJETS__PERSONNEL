import {
  Column, Entity, JoinColumn, JoinTable,
  ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Equipe } from './equipe.entity';
import { Conge } from './conge.entity';
import { Contrat } from './contrat.entity';
import { Evaluation } from './evaluation.entity';
import { Formation } from './formation.entity';
import { Notification } from './notification.entity';
import { Prediction } from './prediction.entity';
import { EmployeCompetence } from './employe_competence.entity';

@Entity('Employee')
export class Employee {
  @PrimaryGeneratedColumn()
  userId!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column({ length: 100 })
  prenom!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column()
  password!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 150, nullable: true })
  poste!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_embauche!: Date;

  @Column({ default: 0 })
  soldeConges!: number;

  @Column({ default: true })
  mustChangePassword!: boolean;

  // --- Relations ---

  @ManyToOne(() => Role, (role) => role.employees, { nullable: false })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @ManyToMany(() => Permission, (permission) => permission.employees)
  @JoinTable({ name: 'EmployePermission' })
  permissions!: Permission[];

  // Équipe (optionnelle — assignée après la création si besoin)
  @ManyToOne(() => Equipe, (equipe) => equipe.employes, { nullable: true })
  @JoinColumn({ name: 'equipeId' })
  equipe!: Equipe | null;

  @OneToMany(() => Conge, (conge) => conge.demandeur)
  congesDemandes!: Conge[];

  @OneToMany(() => Conge, (conge) => conge.validateur)
  congesValides!: Conge[];

  @OneToMany(() => Contrat, (contrat) => contrat.employee)
  contrats!: Contrat[];

  @OneToMany(() => Evaluation, (eval_) => eval_.employee)
  evaluations!: Evaluation[];

  @ManyToMany(() => Formation, (formation) => formation.employes)
  formations!: Formation[];

  @OneToMany(() => Notification, (notif) => notif.employee)
  notifications!: Notification[];

  // Prédictions lancées par cet employé (RH/Admin)
  @OneToMany(() => Prediction, (pred) => pred.lanceur)
  predictionsLancees!: Prediction[];

  // Prédictions dont cet employé est la cible
  @ManyToMany(() => Prediction, (pred) => pred.employesConcernes)
  predictionsConcernees!: Prediction[];

  // Compétences de l'employé avec leur niveau
  @OneToMany(() => EmployeCompetence, (ec) => ec.employee)
  competences!: EmployeCompetence[];
}

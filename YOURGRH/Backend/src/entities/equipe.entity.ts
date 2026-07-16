import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Departement } from './departement.entity';
import { Employee } from './employee.entity';
import { Objectif } from './objectif.entity';

@Entity('Equipe')
export class Equipe {
  @PrimaryGeneratedColumn()
  equipeId!: number;

  @Column({ length: 150 })
  nom!: string;

  @Column({ default: 0 })
  rendement!: number;

  @ManyToOne(() => Departement, (dept) => dept.equipes, { nullable: false })
  @JoinColumn({ name: 'departId' })
  departement!: Departement;

  // Manager de l'équipe (un employé avec rôle MANAGER)
  @ManyToOne(() => Employee, { nullable: true, eager: false })
  @JoinColumn({ name: 'managerId' })
  manager!: Employee | null;

  @OneToMany(() => Employee, (emp) => emp.equipe)
  employes!: Employee[];

  @OneToMany(() => Objectif, (obj) => obj.equipe)
  objectifs!: Objectif[];
}

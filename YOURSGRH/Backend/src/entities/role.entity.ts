import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn()
  roleId!: number;

  @Column({ unique: true, length: 100 })
  nom!: string;

  @OneToMany(() => Employee, (employee) => employee.role)
  employees!: Employee[];
}

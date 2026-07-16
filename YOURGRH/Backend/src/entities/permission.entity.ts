import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Permission')
export class Permission {
  @PrimaryGeneratedColumn()
  permissionId!: number;

  @Column({ unique: true, length: 100 })
  nom!: string;

  @ManyToMany(() => Employee, (employee) => employee.permissions)
  employees!: Employee[];
}

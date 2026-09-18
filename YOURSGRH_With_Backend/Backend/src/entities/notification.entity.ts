import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Notification')
export class Notification {
  @PrimaryGeneratedColumn()
  notifId!: number;

  @Column({ length: 500 })
  message!: string;

  @Column({ length: 100 })
  type!: string; // CONGE | EVALUATION | FORMATION | SYSTEME | etc.

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({ default: false })
  lu!: boolean;

  // La notification appartient à un employé
  @ManyToOne(() => Employee, (emp) => emp.notifications, { nullable: false })
  @JoinColumn({ name: 'userId' })
  employee!: Employee;
}

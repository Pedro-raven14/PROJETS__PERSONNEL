import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Rapport')
export class Rapport {
  @PrimaryGeneratedColumn()
  rapportId!: number;

  @Column({ length: 255 })
  titre!: string;

  // EFFECTIFS | CONGES | FORMATIONS | EVALUATIONS | COMPLET
  @Column({ length: 50 })
  type!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_generation!: Date;

  // URL Supabase Storage du PDF généré
  @Column({ nullable: true })
  documentPath!: string;

  // L'employé (RH/Admin) qui a généré le rapport
  @ManyToOne(() => Employee, { nullable: true, eager: false })
  @JoinColumn({ name: 'genereParId' })
  generePar!: Employee;
}

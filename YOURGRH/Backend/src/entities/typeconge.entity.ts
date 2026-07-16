import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Conge } from './conge.entity';

@Entity('TypeConge')
export class TypeConge {
  @PrimaryGeneratedColumn()
  typeCId!: number;

  @Column({ unique: true, length: 100 })
  nomType!: string;

  /**
   * Si true → ce type de congé entraîne une déduction sur le salaire (congé non payé, absence).
   * Si false → pas de déduction (congé annuel payé, congé maladie, maternité...).
   */
  @Column({ default: false })
  impacte_salaire!: boolean;

  // Un type de congé peut concerner plusieurs congés
  @OneToMany(() => Conge, (conge) => conge.typeConge)
  conges!: Conge[];
}

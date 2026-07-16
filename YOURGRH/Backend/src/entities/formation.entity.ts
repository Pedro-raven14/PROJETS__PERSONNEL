import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Competence } from './competence.entity';
import { Inscription } from './inscription.entity';

@Entity('Formation')
export class Formation {
  @PrimaryGeneratedColumn()
  formationId!: number;

  @Column({ length: 255 })
  titre!: string;

  @Column({ length: 1000, nullable: true })
  description!: string;

  @Column({ type: 'int', default: 0 })
  heures_par_jour!: number;

  @Column({ type: 'int', default: 0 })
  duree!: number; // calculé : nb_jours_ouvres (lun-ven) * heures_par_jour

  @Column({ length: 50, default: 'DÉBUTANT' })
  niveau!: string; // DÉBUTANT | INTERMÉDIAIRE | AVANCÉ

  @Column({ type: 'date' })
  date_debut!: Date;

  @Column({ type: 'date' })
  date_fin!: Date;

  @Column({ type: 'int', default: 0 })
  capacite!: number;

  // Relation via table Inscription (avec date_inscription)
  @OneToMany(() => Inscription, (ins) => ins.formation)
  inscriptions!: Inscription[];

  // Accès direct aux employés inscrits (pour compatibilité avec le code existant)
  @ManyToMany(() => Employee, (emp) => emp.formations)
  @JoinTable({
    name: 'Inscription',
    joinColumn:        { name: 'formationId' },
    inverseJoinColumn: { name: 'userId' },
  })
  employes!: Employee[];

  // Compétences ciblées par cette formation (ManyToMany)
  @ManyToMany(() => Competence, (comp) => comp.formations, { eager: false })
  @JoinTable({
    name: 'FormationCompetence',
    joinColumn:        { name: 'formationId' },
    inverseJoinColumn: { name: 'competenceId' },
  })
  competences!: Competence[];
}

import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeCompetence } from './employe_competence.entity';
import { Formation } from './formation.entity';

@Entity('Competence')
export class Competence {
  @PrimaryGeneratedColumn()
  competenceId!: number;

  // Nom unique de la compétence (ex: "JavaScript", "Leadership")
  @Column({ unique: true, length: 150 })
  nom!: string;

  // Catégorie optionnelle (ex: "Technique", "Soft skill", "Management")
  @Column({ length: 100, nullable: true })
  categorie!: string;

  @OneToMany(() => EmployeCompetence, (ec) => ec.competence)
  employeCompetences!: EmployeCompetence[];

  // Formations qui ciblent cette compétence
  @ManyToMany(() => Formation, (f) => f.competences)
  formations!: Formation[];
}

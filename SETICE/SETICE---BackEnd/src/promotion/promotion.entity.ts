import { Equipe } from 'src/equipe/equipe.entity';
import { EspacePedagogique } from 'src/espace_pedagogique/espace_pedagogique.entity';
import { Etudiant } from 'src/etudiant/etudiant.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'annee_academique', length: 9 })
  anneeAcademique: string; // Format: "2025-2026"

  @Column({ length: 100 })
  filiere: string;

  @Column({ type: 'text', nullable: true })
  options: string;

  @Column({ name: 'date_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @OneToMany(()=> Etudiant,etudiant=>etudiant.promotion)
  etudiants:Etudiant[]

  @OneToMany(()=> Equipe, equipe=>equipe.promotion)
  equipes:Equipe[]
  // Relations
//   @OneToMany(() => InscriptionPromotion, inscription => inscription.promotion)
//   inscriptions: InscriptionPromotion[];

  @OneToMany(() => EspacePedagogique, espace => espace.promotion)
  espacesPedagogiques: EspacePedagogique[];
}
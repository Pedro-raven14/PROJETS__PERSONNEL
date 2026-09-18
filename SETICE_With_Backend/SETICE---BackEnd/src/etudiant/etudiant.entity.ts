// src/entities/etudiant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

// import { InscriptionPromotion } from './inscription-promotion.entity';
// import { MembreEquipe } from './membre-equipe.entity';
// import { Classement } from './classement.entity';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Equipe } from 'src/equipe/equipe.entity';
import { Soumission } from 'src/soumission/soumission.entity';

@Entity('etudiants')
export class Etudiant {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Utilisateur, (utilisateur) => utilisateur.etudiant)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  @Column({ unique: true, length: 50 })
  matricule: string;

  @Column({ length: 100 })
  centre: string;

  @Column({ length: 50 })
  niveau: string;

  @Column({ type: 'json', nullable: true })
  competences: any; // ou string[] ou {nom: string, niveau: string}[]

  @Column({ name: 'portfolio_url', length: 500, nullable: true })
  portfolioUrl: string;

  @Column({ name: 'github_url', length: 500, nullable: true })
  githubUrl: string;


  @ManyToOne(()=>Promotion,promotion=>promotion.etudiants)
  @JoinColumn({ name: 'promotion_id' }) // FK en base
  promotion: Promotion

  
  @ManyToOne(() => Equipe, (equipe) => equipe.etudiants, { nullable: true })
  equipe?: Equipe;

  // Un étudiant peut avoir plusieurs soumissions (travaux individuels)
  @OneToMany(() => Soumission, (soumission) => soumission.etudiant)
  soumissions: Soumission[];

  // Relations
  //   @OneToMany(() => InscriptionPromotion, inscription => inscription.etudiant)
  //   inscriptionsPromotions: InscriptionPromotion[];

  //   @OneToMany(() => MembreEquipe, membre => membre.etudiant)
  //   membresEquipes: MembreEquipe[];

  //   @OneToOne(() => Classement, classement => classement.etudiant)
  //   classement: Classement;
}

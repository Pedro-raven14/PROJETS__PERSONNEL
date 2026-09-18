import { Formateur } from 'src/formateur/formateur.entity';
import { Etudiant } from 'src/etudiant/etudiant.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ChildEntity } from 'typeorm';
import { Directeur } from 'src/directeur/directeur.entity';


@Entity('utilisateurs')
export class Utilisateur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  password: string;

  @Column({ length: 20, nullable: true })
  telephone: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ name: 'date_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @Column({
    type: 'enum',
    enum: ['etudiant', 'formateur', 'directeur'],
    nullable: false
  })
  role: string;

  @Column({ name: 'must_change_password', default: false })
  mustChangePassword: boolean;



  // Relations vers les entités filles (optionnelles selon le rôle)
  @OneToOne(() => Etudiant, etudiant => etudiant.utilisateur, { nullable: true })
  etudiant?: Etudiant;

  @OneToOne(() => Formateur, formateur => formateur.utilisateur, { nullable: true })
  formateur?: Formateur;

  @OneToOne(() => Directeur, directeur => directeur.utilisateur, { nullable: true })
  directeur?: Directeur;
}
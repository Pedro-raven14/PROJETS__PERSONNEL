import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ParametreRH')
export class ParametreRH {
  @PrimaryGeneratedColumn()
  parametreId!: number;

  // Informations de l'entreprise
  @Column({ length: 150, nullable: true })
  nom_entreprise!: string;

  @Column({ length: 255, nullable: true })
  adresse_entreprise!: string;

  @Column({ length: 255, nullable: true })
  email!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  // Nombre de jours de congés annuels accordés par défaut
  @Column({ type: 'int', default: 30 })
  taux_conges_annuels!: number;

  // Solde de congés initial attribué à un nouvel employé
  @Column({ type: 'int', default: 0 })
  solde_conges_initial!: number;

  // Délai minimum (en jours) entre la demande et la date de début du congé
  @Column({ type: 'int', default: 3 })
  nb_jours_preavis_conge!: number;
}

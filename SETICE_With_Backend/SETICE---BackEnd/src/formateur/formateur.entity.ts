import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Utilisateur } from 'src/utilisateur/utilisateur.entity';
import { EspacePedagogique } from 'src/espace_pedagogique/espace_pedagogique.entity';

@Entity('formateurs')
export class Formateur {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Utilisateur, (utilisateur) => utilisateur.formateur)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  @Column({ length: 100 })
  specialite: string;

  @OneToMany(() => EspacePedagogique, (ep) => ep.formateur)
  espacesPedagogiques: EspacePedagogique[];
}

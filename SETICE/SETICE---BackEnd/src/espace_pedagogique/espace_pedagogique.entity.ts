import { Formateur } from 'src/formateur/formateur.entity';
import { Matiere } from 'src/matiere/matiere.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Travail } from 'src/travail/travail.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('espaces_pedagogiques')
export class EspacePedagogique {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 200 })
  nom: string;

  // @Column({ length: 100 })
  // matiere: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Formateur, (formateur) => formateur.espacesPedagogiques, {
    nullable: true,
  })
  @JoinColumn({ name: 'formateur_id' })
  formateur: Formateur | null;

  @ManyToOne(() => Promotion, (promotion) => promotion.espacesPedagogiques, {
    nullable: true,
  })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion | null;

  @ManyToOne(() => Matiere, (matiere) => matiere.espacesPedagogiques, {
    nullable: true,
  })
  @JoinColumn({ name: 'matiere_id' })
  matiere: Matiere | null;

  @OneToMany(() => Travail, (travail) => travail.espace)
  travaux: Travail[];

  @Column({
    name: 'date_creation',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateCreation: Date;

  // Relations
  //   @OneToMany(() => Equipe, equipe => equipe.espacePedagogique)
  //   equipes: Equipe[];

  //   @OneToMany(() => Defi, defi => defi.espacePedagogique)
  //   defis: Defi[];
}

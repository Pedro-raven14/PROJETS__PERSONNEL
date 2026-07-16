import { EspacePedagogique } from 'src/espace_pedagogique/espace_pedagogique.entity';
import { Soumission } from 'src/soumission/soumission.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

export enum TypeTravail {
  INDIVIDUEL = 'INDIVIDUEL',
  COLLECTIF = 'COLLECTIF',
}

@Entity()
export class Travail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TypeTravail,
  })
  type: TypeTravail;

  // Un travail a plusieurs soumissions
  @OneToMany(() => Soumission, (soumission) => soumission.travail)
  soumissions: Soumission[];

  @Column({ type: 'date' })
  debut: Date;

  @Column({ type: 'date'})
  fin: Date;

  @ManyToOne(() => EspacePedagogique, (espace) => espace.travaux, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  espace: EspacePedagogique;
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Equipe } from './equipe.entity';

@Entity('Departement')
export class Departement {
  @PrimaryGeneratedColumn()
  departId!: number;

  @Column({ unique: true, length: 150 })
  nom!: string;

  @Column({ length: 255, nullable: true })
  description!: string;

  @Column({ default: 0 })
  rendement!: number;

  // Un département contient plusieurs équipes
  @OneToMany(() => Equipe, (equipe) => equipe.departement)
  equipes!: Equipe[];
}

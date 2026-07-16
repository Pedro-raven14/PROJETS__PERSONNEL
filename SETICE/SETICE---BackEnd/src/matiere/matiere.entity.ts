import { EspacePedagogique } from 'src/espace_pedagogique/espace_pedagogique.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('matiere')
export class Matiere {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nom: string;

  @OneToMany(() => EspacePedagogique, (ep) => ep.matiere)
  espacesPedagogiques: EspacePedagogique[];

}

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';

@Entity('techniciens')
export class Technicien {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  specialite: string;

  @OneToOne(() => Utilisateur)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;
}

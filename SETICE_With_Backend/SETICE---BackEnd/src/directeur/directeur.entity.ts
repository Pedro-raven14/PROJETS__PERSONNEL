import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { Utilisateur } from 'src/utilisateur/utilisateur.entity';

@Entity('directeurs')
export class Directeur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  bureau: string;

  @OneToOne(() => Utilisateur, utilisateur => utilisateur.directeur)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;
}

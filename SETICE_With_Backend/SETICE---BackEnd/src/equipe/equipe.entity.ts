import { Etudiant } from 'src/etudiant/etudiant.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Soumission } from 'src/soumission/soumission.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';


@Entity()
export class Equipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  // Une équipe a plusieurs étudiants
  @OneToMany(() => Etudiant, (etudiant) => etudiant.equipe)
  etudiants: Etudiant[];

  // Une équipe peut avoir plusieurs soumissions (travaux collectifs)
  @OneToMany(() => Soumission, (soumission) => soumission.equipe)
  soumissions: Soumission[];

  @ManyToOne(() => Promotion, (promotion) => promotion.equipes,)
  @JoinColumn({ name: 'promotionId' })
    promotion: Promotion;

}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/*
  Une entité TypeORM = une table en base de données.
  Chaque décorateur @Column() correspond à une colonne SQL.

  Pourquoi séparer username et password ?
  Parce que le username s'affiche publiquement (dans les messages),
  tandis que le password ne doit JAMAIS quitter le serveur en clair.
*/
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  username: string;

  /*
    Le mot de passe est stocké hashé avec bcrypt.
    On le marque "select: false" pour qu'il ne soit JAMAIS
    retourné par défaut dans les requêtes SELECT.
    C'est une bonne pratique de sécurité.
  */
  @Column({ select: false })
  password: string;

  /*
    Couleur de l'avatar choisie à l'inscription.
    On stocke le code hexadécimal (#6c5ce7).
  */
  @Column({ default: '#6c5ce7', length: 7 })
  avatarColor: string;

  /*
    Statut en ligne géré dynamiquement par Socket.io,
    mais on le persiste aussi en base pour l'afficher
    quand l'utilisateur n'est pas connecté.
  */
  @Column({ default: 'offline' })
  status: 'online' | 'away' | 'offline';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

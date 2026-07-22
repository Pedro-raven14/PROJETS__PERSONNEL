import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  shortCode: string;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

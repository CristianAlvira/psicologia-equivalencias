import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('refresh_tokens')
@Index(['user_id', 'is_active'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column('text')
  token: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: false })
  remember_me: boolean;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;
}

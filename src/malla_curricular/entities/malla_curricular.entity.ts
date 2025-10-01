import { Programa } from '@/programas/entities/programa.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mallas_curriculares')
export class MallaCurricular {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  version: string;

  @Column({ name: 'programa_id' })
  programaId: number;

  @ManyToOne(() => Programa, (programa) => programa.mallas_curriculares, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'programa_id' })
  programa: Programa;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

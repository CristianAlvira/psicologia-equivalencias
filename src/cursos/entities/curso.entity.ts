import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Semestre } from '../enums/semestre.enum';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'int' })
  creditos: number;

  @Column({ type: 'enum', enum: Semestre })
  semestre: Semestre;

  @ManyToOne(() => MallaCurricular, (malla) => malla.cursos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'malla_curricular_id' })
  mallaCurricular: MallaCurricular;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

import { Curso } from '@/cursos/entities/curso.entity';
import { Programa } from '@/programas/entities/programa.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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

  @OneToMany(() => Curso, (curso) => curso.mallaCurricular, {
    cascade: ['remove'], // Solo cascade remove, no insert/update automático
  })
  cursos: Curso[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

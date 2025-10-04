import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Curso } from '@/cursos/entities/curso.entity';
import { EquivalenciaGrupo } from './equivalencia-grupo.entity';

export enum LadoEquivalencia {
  ANTIGUA = 'ANTIGUA',
  NUEVA = 'NUEVA',
}

@Entity('equivalencia_items')
export class EquivalenciaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grupo_id' })
  grupoId: number;

  @Column({ name: 'curso_id' })
  cursoId: number;

  @Column({
    type: 'enum',
    enum: LadoEquivalencia,
  })
  lado: LadoEquivalencia;

  @ManyToOne(() => EquivalenciaGrupo, (grupo) => grupo.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'grupo_id' })
  grupo: EquivalenciaGrupo;

  @ManyToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

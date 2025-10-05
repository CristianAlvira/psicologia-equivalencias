import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Semestre } from '../enums/semestre.enum';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';
import { SeleccionEstudiante } from '@/seleccion-estudiante/entities/seleccion-estudiante.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 450 })
  nombre: string;

  @Column({ type: 'int' })
  creditos: number;

  @Column({ type: 'enum', enum: Semestre })
  semestre: Semestre;

  @Column({ name: 'malla_curricular_id' })
  mallaCurricularId: number;

  @ManyToOne(() => MallaCurricular, (malla) => malla.cursos, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'malla_curricular_id' })
  mallaCurricular: MallaCurricular;

  @OneToMany(
    () => SeleccionEstudiante,
    (seleccionEstudiante) => seleccionEstudiante.curso_antiguo,
  )
  selecciones_estudiantes: SeleccionEstudiante[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

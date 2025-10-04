import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from '@/usuarios/entities/usuario.entity';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';
import { Curso } from '@/cursos/entities/curso.entity';
import { EquivalenciaGrupo } from './equivalencia-grupo.entity';

export enum EstadoHomologacion {
  HOMOLOGADO = 'HOMOLOGADO',
  INCOMPLETO = 'INCOMPLETO',
  NO_APLICA = 'NO_APLICA',
}

@Entity('resultados_homologacion')
@Index(['estudianteId', 'mallaAntiguaId', 'mallaNuevaId'], { unique: false })
export class ResultadoHomologacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @Column({ name: 'malla_antigua_id' })
  mallaAntiguaId: number;

  @Column({ name: 'malla_nueva_id' })
  mallaNuevaId: number;

  @Column({ name: 'curso_nuevo_id' })
  cursoNuevoId: number;

  @Column({
    type: 'enum',
    enum: EstadoHomologacion,
  })
  estado: EstadoHomologacion;

  @Column({ type: 'text' })
  observacion: string;

  @Column({ name: 'grupo_id', nullable: true })
  grupoId?: number;

  @Column({ type: 'json', name: 'cursos_antiguos_presentes' })
  cursosAntiguosPresentes: number[];

  @Column({ type: 'json', name: 'cursos_antiguos_faltantes' })
  cursosAntiguosFaltantes: number[];

  @Column({ type: 'json', name: 'cursos_antiguos_seleccionados' })
  cursosAntiguosSeleccionados: number[];

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Usuario;

  @ManyToOne(() => MallaCurricular, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'malla_antigua_id' })
  mallaAntigua: MallaCurricular;

  @ManyToOne(() => MallaCurricular, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'malla_nueva_id' })
  mallaNueva: MallaCurricular;

  @ManyToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_nuevo_id' })
  cursoNuevo: Curso;

  @ManyToOne(() => EquivalenciaGrupo, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'grupo_id' })
  grupo?: EquivalenciaGrupo;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

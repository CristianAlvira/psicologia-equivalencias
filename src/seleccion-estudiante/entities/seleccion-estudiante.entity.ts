import { Curso } from '@/cursos/entities/curso.entity';
import { Usuario } from '@/usuarios/entities/usuario.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('seleccion_estudiante')
export class SeleccionEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.selecciones_estudiantes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Usuario;

  @ManyToOne(() => Curso, (curso) => curso.selecciones_estudiantes, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'estudiante_id' })
  curso_antiguo: Curso;
}

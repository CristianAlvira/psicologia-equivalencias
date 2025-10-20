import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rol } from './../../roles/entities/rol.entity';
import { UsuarioTokenFcm } from '../../auth/entities/usuario_token_fcm.entity';
import { SeleccionEstudiante } from '@/seleccion-estudiante/entities/seleccion-estudiante.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 100, select: false, nullable: true })
  password?: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo_estudiantil?: string;

  // Campos de consentimiento para tratamiento de datos sensibles
  @Column({ type: 'boolean', default: false })
  acepta_tratamiento_datos: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_consentimiento?: Date;

  @Column({ type: 'varchar', length: 15, nullable: true })
  ip_consentimiento?: string;

  @Column({ type: 'text', nullable: true })
  user_agent_consentimiento?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version_politicas?: string; // Para trackear qué versión de políticas aceptó

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => UsuarioTokenFcm, (token) => token.usuario, {
    cascade: true,
  })
  tokens_fcm: UsuarioTokenFcm[];

  @ManyToMany(() => Rol, (rol) => rol.usuarios)
  @JoinTable({
    name: 'usuarios_roles',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
  })
  roles?: Rol[];

  @OneToMany(
    () => SeleccionEstudiante,
    (seleccionEstudiante) => seleccionEstudiante.estudiante,
  )
  selecciones_estudiantes: SeleccionEstudiante[];
}

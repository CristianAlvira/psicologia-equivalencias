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
import { TipoDocumento } from '../enums/tipo-documento.enum';
import { Rol } from './../../roles/entities/rol.entity';
import { UsuarioTokenFcm } from '../../auth/entities/usuario_token_fcm.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  primer_apellido: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  segundo_apellido?: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, select: false })
  password: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'enum', enum: TipoDocumento })
  tipo_documento: TipoDocumento;

  @Column({ type: 'varchar', length: 50 })
  num_documento: string;

  @Column({ type: 'varchar', length: 20 })
  num_celular: string;

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
  roles: Rol[];
}

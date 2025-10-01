import { CategoriasPermiso } from '../../categorias_permisos/entities/categorias_permiso.entity';
import { Rol } from '../../roles/entities/rol.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre_permiso: string;

  @ManyToMany(() => Rol, (rol) => rol.permisos)
  roles: Rol[];

  @ManyToOne(
    () => CategoriasPermiso,
    (categoria_permiso) => categoria_permiso.permisos,
  )
  categoria_permiso: CategoriasPermiso;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

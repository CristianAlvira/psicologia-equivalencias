import { Permiso } from '../../permisos/entities/permiso.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categorias_permisos')
export class CategoriasPermiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  nombre_categoria: string;

  @OneToMany(() => Permiso, (permiso) => permiso.categoria_permiso)
  permisos: Permiso[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

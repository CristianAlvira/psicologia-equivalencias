import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';
import { EquivalenciaItem } from './equivalencia-item.entity';

export enum TipoEquivalencia {
  COMPLETA = 'COMPLETA', // Todos los cursos antiguos son requeridos (comportamiento actual)
  OPCIONAL_ANTIGUA = 'OPCIONAL_ANTIGUA', // Cualquiera de los cursos antiguos puede homologar el curso nuevo
  OPCIONAL_NUEVA = 'OPCIONAL_NUEVA', // El curso antiguo puede homologar cualquiera de los cursos nuevos disponibles
}

@Entity('equivalencia_grupos')
export class EquivalenciaGrupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descripcion?: string;

  @Column({
    type: 'enum',
    enum: TipoEquivalencia,
    default: TipoEquivalencia.COMPLETA,
  })
  tipo: TipoEquivalencia;

  @Column({ name: 'malla_antigua_id' })
  mallaAntiguaId: number;

  @Column({ name: 'malla_nueva_id' })
  mallaNuevaId: number;

  @ManyToOne(() => MallaCurricular, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'malla_antigua_id' })
  mallaAntigua: MallaCurricular;

  @ManyToOne(() => MallaCurricular, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'malla_nueva_id' })
  mallaNueva: MallaCurricular;

  @OneToMany(() => EquivalenciaItem, (item) => item.grupo, {
    cascade: ['insert', 'update', 'remove'],
  })
  items: EquivalenciaItem[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

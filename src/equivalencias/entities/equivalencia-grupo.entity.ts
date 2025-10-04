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


@Entity('equivalencia_grupos')
export class EquivalenciaGrupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descripcion?: string;

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

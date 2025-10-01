import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('programas')
export class Programa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @OneToMany(() => MallaCurricular, (malla) => malla.programa, {
    cascade: ['remove'], // Solo cascade remove, no insert/update automático
  })
  mallas_curriculares: MallaCurricular[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

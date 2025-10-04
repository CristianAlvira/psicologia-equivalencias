import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';
import { Curso } from './entities/curso.entity';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, MallaCurricular])],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [TypeOrmModule],
})
export class CursosModule {}

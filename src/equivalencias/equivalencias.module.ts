import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquivalenciasService } from './equivalencias.service';
import { EquivalenciaGrupo } from './entities/equivalencia-grupo.entity';
import { EquivalenciaItem } from './entities/equivalencia-item.entity';
import { ResultadoHomologacion } from './entities/resultado-homologacion.entity';
import { Curso } from '@/cursos/entities/curso.entity';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';
import { EquivalenciasController } from './equivalencias.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquivalenciaGrupo,
      EquivalenciaItem,
      ResultadoHomologacion,
      Curso,
      MallaCurricular,
    ]),
  ],
  controllers: [EquivalenciasController],
  providers: [EquivalenciasService],
  exports: [EquivalenciasService, TypeOrmModule],
})
export class EquivalenciasModule {}

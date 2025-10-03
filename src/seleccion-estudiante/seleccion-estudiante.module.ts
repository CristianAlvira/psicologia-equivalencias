import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeleccionEstudianteService } from './seleccion-estudiante.service';
import { SeleccionEstudianteController } from './seleccion-estudiante.controller';
import { SeleccionEstudiante } from './entities/seleccion-estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeleccionEstudiante])],
  controllers: [SeleccionEstudianteController],
  providers: [SeleccionEstudianteService],
  exports: [TypeOrmModule],
})
export class SeleccionEstudianteModule {}

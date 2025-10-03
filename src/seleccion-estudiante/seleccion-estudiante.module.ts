import { Module } from '@nestjs/common';
import { SeleccionEstudianteService } from './seleccion-estudiante.service';
import { SeleccionEstudianteController } from './seleccion-estudiante.controller';

@Module({
  controllers: [SeleccionEstudianteController],
  providers: [SeleccionEstudianteService],
})
export class SeleccionEstudianteModule {}

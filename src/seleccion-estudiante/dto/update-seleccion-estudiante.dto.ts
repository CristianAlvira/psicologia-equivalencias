import { PartialType } from '@nestjs/swagger';
import { CreateSeleccionEstudianteDto } from './create-seleccion-estudiante.dto';

export class UpdateSeleccionEstudianteDto extends PartialType(
  CreateSeleccionEstudianteDto,
) {}

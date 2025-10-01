import { PartialType } from '@nestjs/swagger';
import { CreateCategoriasPermisoDto } from './create-categorias_permiso.dto';

export class UpdateCategoriasPermisoDto extends PartialType(
  CreateCategoriasPermisoDto,
) {}

import { Transform, Type } from 'class-transformer';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { RolesDbValues } from '@/common/enums/roles.enum';

export class FilterUsuariosQueryDto extends PaginationDto {
  @ApiProperty({
    example: true,
    required: false,
    description: 'Filtrar por estado activo/inactivo del usuario',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @Type(() => Boolean)
  estado?: boolean;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Filtrar solo estudiantes (usuarios sin email)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @Type(() => Boolean)
  estudiante?: boolean;

  @ApiProperty({
    example: '123456',
    required: false,
    description: 'Filtrar estudiantes por codigo estudiantil',
  })
  @IsOptional()
  codigo_estudiantil?: string;

  @ApiProperty({
    example: true,
    required: false,
    description:
      'Filtrar usuarios que tienen equivalencias registradas (true) o todos los usuarios (vacio)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @Type(() => Boolean)
  tiene_equivalencias?: boolean;

  @ApiProperty({
    example: RolesDbValues.ESTUDIANTE,
    required: false,
    description: 'Filtrar por rol del usuario',
    enum: RolesDbValues,
  })
  @IsOptional()
  @IsEnum(RolesDbValues, {
    message:
      'El rol debe ser uno de los valores válidos: administrador, estudiante',
  })
  rol?: RolesDbValues;
}

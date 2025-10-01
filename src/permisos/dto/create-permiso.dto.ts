import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePermisoDto {
  @ApiProperty({ example: 'crear_usuarios' })
  @MaxLength(50, {
    message: 'El nombre del permiso no puede superar los 50 caracteres',
  })
  @MinLength(3, {
    message: 'El nombre del permiso debe tener al menos 3 caracteres',
  })
  @IsString({ message: 'El nombre del permiso debe ser un texto' })
  nombre_permiso: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  categoria_permiso_id: number;
}

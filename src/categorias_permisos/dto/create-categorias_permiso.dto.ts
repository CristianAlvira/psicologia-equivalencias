import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoriasPermisoDto {
  @ApiProperty({ example: 'usuarios' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres',
  })
  nombre_categoria: string;
}

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstudianteDto {
  @ApiProperty({ example: 'John' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres',
  })
  nombres: string;

  @ApiProperty({ example: 'Doe' })
  @IsString({ message: 'Los apellidos debe ser un texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(100, {
    message: 'Los apellidos no puede superar los 100 caracteres',
  })
  apellidos: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  estado?: boolean;

  @ApiProperty({ example: '1234567890' })
  @IsString({ message: 'El codigo estudiantil debe ser un texto' })
  @IsNotEmpty({ message: 'El codigo estudiantil es obligatorio' })
  @MaxLength(50, {
    message: 'El codigo estudiantil no puede superar los 50 caracteres',
  })
  codigo_estudiantil: string;

  @ApiProperty({ isArray: true, example: [2] })
  @IsArray({ message: 'Los roles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un rol' })
  @IsInt({ each: true, message: 'Cada rol debe ser un número entero' })
  @IsNotEmpty()
  roles: number[];
}

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Semestre } from '../enums/semestre.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCursoDto {
  @ApiProperty({ example: 'Psicologia' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(450, {
    message: 'El nombre no puede superar los 450 caracteres',
  })
  nombre: string;

  @ApiProperty({ example: 3 })
  @IsNotEmpty({ message: 'Los créditos son obligatorios' })
  @IsPositive({ message: 'Los créditos deben ser un número positivo' })
  @IsInt({ message: 'Los créditos deben ser un número entero' })
  creditos: number;

  @ApiProperty({ example: Semestre.PRIMERO })
  @IsNotEmpty({ message: 'El semestre es obligatorio' })
  @IsEnum(Semestre, { message: 'El semestre no es válido' })
  semestre: Semestre;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'La malla curricular es obligatoria' })
  @IsInt({ message: 'La malla curricular debe ser un número entero' })
  mallaCurricularId: number;
}

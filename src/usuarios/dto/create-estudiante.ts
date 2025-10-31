import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MustAcceptTreatment } from '@/common/validators/must-accept-treatment.validator';

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
  @IsOptional()
  @MaxLength(50, {
    message: 'El codigo estudiantil no puede superar los 50 caracteres',
  })
  codigo_estudiantil?: string;

  @ApiProperty({
    description: 'Aceptación obligatoria de políticas de privacidad',
    example: true,
  })
  @IsBoolean({
    message: 'La aceptación de políticas debe ser un valor booleano',
  })
  @IsNotEmpty({ message: 'Debe aceptar las políticas de privacidad' })
  @MustAcceptTreatment({
    message:
      'Debe aceptar las políticas de tratamiento de datos para continuar',
  })
  acepta_tratamiento_datos: boolean;

  @ApiProperty({
    description: 'Versión de las políticas aceptadas',
    example: '1.0.0',
    required: false,
  })
  @IsString({ message: 'La versión de políticas debe ser un texto' })
  @IsOptional()
  @MaxLength(20, {
    message: 'La versión de políticas no puede superar los 20 caracteres',
  })
  version_politicas?: string;
}

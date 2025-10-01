import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateMallaCurricularDto {
  @ApiProperty({ example: 'Nueva (2025)' })
  @IsString({ message: 'La version debe ser un texto' })
  @IsNotEmpty({ message: 'La version es obligatoria' })
  @MaxLength(100, {
    message: 'La version no puede superar los 100 caracteres',
  })
  version: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El programaId es obligatorio' })
  @IsInt({ message: 'El programaId debe ser un numero entero' })
  @IsPositive({ message: 'El programaId debe ser un numero positivo' })
  programaId: number;
}

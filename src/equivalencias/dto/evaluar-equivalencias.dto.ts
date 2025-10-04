import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EvaluarEquivalenciasDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  @IsNotEmpty()
  estudianteId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  mallaAntiguaId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  mallaNuevaId: number;

  @ApiProperty({ example: [101, 102, 201], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  cursosAntiguosMarcados: number[];
}

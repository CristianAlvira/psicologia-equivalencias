import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidarEquivalenciasDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  estudianteId: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  mallaAntiguaId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  mallaNuevaId?: number;
}

export class ValidacionEquivalenciasResponse {
  @ApiProperty({ example: 1 })
  estudianteId: number;

  @ApiProperty({ example: true })
  tieneEquivalencias: boolean;

  @ApiProperty({ example: 1, required: false })
  mallaAntiguaId?: number;

  @ApiProperty({ example: 2, required: false })
  mallaNuevaId?: number;

  @ApiProperty({ example: 3, required: false })
  totalEquivalencias?: number;

  @ApiProperty({ example: '2025-01-16T10:30:00.000Z', required: false })
  ultimaEvaluacion?: Date;
}

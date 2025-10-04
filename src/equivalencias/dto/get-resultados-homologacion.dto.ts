import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetResultadosHomologacionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  estudianteId: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  mallaAntiguaId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  mallaNuevaId?: number;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsDateString()
  @IsOptional()
  fechaHasta?: string;
}

export interface ResumenResultadosDto {
  totalEvaluaciones: number;
  ultimaEvaluacion: Date;
  resumenActual: {
    homologados: number;
    incompletos: number;
    noAplica: number;
    totalCursosNuevos: number;
  };
}

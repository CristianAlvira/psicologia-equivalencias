import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TipoEquivalencia } from '../entities/equivalencia-grupo.entity';

export class EquivalenciaItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cursoId: number;

  @ApiProperty({ example: 'ANTIGUA', enum: ['ANTIGUA', 'NUEVA'] })
  @IsString()
  @IsNotEmpty()
  lado: 'ANTIGUA' | 'NUEVA';
}

export class CreateEquivalenciaGrupoDto {
  @ApiProperty({ example: 'Electivas básicas' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: 'COMPLETA',
    enum: TipoEquivalencia,
    description:
      'Tipo de equivalencia: COMPLETA (todos requeridos), OPCIONAL_ANTIGUA (cualquier curso antiguo), OPCIONAL_NUEVA (cualquier curso nuevo)',
  })
  @IsEnum(TipoEquivalencia)
  @IsOptional()
  tipo?: TipoEquivalencia;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  mallaAntiguaId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  mallaNuevaId: number;

  @ApiProperty({ type: [EquivalenciaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquivalenciaItemDto)
  items: EquivalenciaItemDto[];
}

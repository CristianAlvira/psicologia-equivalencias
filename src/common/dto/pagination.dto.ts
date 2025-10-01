import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 10,
    description:
      'Número de elementos por página. Use -1 para obtener todos los elementos',
    required: false,
  })
  @IsOptional()
  @Min(-1, {
    message: 'El límite debe ser mayor a 0 o -1 para todos los elementos',
  })
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Número de elementos a omitir',
  })
  @IsOptional()
  @Min(0, { message: 'El offset debe ser mayor o igual a 0' })
  offset?: number;
}

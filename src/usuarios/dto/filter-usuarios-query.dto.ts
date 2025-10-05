import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FilterUsuariosQueryDto extends PaginationDto {
  @ApiProperty({
    example: true,
    required: false,
    description: 'Filtrar por estado activo/inactivo del usuario',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @Type(() => Boolean)
  estado?: boolean;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Filtrar solo estudiantes (usuarios sin email)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @Type(() => Boolean)
  estudiante?: boolean;
}

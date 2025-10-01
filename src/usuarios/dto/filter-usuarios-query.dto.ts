import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FilterUsuariosQueryDto extends PaginationDto {
  @ApiProperty({ example: 'true', required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  //! Tal vez no sea necesario, en el main.ts se especifica la transformación explícita
  //Necesitamos transformar desde string a Boolean
  @Transform(({ value }): boolean | undefined =>
    value === 'true' ? true : value === 'false' ? false : undefined,
  )
  estado?: boolean;

  @ApiProperty({ example: 'admin', required: false })
  @IsOptional()
  @IsString({ message: 'El rol debe ser un texto' })
  rol?: string;
}

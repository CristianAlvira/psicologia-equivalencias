import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  nombre_rol: string;

  @ApiProperty({ example: 'Administrador del sistema', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  descripcion_rol?: string;

  @ApiProperty({ example: [1, 2, 3], isArray: true })
  @IsInt({ each: true })
  @IsNotEmpty()
  @IsArray()
  permisos: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  usuario_id: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un rol' })
  @IsInt({
    each: true,
    message: 'Todos los IDs de roles deben ser números enteros',
  })
  role_ids: number[];
}

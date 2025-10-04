import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMallasByProgramaDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  programaId: number;
}

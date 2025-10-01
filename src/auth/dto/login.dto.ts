import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@localhost.com' })
  @Max(100)
  @Min(1)
  @IsString()
  @IsEmail()
  credential: string;

  @ApiProperty({ example: 'admin' })
  @Max(100)
  @Min(1)
  @IsString()
  password: string;

  @ApiProperty({
    example: false,
    description: 'Si se marca, la sesión durará más tiempo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;
}

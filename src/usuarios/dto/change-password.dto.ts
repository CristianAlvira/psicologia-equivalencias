import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  ValidateIf,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Contrasena12.' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(100, {
    message: 'La contraseña no puede superar los 100 caracteres',
  })
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  password: string;

  @IsString({ message: 'La confirmación de contraseña es obligatoria.' })
  @ValidateIf((o) => o.password === o.confirm_password) //Valida que los campos coincidan
  confirm_password: string;
}

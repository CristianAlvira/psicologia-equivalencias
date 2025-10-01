import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
  IsArray,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { TipoDocumento } from '../enums/tipo-documento.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'John' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres',
  })
  nombres: string;

  @ApiProperty({ example: 'Doe' })
  @IsString({ message: 'El primer apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @MaxLength(100, {
    message: 'El primer apellido no puede superar los 100 caracteres',
  })
  primer_apellido: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString({ message: 'El segundo apellido debe ser un texto' })
  @IsOptional()
  @MaxLength(100, {
    message: 'El segundo apellido no puede superar los 100 caracteres',
  })
  segundo_apellido?: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsString({ message: 'El correo electrónico debe ser un texto' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @MaxLength(150, {
    message: 'El correo electrónico no puede superar los 150 caracteres',
  })
  email: string;

  @ApiProperty({ example: 'Contrasena12.' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(100, {
    message: 'La contraseña no puede superar los 100 caracteres',
  })
  @MinLength(5, { message: 'La contraseña debe tener al menos 12 caracteres' })
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  estado?: boolean;

  @ApiProperty({
    example: 'C.C',
    enum: TipoDocumento,
    enumName: 'TipoDocumento',
  })
  @IsEnum(TipoDocumento, { message: 'El tipo de documento no es válido' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  tipo_documento: TipoDocumento;

  @ApiProperty({ example: '1234567890' })
  @IsString({ message: 'El número de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @MaxLength(50, {
    message: 'El número de documento no puede superar los 50 caracteres',
  })
  num_documento: string;

  @ApiProperty({ example: '1234567890' })
  @ApiProperty()
  @IsString({ message: 'El número de celular debe ser un texto' })
  @IsNotEmpty({ message: 'El número de celular es obligatorio' })
  @MaxLength(20, {
    message: 'El número de celular no puede superar los 20 caracteres',
  })
  num_celular: string;

  @ApiProperty({ isArray: true, example: [1] })
  @IsArray({ message: 'Los roles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un rol' })
  @IsInt({ each: true, message: 'Cada rol debe ser un número entero' })
  @IsNotEmpty()
  roles: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTokenFcmDto {
  @ApiProperty({
    example: 'fcm_token_examplefdsdlfjdsf002314342p098e',
    description: 'Token FCM del usuario',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token FCM no puede estar vacío' })
  token_fcm: string;
}

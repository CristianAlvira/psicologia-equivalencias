import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token para renovar access token' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

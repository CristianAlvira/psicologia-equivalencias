import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AceptarConsentimientoDto {
  @ApiProperty({
    description:
      'Indica si el usuario acepta el tratamiento de datos sensibles',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acepta_tratamiento_datos: boolean;

  @ApiPropertyOptional({
    description: 'Versión de las políticas de privacidad aceptadas',
    example: '1.0.0',
  })
  @IsString()
  @IsOptional()
  version_politicas?: string;
}

export class ConsentimientoResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: number;

  @ApiProperty({ description: 'Estado del consentimiento' })
  acepta_tratamiento_datos: boolean;

  @ApiProperty({ description: 'Fecha de consentimiento' })
  fecha_consentimiento?: Date;

  @ApiProperty({ description: 'Versión de políticas aceptadas' })
  version_politicas?: string;

  @ApiProperty({ description: 'IP desde donde se otorgó el consentimiento' })
  ip_consentimiento?: string;
}

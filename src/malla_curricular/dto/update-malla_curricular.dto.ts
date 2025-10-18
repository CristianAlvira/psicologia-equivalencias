import { PartialType } from '@nestjs/swagger';
import { CreateMallaCurricularDto } from './create-malla_curricular.dto';

export class UpdateMallaCurricularDto extends PartialType(
  CreateMallaCurricularDto,
) {}

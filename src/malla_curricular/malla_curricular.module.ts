import { Module } from '@nestjs/common';
import { MallaCurricularService } from './malla_curricular.service';
import { MallaCurricularController } from './malla_curricular.controller';

@Module({
  controllers: [MallaCurricularController],
  providers: [MallaCurricularService],
})
export class MallaCurricularModule {}

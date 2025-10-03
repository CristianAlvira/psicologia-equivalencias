import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallaCurricularService } from './malla_curricular.service';
import { MallaCurricularController } from './malla_curricular.controller';
import { MallaCurricular } from './entities/malla_curricular.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MallaCurricular])],
  controllers: [MallaCurricularController],
  providers: [MallaCurricularService],
  exports: [TypeOrmModule],
})
export class MallaCurricularModule {}

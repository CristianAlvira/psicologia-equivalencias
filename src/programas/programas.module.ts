import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramasService } from './programas.service';
import { ProgramasController } from './programas.controller';
import { Programa } from './entities/programa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Programa])],
  controllers: [ProgramasController],
  providers: [ProgramasService],
  exports: [TypeOrmModule],
})
export class ProgramasModule {}

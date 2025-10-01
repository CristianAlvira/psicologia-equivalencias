import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MallaCurricularService } from './malla_curricular.service';
import { CreateMallaCurricularDto } from './dto/create-malla_curricular.dto';
import { UpdateMallaCurricularDto } from './dto/update-malla_curricular.dto';

@Controller('malla-curricular')
export class MallaCurricularController {
  constructor(private readonly mallaCurricularService: MallaCurricularService) {}

  @Post()
  create(@Body() createMallaCurricularDto: CreateMallaCurricularDto) {
    return this.mallaCurricularService.create(createMallaCurricularDto);
  }

  @Get()
  findAll() {
    return this.mallaCurricularService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mallaCurricularService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMallaCurricularDto: UpdateMallaCurricularDto) {
    return this.mallaCurricularService.update(+id, updateMallaCurricularDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mallaCurricularService.remove(+id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SeleccionEstudianteService } from './seleccion-estudiante.service';
import { CreateSeleccionEstudianteDto } from './dto/create-seleccion-estudiante.dto';
import { UpdateSeleccionEstudianteDto } from './dto/update-seleccion-estudiante.dto';

@Controller('seleccion-estudiante')
export class SeleccionEstudianteController {
  constructor(
    private readonly seleccionEstudianteService: SeleccionEstudianteService,
  ) {}

  @Post()
  create(@Body() createSeleccionEstudianteDto: CreateSeleccionEstudianteDto) {
    return this.seleccionEstudianteService.create(createSeleccionEstudianteDto);
  }

  @Get()
  findAll() {
    return this.seleccionEstudianteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seleccionEstudianteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSeleccionEstudianteDto: UpdateSeleccionEstudianteDto,
  ) {
    return this.seleccionEstudianteService.update(
      +id,
      updateSeleccionEstudianteDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seleccionEstudianteService.remove(+id);
  }
}

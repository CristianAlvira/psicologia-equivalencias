import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MallaCurricularService } from './malla_curricular.service';
import { CreateMallaCurricularDto } from './dto/create-malla_curricular.dto';
import { UpdateMallaCurricularDto } from './dto/update-malla_curricular.dto';

@ApiTags('malla-curricular')
@Controller('malla-curricular')
export class MallaCurricularController {
  constructor(
    private readonly mallaCurricularService: MallaCurricularService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva malla curricular' })
  @ApiResponse({
    status: 201,
    description: 'Malla curricular creada exitosamente.',
  })
  create(@Body() createMallaCurricularDto: CreateMallaCurricularDto) {
    return this.mallaCurricularService.create(createMallaCurricularDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las mallas curriculares' })
  findAll(@Query('programaId') programaId?: string) {
    if (programaId) {
      return this.mallaCurricularService.findByPrograma(+programaId);
    }
    return this.mallaCurricularService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una malla curricular por ID' })
  findOne(@Param('id') id: string) {
    return this.mallaCurricularService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una malla curricular' })
  update(
    @Param('id') id: string,
    @Body() updateMallaCurricularDto: UpdateMallaCurricularDto,
  ) {
    return this.mallaCurricularService.update(+id, updateMallaCurricularDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una malla curricular' })
  remove(@Param('id') id: string) {
    return this.mallaCurricularService.remove(+id);
  }
}

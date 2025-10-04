import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EquivalenciasService } from './equivalencias.service';
import { CreateEquivalenciaGrupoDto } from './dto/create-equivalencia-grupo.dto';
import { EvaluarEquivalenciasDto } from './dto/evaluar-equivalencias.dto';
import { GetResultadosHomologacionDto } from './dto/get-resultados-homologacion.dto';
import { EvaluacionResultado } from './dto/evaluacion-resultado.dto';

@ApiTags('equivalencias')
@Controller('equivalencias')
export class EquivalenciasController {
  constructor(private readonly equivalenciasService: EquivalenciasService) {}

  @Post('grupos')
  @ApiOperation({ summary: 'Crear un grupo de equivalencias entre cursos' })
  @ApiResponse({
    status: 201,
    description: 'Grupo de equivalencias creado exitosamente.',
  })
  async createGrupo(@Body() createDto: CreateEquivalenciaGrupoDto) {
    return this.equivalenciasService.createEquivalenciaGrupo(createDto);
  }

  @Get('grupos')
  @ApiOperation({ summary: 'Obtener todos los grupos de equivalencias' })
  async findAllGrupos() {
    return this.equivalenciasService.findAll();
  }

  @Get('grupos/:id')
  @ApiOperation({ summary: 'Obtener un grupo de equivalencias por ID' })
  async findOneGrupo(@Param('id') id: string) {
    return this.equivalenciasService.findOneEquivalenciaGrupo(+id);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener equivalencias entre dos mallas curriculares',
  })
  async findEquivalencias(
    @Query('mallaAntiguaId') mallaAntiguaId: string,
    @Query('mallaNuevaId') mallaNuevaId: string,
  ) {
    return this.equivalenciasService.findEquivalenciasByMallas(
      +mallaAntiguaId,
      +mallaNuevaId,
    );
  }

  @Post('evaluar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Evaluar homologaciones para un estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación de homologaciones completada.',
    type: Object,
  })
  async evaluarHomologaciones(
    @Body() evaluarDto: EvaluarEquivalenciasDto,
  ): Promise<EvaluacionResultado> {
    return this.equivalenciasService.evaluarEquivalencias(evaluarDto);
  }

  @Delete('grupos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un grupo de equivalencias' })
  async remove(@Param('id') id: string) {
    return this.equivalenciasService.remove(+id);
  }

  @Get('resultados')
  @ApiOperation({
    summary: 'Obtener resultados de homologación para un estudiante',
  })
  async getResultados(@Query() dto: GetResultadosHomologacionDto) {
    return this.equivalenciasService.getResultadosEstudiante(dto);
  }

  @Get('resultados/ultima/:estudianteId/:mallaAntiguaId/:mallaNuevaId')
  @ApiOperation({ summary: 'Obtener la última evaluación de un estudiante' })
  async getUltimaEvaluacion(
    @Param('estudianteId') estudianteId: string,
    @Param('mallaAntiguaId') mallaAntiguaId: string,
    @Param('mallaNuevaId') mallaNuevaId: string,
  ) {
    return this.equivalenciasService.getUltimaEvaluacionEstudiante(
      +estudianteId,
      +mallaAntiguaId,
      +mallaNuevaId,
    );
  }

  @Get('resumen/:estudianteId')
  @ApiOperation({ summary: 'Obtener resumen de resultados para un estudiante' })
  async getResumen(@Param('estudianteId') estudianteId: string) {
    return this.equivalenciasService.getResumenEstudiante(+estudianteId);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EquivalenciaGrupo } from './entities/equivalencia-grupo.entity';
import {
  EquivalenciaItem,
  LadoEquivalencia,
} from './entities/equivalencia-item.entity';
import {
  ResultadoHomologacion,
  EstadoHomologacion,
} from './entities/resultado-homologacion.entity';
import { CreateEquivalenciaGrupoDto } from './dto/create-equivalencia-grupo.dto';
import { EvaluarEquivalenciasDto } from './dto/evaluar-equivalencias.dto';
import {
  EvaluacionResultado,
  ResultadoCurso,
} from './dto/evaluacion-resultado.dto';
import { GetResultadosHomologacionDto } from './dto/get-resultados-homologacion.dto';
import { ResumenResultadosDto } from './dto/resumen-resultados.dto';
import { Curso } from '@/cursos/entities/curso.entity';
import { MallaCurricular } from '@/malla_curricular/entities/malla_curricular.entity';

@Injectable()
export class EquivalenciasService {
  constructor(
    @InjectRepository(EquivalenciaGrupo)
    private readonly equivalenciaGrupoRepository: Repository<EquivalenciaGrupo>,
    @InjectRepository(EquivalenciaItem)
    private readonly equivalenciaItemRepository: Repository<EquivalenciaItem>,
    @InjectRepository(ResultadoHomologacion)
    private readonly resultadoHomologacionRepository: Repository<ResultadoHomologacion>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(MallaCurricular)
    private readonly mallaCurricularRepository: Repository<MallaCurricular>,
  ) {}

  async createEquivalenciaGrupo(
    dto: CreateEquivalenciaGrupoDto,
  ): Promise<EquivalenciaGrupo> {
    // Verificar que las mallas existan
    const mallaAntigua = await this.mallaCurricularRepository.findOne({
      where: { id: dto.mallaAntiguaId },
    });
    const mallaNueva = await this.mallaCurricularRepository.findOne({
      where: { id: dto.mallaNuevaId },
    });

    if (!mallaAntigua || !mallaNueva) {
      throw new NotFoundException(
        'Una o ambas mallas curriculares no fueron encontradas',
      );
    }

    // Crear el grupo de equivalencias
    const grupo = this.equivalenciaGrupoRepository.create({
      descripcion: dto.descripcion,
      mallaAntiguaId: dto.mallaAntiguaId,
      mallaNuevaId: dto.mallaNuevaId,
    });

    const savedGrupo = await this.equivalenciaGrupoRepository.save(grupo);

    // Crear los items de equivalencia
    for (const itemDto of dto.items) {
      const item = this.equivalenciaItemRepository.create({
        grupoId: savedGrupo.id,
        cursoId: itemDto.cursoId,
        lado: itemDto.lado as LadoEquivalencia,
      });
      await this.equivalenciaItemRepository.save(item);
    }

    return this.findOneEquivalenciaGrupo(savedGrupo.id);
  }

  async findOneEquivalenciaGrupo(id: number): Promise<EquivalenciaGrupo> {
    const grupo = await this.equivalenciaGrupoRepository.findOne({
      where: { id },
      relations: ['items', 'items.curso', 'mallaAntigua', 'mallaNueva'],
    });

    if (!grupo) {
      throw new NotFoundException(
        `Grupo de equivalencias con ID ${id} no encontrado`,
      );
    }

    return grupo;
  }

  async findEquivalenciasByMallas(
    mallaAntiguaId: number,
    mallaNuevaId: number,
  ): Promise<EquivalenciaGrupo[]> {
    return this.equivalenciaGrupoRepository.find({
      where: {
        mallaAntiguaId,
        mallaNuevaId,
      },
      relations: ['items', 'items.curso'],
    });
  }

  async evaluarEquivalencias(
    dto: EvaluarEquivalenciasDto,
  ): Promise<EvaluacionResultado> {
    // Limpiar resultados anteriores del estudiante para esta combinación de mallas
    await this.resultadoHomologacionRepository.delete({
      estudianteId: dto.estudianteId,
      mallaAntiguaId: dto.mallaAntiguaId,
      mallaNuevaId: dto.mallaNuevaId,
    });

    // Obtener todos los grupos de equivalencias entre las mallas
    const grupos = await this.findEquivalenciasByMallas(
      dto.mallaAntiguaId,
      dto.mallaNuevaId,
    );

    // Obtener todos los cursos de la malla nueva
    const cursosNuevos = await this.cursoRepository.find({
      where: { mallaCurricularId: dto.mallaNuevaId },
    });

    const resultado: Record<string, ResultadoCurso> = {};
    const resultadosParaGuardar: Partial<ResultadoHomologacion>[] = [];
    let homologados = 0;
    let incompletos = 0;
    let noAplica = 0;

    // Procesar cada curso de la malla nueva
    for (const cursoNuevo of cursosNuevos) {
      const cursoId = cursoNuevo.id.toString();

      // Buscar si este curso nuevo tiene equivalencias definidas
      const grupoConCursoNuevo = grupos.find((grupo) =>
        grupo.items.some(
          (item) =>
            item.cursoId === cursoNuevo.id &&
            item.lado === LadoEquivalencia.NUEVA,
        ),
      );

      if (!grupoConCursoNuevo) {
        // No hay regla de equivalencia para este curso
        resultado[cursoId] = {
          estado: 'NO_APLICA',
          observacion: 'No existe regla de homologación para este curso.',
          cursosAntiguosPresentes: [],
          cursosAntiguosFaltantes: [],
        };
        noAplica++;

        // Guardar resultado en BD
        resultadosParaGuardar.push({
          estudianteId: dto.estudianteId,
          mallaAntiguaId: dto.mallaAntiguaId,
          mallaNuevaId: dto.mallaNuevaId,
          cursoNuevoId: cursoNuevo.id,
          estado: EstadoHomologacion.NO_APLICA,
          observacion: 'No existe regla de homologación para este curso.',
          cursosAntiguosPresentes: [],
          cursosAntiguosFaltantes: [],
          cursosAntiguosSeleccionados: dto.cursosAntiguosMarcados,
        });
        continue;
      }

      // Obtener todos los cursos antiguos requeridos para esta equivalencia
      const cursosAntiguosRequeridos = grupoConCursoNuevo.items
        .filter((item) => item.lado === LadoEquivalencia.ANTIGUA)
        .map((item) => item.cursoId);

      // Verificar cuáles cursos antiguos requeridos ha visto el estudiante
      const cursosAntiguosPresentes = cursosAntiguosRequeridos.filter(
        (cursoId) => dto.cursosAntiguosMarcados.includes(cursoId),
      );

      const cursosAntiguosFaltantes = cursosAntiguosRequeridos.filter(
        (cursoId) => !dto.cursosAntiguosMarcados.includes(cursoId),
      );

      if (cursosAntiguosFaltantes.length === 0) {
        // Curso completamente homologado
        const cursosNombres = await this.obtenerNombresCursos(
          cursosAntiguosPresentes,
        );
        resultado[cursoId] = {
          estado: 'HOMOLOGADO',
          observacion: `Homologado por: ${cursosNombres.join(', ')}.`,
          grupoId: grupoConCursoNuevo.id,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes: [],
        };
        homologados++;

        // Guardar resultado en BD
        resultadosParaGuardar.push({
          estudianteId: dto.estudianteId,
          mallaAntiguaId: dto.mallaAntiguaId,
          mallaNuevaId: dto.mallaNuevaId,
          cursoNuevoId: cursoNuevo.id,
          estado: EstadoHomologacion.HOMOLOGADO,
          observacion: `Homologado por: ${cursosNombres.join(', ')}.`,
          grupoId: grupoConCursoNuevo.id,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes: [],
          cursosAntiguosSeleccionados: dto.cursosAntiguosMarcados,
        });
      } else {
        // Curso parcialmente completo
        const cursosVistos = await this.obtenerNombresCursos(
          cursosAntiguosPresentes,
        );
        const cursosFaltantes = await this.obtenerNombresCursos(
          cursosAntiguosFaltantes,
        );

        let observacion = '';
        if (cursosVistos.length > 0) {
          observacion += `Tienes: ${cursosVistos.join(', ')}. `;
        }
        observacion += `Te falta: ${cursosFaltantes.join(', ')}.`;

        resultado[cursoId] = {
          estado: 'INCOMPLETO',
          observacion,
          grupoId: grupoConCursoNuevo.id,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes,
        };
        incompletos++;

        // Guardar resultado en BD
        resultadosParaGuardar.push({
          estudianteId: dto.estudianteId,
          mallaAntiguaId: dto.mallaAntiguaId,
          mallaNuevaId: dto.mallaNuevaId,
          cursoNuevoId: cursoNuevo.id,
          estado: EstadoHomologacion.INCOMPLETO,
          observacion,
          grupoId: grupoConCursoNuevo.id,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes,
          cursosAntiguosSeleccionados: dto.cursosAntiguosMarcados,
        });
      }
    }

    // Guardar todos los resultados en la base de datos
    if (resultadosParaGuardar.length > 0) {
      await this.resultadoHomologacionRepository.save(resultadosParaGuardar);
    }

    return {
      porCursoNuevo: resultado,
      resumen: {
        homologados,
        incompletos,
        noAplica,
      },
    };
  }

  private async obtenerNombresCursos(cursosIds: number[]): Promise<string[]> {
    if (cursosIds.length === 0) return [];

    const cursos = await this.cursoRepository.find({
      where: cursosIds.map((id) => ({ id })),
    });

    return cursos.map((curso) => curso.nombre);
  }

  async findAll(): Promise<EquivalenciaGrupo[]> {
    return this.equivalenciaGrupoRepository.find({
      relations: ['items', 'items.curso', 'mallaAntigua', 'mallaNueva'],
    });
  }

  async remove(id: number): Promise<void> {
    const grupo = await this.findOneEquivalenciaGrupo(id);
    await this.equivalenciaGrupoRepository.remove(grupo);
  }

  // Métodos para manejar resultados de homologación
  async getResultadosEstudiante(
    dto: GetResultadosHomologacionDto,
  ): Promise<ResultadoHomologacion[]> {
    const whereConditions: any = {
      estudianteId: dto.estudianteId,
    };

    if (dto.mallaAntiguaId) {
      whereConditions.mallaAntiguaId = dto.mallaAntiguaId;
    }

    if (dto.mallaNuevaId) {
      whereConditions.mallaNuevaId = dto.mallaNuevaId;
    }

    if (dto.fechaDesde && dto.fechaHasta) {
      whereConditions.created_at = Between(
        new Date(dto.fechaDesde),
        new Date(dto.fechaHasta),
      );
    }

    return this.resultadoHomologacionRepository.find({
      where: whereConditions,
      relations: [
        'estudiante',
        'mallaAntigua',
        'mallaNueva',
        'cursoNuevo',
        'grupo',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async getUltimaEvaluacionEstudiante(
    estudianteId: number,
    mallaAntiguaId: number,
    mallaNuevaId: number,
  ): Promise<ResultadoHomologacion[]> {
    return this.resultadoHomologacionRepository.find({
      where: {
        estudianteId,
        mallaAntiguaId,
        mallaNuevaId,
      },
      relations: ['cursoNuevo', 'grupo'],
      order: { created_at: 'DESC' },
    });
  }

  async getResumenEstudiante(
    estudianteId: number,
  ): Promise<ResumenResultadosDto> {
    const allResults = await this.resultadoHomologacionRepository.find({
      where: { estudianteId },
      order: { created_at: 'DESC' },
    });

    if (allResults.length === 0) {
      return {
        totalEvaluaciones: 0,
        ultimaEvaluacion: new Date(),
        resumenActual: {
          homologados: 0,
          incompletos: 0,
          noAplica: 0,
          totalCursosNuevos: 0,
        },
      };
    }

    // Obtener la última evaluación (más reciente)
    const ultimaFecha = allResults[0].created_at;
    const ultimosResultados = allResults.filter(
      (r) => r.created_at.getTime() === ultimaFecha.getTime(),
    );

    const resumen = ultimosResultados.reduce(
      (acc, resultado) => {
        switch (resultado.estado) {
          case EstadoHomologacion.HOMOLOGADO:
            acc.homologados++;
            break;
          case EstadoHomologacion.INCOMPLETO:
            acc.incompletos++;
            break;
          case EstadoHomologacion.NO_APLICA:
            acc.noAplica++;
            break;
        }
        return acc;
      },
      { homologados: 0, incompletos: 0, noAplica: 0 },
    );

    return {
      totalEvaluaciones: new Set(allResults.map((r) => r.created_at.getTime()))
        .size,
      ultimaEvaluacion: ultimaFecha,
      resumenActual: {
        ...resumen,
        totalCursosNuevos: ultimosResultados.length,
      },
    };
  }
}

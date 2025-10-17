import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  EquivalenciaGrupo,
  TipoEquivalencia,
} from './entities/equivalencia-grupo.entity';
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
import { ResultadosEstudianteResponse } from './dto/resultados-estudiante-response.dto';
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
      tipo: dto.tipo || TipoEquivalencia.COMPLETA,
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
    const cursosNuevosYaProcesados = new Set<number>();

    // Pre-procesar grupos de tipo OPCIONAL_NUEVA
    await this.procesarGruposOpcionalNueva(
      grupos,
      dto.cursosAntiguosMarcados,
      resultado,
      resultadosParaGuardar,
      cursosNuevosYaProcesados,
      dto,
    );

    // Actualizar contadores basados en los resultados de OPCIONAL_NUEVA
    for (const res of Object.values(resultado)) {
      if (res.estado === 'HOMOLOGADO') homologados++;
      else if (res.estado === 'INCOMPLETO') incompletos++;
      else noAplica++;
    }

    // Procesar cada curso de la malla nueva
    for (const cursoNuevo of cursosNuevos) {
      // Saltar cursos ya procesados por OPCIONAL_NUEVA
      if (cursosNuevosYaProcesados.has(cursoNuevo.id)) {
        continue;
      }
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
          cursoNuevo: {
            id: cursoNuevo.id,
            nombre: cursoNuevo.nombre,
            creditos: cursoNuevo.creditos,
            semestre: cursoNuevo.semestre,
          },
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

      // Evaluar equivalencia según el tipo
      const evaluacionResultado = this.evaluarEquivalenciaSegunTipo(
        grupoConCursoNuevo,
        dto.cursosAntiguosMarcados,
      );

      if (evaluacionResultado.esHomologado) {
        // Curso completamente homologado
        const cursosNombres = await this.obtenerNombresCursos(
          evaluacionResultado.cursosAntiguosPresentes,
        );
        resultado[cursoId] = {
          estado: 'HOMOLOGADO',
          observacion: `Homologado por: ${cursosNombres.join(', ')}.`,
          cursoNuevo: {
            id: cursoNuevo.id,
            nombre: cursoNuevo.nombre,
            creditos: cursoNuevo.creditos,
            semestre: cursoNuevo.semestre,
          },
          grupoId: grupoConCursoNuevo.id,
          cursosAntiguosPresentes: evaluacionResultado.cursosAntiguosPresentes,
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
          cursosAntiguosPresentes: evaluacionResultado.cursosAntiguosPresentes,
          cursosAntiguosFaltantes: [],
          cursosAntiguosSeleccionados: dto.cursosAntiguosMarcados,
        });
      } else {
        // Curso parcialmente completo
        const cursosVistos = await this.obtenerNombresCursos(
          evaluacionResultado.cursosAntiguosPresentes,
        );
        const cursosFaltantes = await this.obtenerNombresCursos(
          evaluacionResultado.cursosAntiguosFaltantes,
        );

        let observacion = evaluacionResultado.observacion || '';
        if (!observacion) {
          if (cursosVistos.length > 0) {
            observacion += `Tienes: ${cursosVistos.join(', ')}. `;
          }
          observacion += `Te falta: ${cursosFaltantes.join(', ')}.`;
        }

        resultado[cursoId] = {
          estado: 'INCOMPLETO',
          observacion,
          cursoNuevo: {
            id: cursoNuevo.id,
            nombre: cursoNuevo.nombre,
            creditos: cursoNuevo.creditos,
            semestre: cursoNuevo.semestre,
          },
          grupoId: grupoConCursoNuevo.id,
          cursosAntiguosPresentes: evaluacionResultado.cursosAntiguosPresentes,
          cursosAntiguosFaltantes: evaluacionResultado.cursosAntiguosFaltantes,
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
          cursosAntiguosPresentes: evaluacionResultado.cursosAntiguosPresentes,
          cursosAntiguosFaltantes: evaluacionResultado.cursosAntiguosFaltantes,
          cursosAntiguosSeleccionados: dto.cursosAntiguosMarcados,
        });
      }
    }

    // Guardar todos los resultados en la base de datos
    if (resultadosParaGuardar.length > 0) {
      await this.resultadoHomologacionRepository.save(resultadosParaGuardar);
    }

    // Calcular créditos
    const resumenConCreditos = await this.calcularResumenConCreditos(
      dto,
      cursosNuevos,
      resultado,
    );

    return {
      porCursoNuevo: resultado,
      resumen: {
        homologados,
        incompletos,
        noAplica,
        ...resumenConCreditos,
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

  private async calcularResumenConCreditos(
    dto: EvaluarEquivalenciasDto,
    cursosNuevos: Curso[],
    resultado: Record<string, ResultadoCurso>,
  ) {
    // Calcular créditos de cursos antiguos completados
    const cursosAntiguosCompletados = await this.cursoRepository.find({
      where: dto.cursosAntiguosMarcados.map((id) => ({ id })),
    });

    const creditosCompletadosMallaAntigua = cursosAntiguosCompletados.reduce(
      (total, curso) => total + curso.creditos,
      0,
    );

    // Calcular créditos homologados en la malla nueva
    let creditosHomologadosMallaNueva = 0;

    for (const resultadoCurso of Object.values(resultado)) {
      if (resultadoCurso.estado === 'HOMOLOGADO') {
        creditosHomologadosMallaNueva += resultadoCurso.cursoNuevo.creditos;
      }
    }

    // Calcular total de créditos de la malla nueva
    const totalCreditosMallaNueva = cursosNuevos.reduce(
      (total, curso) => total + curso.creditos,
      0,
    );

    return {
      creditosCompletadosMallaAntigua,
      creditosHomologadosMallaNueva,
      totalCreditosMallaNueva,
    };
  }

  private async calcularResumenDesdeResultados(
    resultados: ResultadoHomologacion[],
    dto: GetResultadosHomologacionDto,
  ) {
    if (resultados.length === 0) {
      return {
        homologados: 0,
        incompletos: 0,
        noAplica: 0,
        creditosCompletadosMallaAntigua: 0,
        creditosHomologadosMallaNueva: 0,
        totalCreditosMallaNueva: 0,
      };
    }

    // Agrupar por estado para contar
    const resumenBasico = resultados.reduce(
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

    // Calcular créditos desde los resultados guardados
    const cursosAntiguosSeleccionados =
      resultados[0]?.cursosAntiguosSeleccionados || [];

    let creditosCompletadosMallaAntigua = 0;
    if (cursosAntiguosSeleccionados.length > 0) {
      const cursosAntiguos = await this.cursoRepository.find({
        where: cursosAntiguosSeleccionados.map((id) => ({ id })),
      });
      creditosCompletadosMallaAntigua = cursosAntiguos.reduce(
        (total, curso) => total + curso.creditos,
        0,
      );
    }

    // Calcular créditos homologados en malla nueva
    const cursosHomologados = resultados.filter(
      (r) => r.estado === EstadoHomologacion.HOMOLOGADO,
    );
    let creditosHomologadosMallaNueva = 0;
    for (const resultado of cursosHomologados) {
      if (resultado.cursoNuevo) {
        creditosHomologadosMallaNueva += resultado.cursoNuevo.creditos;
      }
    }

    // Calcular total de créditos de malla nueva
    let totalCreditosMallaNueva = 0;
    if (dto.mallaNuevaId) {
      const cursosNuevos = await this.cursoRepository.find({
        where: { mallaCurricularId: dto.mallaNuevaId },
      });
      totalCreditosMallaNueva = cursosNuevos.reduce(
        (total, curso) => total + curso.creditos,
        0,
      );
    }

    return {
      ...resumenBasico,
      creditosCompletadosMallaAntigua,
      creditosHomologadosMallaNueva,
      totalCreditosMallaNueva,
    };
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
  ): Promise<ResultadosEstudianteResponse> {
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

    const resultados = await this.resultadoHomologacionRepository.find({
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

    // Calcular resumen basado en los resultados
    const resumen = await this.calcularResumenDesdeResultados(resultados, dto);

    return {
      resultados,
      resumen,
      estudianteId: dto.estudianteId,
      mallaAntiguaId: dto.mallaAntiguaId,
      mallaNuevaId: dto.mallaNuevaId,
    };
  }

  async getUltimaEvaluacionEstudiante(
    estudianteId: number,
    mallaAntiguaId: number,
    mallaNuevaId: number,
  ): Promise<ResultadosEstudianteResponse> {
    const resultados = await this.resultadoHomologacionRepository.find({
      where: {
        estudianteId,
        mallaAntiguaId,
        mallaNuevaId,
      },
      relations: [
        'estudiante',
        'mallaAntigua',
        'mallaNueva',
        'cursoNuevo',
        'grupo',
      ],
      order: { created_at: 'DESC' },
    });

    // Crear DTO para calcular resumen
    const dto: GetResultadosHomologacionDto = {
      estudianteId,
      mallaAntiguaId,
      mallaNuevaId,
    };

    // Calcular resumen basado en los resultados
    const resumen = await this.calcularResumenDesdeResultados(resultados, dto);

    return {
      resultados,
      resumen,
      estudianteId,
      mallaAntiguaId,
      mallaNuevaId,
    };
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

  /**
   * Verifica si un estudiante ya tiene resultados de equivalencia registrados
   * @param estudianteId ID del estudiante
   * @returns boolean - true si tiene equivalencias, false si no
   */
  async estudianteTieneEquivalencias(estudianteId: number): Promise<boolean> {
    const count = await this.resultadoHomologacionRepository.count({
      where: { estudianteId },
    });
    return count > 0;
  }

  /**
   * Verifica si un estudiante tiene equivalencias para una combinación específica de mallas
   * @param estudianteId ID del estudiante
   * @param mallaAntiguaId ID de la malla antigua
   * @param mallaNuevaId ID de la malla nueva
   * @returns boolean - true si tiene equivalencias para esas mallas, false si no
   */
  async estudianteTieneEquivalenciasParaMallas(
    estudianteId: number,
    mallaAntiguaId: number,
    mallaNuevaId: number,
  ): Promise<boolean> {
    const count = await this.resultadoHomologacionRepository.count({
      where: {
        estudianteId,
        mallaAntiguaId,
        mallaNuevaId,
      },
    });
    return count > 0;
  }

  findEquivalenciasByEstudiante(
    estudianteId: number,
  ): Promise<ResultadoHomologacion[]> {
    return this.resultadoHomologacionRepository.find({
      where: { estudianteId },
      relations: ['cursoNuevo', 'grupo', 'mallaAntigua', 'mallaNueva'],
    });
  }

  /**
   * Procesa grupos de tipo OPCIONAL_NUEVA donde un curso antiguo puede homologar múltiples cursos nuevos
   */
  private async procesarGruposOpcionalNueva(
    grupos: EquivalenciaGrupo[],
    cursosAntiguosMarcados: number[],
    resultado: Record<string, ResultadoCurso>,
    resultadosParaGuardar: Partial<ResultadoHomologacion>[],
    cursosNuevosYaProcesados: Set<number>,
    dto: EvaluarEquivalenciasDto,
  ): Promise<void> {
    const gruposOpcionalNueva = grupos.filter(
      (grupo) => grupo.tipo === TipoEquivalencia.OPCIONAL_NUEVA,
    );

    for (const grupo of gruposOpcionalNueva) {
      const cursosAntiguosDelGrupo = grupo.items
        .filter((item) => item.lado === LadoEquivalencia.ANTIGUA)
        .map((item) => item.cursoId);

      const cursosNuevosDelGrupo = grupo.items
        .filter((item) => item.lado === LadoEquivalencia.NUEVA)
        .map((item) => item.cursoId);

      // Verificar si el estudiante tiene algún curso antiguo de este grupo
      const cursosAntiguosPresentes = cursosAntiguosDelGrupo.filter((cursoId) =>
        cursosAntiguosMarcados.includes(cursoId),
      );

      if (cursosAntiguosPresentes.length > 0) {
        // El estudiante tiene curso(s) antiguo(s) de este grupo
        // Seleccionar el primer curso nuevo disponible que no haya sido procesado
        const cursoNuevoDisponible = cursosNuevosDelGrupo.find(
          (cursoId) => !cursosNuevosYaProcesados.has(cursoId),
        );

        if (cursoNuevoDisponible) {
          // Obtener información completa del curso nuevo
          const cursoNuevo = await this.cursoRepository.findOne({
            where: { id: cursoNuevoDisponible },
          });

          if (cursoNuevo) {
            const cursoId = cursoNuevo.id.toString();
            const cursosNombres = await this.obtenerNombresCursos(
              cursosAntiguosPresentes,
            );

            // Marcar como homologado
            resultado[cursoId] = {
              estado: 'HOMOLOGADO',
              observacion: `Homologado por: ${cursosNombres.join(', ')} (equivalencia flexible).`,
              cursoNuevo: {
                id: cursoNuevo.id,
                nombre: cursoNuevo.nombre,
                creditos: cursoNuevo.creditos,
                semestre: cursoNuevo.semestre,
              },
              grupoId: grupo.id,
              cursosAntiguosPresentes,
              cursosAntiguosFaltantes: [],
            };

            // Guardar resultado en BD
            resultadosParaGuardar.push({
              estudianteId: dto.estudianteId,
              mallaAntiguaId: dto.mallaAntiguaId,
              mallaNuevaId: dto.mallaNuevaId,
              cursoNuevoId: cursoNuevo.id,
              estado: EstadoHomologacion.HOMOLOGADO,
              observacion: `Homologado por: ${cursosNombres.join(', ')} (equivalencia flexible).`,
              grupoId: grupo.id,
              cursosAntiguosPresentes,
              cursosAntiguosFaltantes: [],
              cursosAntiguosSeleccionados: dto.cursosAntiguosMarcados,
            });

            // Marcar este curso como procesado
            cursosNuevosYaProcesados.add(cursoNuevo.id);
          }
        }
      }
    }
  }

  /**
   * Evalúa una equivalencia según su tipo específico
   */
  private evaluarEquivalenciaSegunTipo(
    grupo: EquivalenciaGrupo,
    cursosAntiguosMarcados: number[],
  ): EvaluacionEquivalenciaResult {
    const cursosAntiguosRequeridos = grupo.items
      .filter((item) => item.lado === LadoEquivalencia.ANTIGUA)
      .map((item) => item.cursoId);

    const cursosNuevosDisponibles = grupo.items
      .filter((item) => item.lado === LadoEquivalencia.NUEVA)
      .map((item) => item.cursoId);

    const cursosAntiguosPresentes = cursosAntiguosRequeridos.filter((cursoId) =>
      cursosAntiguosMarcados.includes(cursoId),
    );

    const cursosAntiguosFaltantes = cursosAntiguosRequeridos.filter(
      (cursoId) => !cursosAntiguosMarcados.includes(cursoId),
    );

    switch (grupo.tipo) {
      case TipoEquivalencia.COMPLETA:
        // Comportamiento original: todos los cursos antiguos son requeridos
        return {
          esHomologado: cursosAntiguosFaltantes.length === 0,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes,
        };

      case TipoEquivalencia.OPCIONAL_ANTIGUA:
        // Cualquiera de los cursos antiguos puede homologar el curso nuevo
        return {
          esHomologado: cursosAntiguosPresentes.length > 0,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes:
            cursosAntiguosPresentes.length > 0 ? [] : cursosAntiguosRequeridos,
          observacion:
            cursosAntiguosPresentes.length === 0
              ? `Necesitas cursar al menos uno de los siguientes cursos de la malla antigua.`
              : undefined,
        };

      case TipoEquivalencia.OPCIONAL_NUEVA:
        // El curso antiguo puede homologar cualquiera de los cursos nuevos disponibles
        // (Esta lógica se manejaría de forma diferente en el flujo principal)
        return {
          esHomologado: cursosAntiguosPresentes.length > 0,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes:
            cursosAntiguosPresentes.length > 0 ? [] : cursosAntiguosRequeridos,
        };

      default:
        return {
          esHomologado: cursosAntiguosFaltantes.length === 0,
          cursosAntiguosPresentes,
          cursosAntiguosFaltantes,
        };
    }
  }
}

interface EvaluacionEquivalenciaResult {
  esHomologado: boolean;
  cursosAntiguosPresentes: number[];
  cursosAntiguosFaltantes: number[];
  observacion?: string;
}

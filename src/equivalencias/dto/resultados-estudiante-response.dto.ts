import { ResultadoHomologacion } from '../entities/resultado-homologacion.entity';
import { ResumenEvaluacion } from './evaluacion-resultado.dto';

export interface ResultadosEstudianteResponse {
  resultados: ResultadoHomologacion[];
  resumen: ResumenEvaluacion;
  estudianteId: number;
  mallaAntiguaId?: number;
  mallaNuevaId?: number;
}

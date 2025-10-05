export interface CursoInfo {
  id: number;
  nombre: string;
  creditos: number;
  semestre: string; // Será el valor del enum Semestre
}

export interface ResultadoCurso {
  estado: 'HOMOLOGADO' | 'INCOMPLETO' | 'NO_APLICA';
  observacion: string;
  cursoNuevo: CursoInfo;
  grupoId?: number;
  cursosAntiguosPresentes: number[];
  cursosAntiguosFaltantes: number[];
}

export interface ResumenEvaluacion {
  homologados: number;
  incompletos: number;
  noAplica: number;
}

export interface EvaluacionResultado {
  porCursoNuevo: Record<string, ResultadoCurso>;
  resumen: ResumenEvaluacion;
}

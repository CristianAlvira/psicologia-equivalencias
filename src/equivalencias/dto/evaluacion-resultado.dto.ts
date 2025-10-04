export interface ResultadoCurso {
  estado: 'HOMOLOGADO' | 'INCOMPLETO' | 'NO_APLICA';
  observacion: string;
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

export class ResumenResultadosDto {
  totalEvaluaciones: number;
  ultimaEvaluacion: Date;
  resumenActual: {
    homologados: number;
    incompletos: number;
    noAplica: number;
    totalCursosNuevos: number;
  };
}

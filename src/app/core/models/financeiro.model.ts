export interface ConfiguracaoFinanceiraResponse {
  id: number;
  jurosMensal: number;
  jurosDiario: number;
  multaFixa: number;
  diasCarencia: number;
  igpmAtual: number;
  igpmDataReferencia: string;
  formasPagamento: string;
  observacoes: string;
}

export interface ConfiguracaoFinanceiraRequest {
  jurosMensal?: number;
  jurosDiario?: number;
  multaFixa?: number;
  diasCarencia?: number;
  igpmAtual?: number;
  igpmDataReferencia?: string;
  formasPagamento?: string;
  observacoes?: string;
}

export interface DashboardResponse {
  totalImoveisDisponiveis: number;
  totalImoveisAlugados: number;
  totalImoveisVendidos: number;
  contratosAtivosVenda: number;
  contratosAtivosAluguel: number;
  faturamentoPrevistoMes: number;
  faturamentoRealizadoMes: number;
  inadimplencia: number;
}

export interface CarneResponse {
  titulo: string;
  contratoId: number;
  nomeCliente: string;
  cpfCnpjCliente: string;
  boletos: BoletoCarneDTO[];
}

export interface BoletoCarneDTO {
  numeroParcela: number | null;
  dataVencimento: string;
  valorFinal: number;
  codigoBarras: string;
  instrucoes: string;
}

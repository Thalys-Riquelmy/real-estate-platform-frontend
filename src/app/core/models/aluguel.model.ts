import { EmpresaResponse } from './empresa.model';
import { ImovelResponse } from './imovel.model';
import { ClienteResponse } from './cliente.model';

export interface AluguelResponse {
  id: number;
  dataInicio: string;
  dataFim: string | null;
  valorAluguel: number;
  diaVencimento: number;
  status: string;
  contratoUrl: string;
  createdAt: string;
  empresa?: EmpresaResponse;
  imovel?: ImovelResponse;
  cliente?: ClienteResponse;
  prestacoes?: PrestacaoAluguelResponse[];
}

export interface AluguelRequest {
  imovelId: number;
  clienteId: number;
  dataInicio: string;
  dataFim?: string | null;
  valorAluguel: number;
  diaVencimento: number;
}

export interface PrestacaoAluguelResponse {
  id: number;
  dataVencimento: string;
  valor: number;
  status: string;
  dataPagamento: string | null;
  valorPago: number | null;
  multaValor: number | null;
  jurosValor: number | null;
  formaPagamento: string | null;
  comprovanteUrl: string | null;
  observacao: string | null;
}

export interface PagamentoParcelaRequest {
  dataPagamento?: string;
  formaPagamento?: string;
  observacao?: string;
}

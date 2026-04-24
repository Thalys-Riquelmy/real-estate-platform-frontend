import { EmpresaResponse } from './empresa.model';
import { ImovelResponse } from './imovel.model';
import { ClienteResponse } from './cliente.model';

export interface VendaResponse {
  id: number;
  dataContrato: string;
  valorImovel: number;
  valorEntrada: number;
  saldoFinanciado: number;
  quantidadeParcelas: number;
  diaVencimento: number;
  aplicaIgpm: boolean;
  igpmContrato: number;
  status: string;
  contratoUrl: string;
  createdAt: string;
  empresa?: EmpresaResponse;
  imovel?: ImovelResponse;
  cliente?: ClienteResponse;
  parcelas?: ParcelaVendaResponse[];
}

export interface VendaRequest {
  imovelId: number;
  clienteId: number;
  dataContrato: string;
  valorImovel: number;
  valorEntrada: number;
  quantidadeParcelas: number;
  diaVencimento: number;
  aplicaIgpm?: boolean;
}

export interface ParcelaVendaResponse {
  id: number;
  numeroParcela: number;
  dataVencimento: string;
  valorBase: number;
  igpmAplicado: number;
  valorFinal: number;
  status: string;
  dataPagamento: string | null;
  valorPago: number | null;
  multaValor: number | null;
  jurosValor: number | null;
  formaPagamento: string | null;
  comprovanteUrl: string | null;
  observacao: string | null;
}

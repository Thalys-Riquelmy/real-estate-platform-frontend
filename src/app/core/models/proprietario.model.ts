import { EmpresaResponse } from './empresa.model';

export interface ProprietarioResponse {
  id: number;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  banco: string;
  agencia: string;
  conta: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  empresa?: EmpresaResponse;
}

export interface ProprietarioRequest {
  nome: string;
  cpfCnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
}

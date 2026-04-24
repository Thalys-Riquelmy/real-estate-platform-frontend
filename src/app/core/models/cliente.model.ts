import { EmpresaResponse } from './empresa.model';

export interface ClienteResponse {
  id: number;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  tipo: string;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
  empresa?: EmpresaResponse;
}

export interface ClienteRequest {
  nome: string;
  cpfCnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  tipo: string;
  observacoes?: string;
}

export const TIPO_CLIENTE_OPTIONS = [
  { value: 'comprador', label: 'Comprador' },
  { value: 'locatario', label: 'Locatário' },
  { value: 'ambos', label: 'Ambos' }
];

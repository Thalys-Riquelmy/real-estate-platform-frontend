import { EmpresaResponse } from './empresa.model';
import { ProprietarioResponse } from './proprietario.model';

// Adicione esta interface
export interface ImagemImovelResponse {
  id: number;
  ordem: number;
  principal: boolean;
  contentType: string;
  imagemBase64: string;
}

export interface ImovelResponse {
  id: number;
  tipo: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  areaTerreno: number;
  areaConstruida: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  andar: number;
  valorVenda: number;
  valorAluguel: number;
  status: string;
  imagens?: ImagemImovelResponse[];
  destaque: boolean;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
  empresa?: EmpresaResponse;
  proprietario?: ProprietarioResponse;
}

export interface ImovelRequest {
  proprietarioId: number;
  tipo: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  areaTerreno?: number;
  areaConstruida?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  andar?: number;
  valorVenda?: number;
  valorAluguel?: number;
  status?: string;
  destaque?: boolean;
  observacoes?: string;
}

export interface FiltroImovel {
  status?: string;
  tipo?: string;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  cidade?: string;
  bairro?: string;
  valorVendaMin?: number;
  valorVendaMax?: number;
  valorAluguelMin?: number;
  valorAluguelMax?: number;
  busca?: string;
}

export const TIPO_IMOVEL_OPTIONS = [
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' }
];

export const STATUS_IMOVEL_OPTIONS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'alugado', label: 'Alugado' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'manutencao', label: 'Manutenção' }
];

export const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

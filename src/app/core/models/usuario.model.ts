import { PerfilUsuario } from './enums/perfil-usuario.enum';
import { EmpresaResponse } from '../models/empresa.model';

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  empresa?: EmpresaResponse;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}

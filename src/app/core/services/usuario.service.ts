import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UsuarioRequest, UsuarioResponse } from '../models/usuario.model';
import { ApiResponse } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends ApiService {

  listarPorEmpresa(): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.getEmpresa<ApiResponse<UsuarioResponse[]>>('/usuarios');
  }

  buscarPorId(id: number): Observable<ApiResponse<UsuarioResponse>> {
    return this.getEmpresa<ApiResponse<UsuarioResponse>>(`/usuarios/${id}`);
  }

  criar(dto: UsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.postEmpresa<ApiResponse<UsuarioResponse>>('/usuarios', dto);
  }

  atualizar(id: number, dto: UsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
    return this.putEmpresa<ApiResponse<UsuarioResponse>>(`/usuarios/${id}`, dto);
  }

  desativar(id: number): Observable<ApiResponse<void>> {
    return this.deleteEmpresa<ApiResponse<void>>(`/usuarios/${id}`);
  }

  ativar(id: number): Observable<ApiResponse<void>> {
    return this.patchEmpresa<ApiResponse<void>>(`/usuarios/${id}/ativar`, {});
  }

  alterarSenha(id: number, senhaAntiga: string, senhaNova: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      this.getEmpresaUrl(`/usuarios/${id}/alterar-senha`),
      null,
      { params: { senhaAntiga, senhaNova } }
    );
  }
}

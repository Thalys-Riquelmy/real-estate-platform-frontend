import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProprietarioResponse, ProprietarioRequest } from '../models/proprietario.model';

@Injectable({ providedIn: 'root' })
export class ProprietarioService extends ApiService {

  listar(): Observable<ProprietarioResponse[]> {
    return this.getEmpresa<ProprietarioResponse[]>('/proprietarios');
  }

  buscarPorId(id: number): Observable<ProprietarioResponse> {
    return this.getEmpresa<ProprietarioResponse>(`/proprietarios/${id}`);
  }

  buscarPorCpfCnpj(cpfCnpj: string): Observable<ProprietarioResponse> {
    return this.getEmpresa<ProprietarioResponse>(`/proprietarios/cpf/${cpfCnpj}`);
  }

  criar(dto: ProprietarioRequest): Observable<ProprietarioResponse> {
    return this.postEmpresa<ProprietarioResponse>('/proprietarios', dto);
  }

  atualizar(id: number, dto: ProprietarioRequest): Observable<ProprietarioResponse> {
    return this.putEmpresa<ProprietarioResponse>(`/proprietarios/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.deleteEmpresa<void>(`/proprietarios/${id}`);
  }
}

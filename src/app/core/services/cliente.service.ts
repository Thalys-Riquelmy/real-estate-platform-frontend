import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ClienteResponse, ClienteRequest } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService extends ApiService {

  listar(): Observable<ClienteResponse[]> {
    return this.getEmpresa<ClienteResponse[]>('/clientes');
  }

  buscarPorId(id: number): Observable<ClienteResponse> {
    return this.getEmpresa<ClienteResponse>(`/clientes/${id}`);
  }

  buscarPorCpfCnpj(cpfCnpj: string): Observable<ClienteResponse> {
    return this.getEmpresa<ClienteResponse>(`/clientes/cpf/${cpfCnpj}`);
  }

  listarPorTipo(tipo: string): Observable<ClienteResponse[]> {
    return this.getEmpresa<ClienteResponse[]>(`/clientes/tipo/${tipo}`);
  }

  criar(dto: ClienteRequest): Observable<ClienteResponse> {
    return this.postEmpresa<ClienteResponse>('/clientes', dto);
  }

  atualizar(id: number, dto: ClienteRequest): Observable<ClienteResponse> {
    return this.putEmpresa<ClienteResponse>(`/clientes/${id}`, dto);
  }

  excluir(id: number): Observable<void> {
    return this.deleteEmpresa<void>(`/clientes/${id}`);
  }
}

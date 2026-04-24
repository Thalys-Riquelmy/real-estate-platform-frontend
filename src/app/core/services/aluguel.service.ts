import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AluguelResponse, AluguelRequest, PrestacaoAluguelResponse, PagamentoParcelaRequest } from '../models/aluguel.model';

@Injectable({ providedIn: 'root' })
export class AluguelService extends ApiService {

  listar(): Observable<AluguelResponse[]> {
    return this.getEmpresa<AluguelResponse[]>('/alugueis');
  }

  buscarPorId(id: number): Observable<AluguelResponse> {
    return this.getEmpresa<AluguelResponse>(`/alugueis/${id}`);
  }

  criar(dto: AluguelRequest): Observable<AluguelResponse> {
    return this.postEmpresa<AluguelResponse>('/alugueis', dto);
  }

  getPrestacoes(aluguelId: number): Observable<PrestacaoAluguelResponse[]> {
    return this.getEmpresa<PrestacaoAluguelResponse[]>(`/alugueis/${aluguelId}/prestacoes`);
  }

  pagarPrestacao(aluguelId: number, prestacaoId: number, dto: PagamentoParcelaRequest): Observable<PrestacaoAluguelResponse> {
    return this.postEmpresa<PrestacaoAluguelResponse>(
      `/alugueis/${aluguelId}/prestacoes/${prestacaoId}/pagar`, dto
    );
  }

  gerarMaisPrestacoes(aluguelId: number, meses: number = 12): Observable<PrestacaoAluguelResponse[]> {
    return this.http.post<PrestacaoAluguelResponse[]>(
      this.getEmpresaUrl(`/alugueis/${aluguelId}/gerar-prestacoes?meses=${meses}`), {}
    );
  }

  atualizarStatus(aluguelId: number, status: string): Observable<void> {
    return this.putEmpresa<void>(`/alugueis/${aluguelId}/status`, { status });
  }
}

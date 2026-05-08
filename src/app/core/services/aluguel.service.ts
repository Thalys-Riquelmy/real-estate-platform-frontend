import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AluguelResponse, AluguelRequest, PrestacaoAluguelResponse, PagamentoParcelaRequest, ContratoPdfResponse } from '../models/aluguel.model';

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

  // NOVO: Criar com PDF
  criarComContrato(dto: AluguelRequest, contrato: File): Observable<AluguelResponse> {
    const formData = new FormData();
    formData.append('aluguel', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('contrato', contrato);
    return this.http.post<AluguelResponse>(
      this.getEmpresaUrl('/alugueis/com-contrato'),
      formData
    );
  }

  // NOVO: Atualizar/Upload do PDF
  atualizarContrato(id: number, contrato: File): Observable<AluguelResponse> {
    const formData = new FormData();
    formData.append('contrato', contrato);
    return this.http.put<AluguelResponse>(
      this.getEmpresaUrl(`/alugueis/${id}/contrato`),
      formData
    );
  }

  downloadContrato(id: number): Observable<Blob> {
    return this.http.get(this.getEmpresaUrl(`/alugueis/${id}/contrato-pdf`), {
      responseType: 'blob'
    });
  }

  getContratoUrl(id: number): string {
    const empresaId = localStorage.getItem('empresaId') || '1';
    return `${this.apiUrl}/empresas/${empresaId}/alugueis/${id}/contrato-pdf`;
  }

  getContratoBase64(id: number): Observable<ContratoPdfResponse> {
    return this.getEmpresa<ContratoPdfResponse>(`/alugueis/${id}/contrato-base64`);
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
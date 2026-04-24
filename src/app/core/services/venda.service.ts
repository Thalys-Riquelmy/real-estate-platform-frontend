import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { VendaResponse, VendaRequest, ParcelaVendaResponse } from '../models/venda.model';
import { PagamentoParcelaRequest } from '../models/aluguel.model';

@Injectable({ providedIn: 'root' })
export class VendaService extends ApiService {

  listar(): Observable<VendaResponse[]> {
    return this.getEmpresa<VendaResponse[]>('/vendas');
  }

  buscarPorId(id: number): Observable<VendaResponse> {
    return this.getEmpresa<VendaResponse>(`/vendas/${id}`);
  }

  criar(dto: VendaRequest): Observable<VendaResponse> {
    return this.postEmpresa<VendaResponse>('/vendas', dto);
  }

  getParcelas(vendaId: number): Observable<ParcelaVendaResponse[]> {
    return this.getEmpresa<ParcelaVendaResponse[]>(`/vendas/${vendaId}/parcelas`);
  }

  pagarParcela(vendaId: number, parcelaId: number, dto: PagamentoParcelaRequest): Observable<ParcelaVendaResponse> {
    return this.postEmpresa<ParcelaVendaResponse>(
      `/vendas/${vendaId}/parcelas/${parcelaId}/pagar`, dto
    );
  }

  atualizarStatus(vendaId: number, status: string): Observable<void> {
    return this.putEmpresa<void>(`/vendas/${vendaId}/status`, { status });
  }
}

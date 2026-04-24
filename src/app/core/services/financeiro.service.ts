import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ConfiguracaoFinanceiraResponse,
  ConfiguracaoFinanceiraRequest,
  DashboardResponse,
  CarneResponse
} from '../models/financeiro.model';

@Injectable({ providedIn: 'root' })
export class FinanceiroService extends ApiService {

  getConfiguracoes(): Observable<ConfiguracaoFinanceiraResponse> {
    return this.getEmpresa<ConfiguracaoFinanceiraResponse>('/configuracoes-financeiras');
  }

  updateConfiguracoes(dto: ConfiguracaoFinanceiraRequest): Observable<ConfiguracaoFinanceiraResponse> {
    return this.putEmpresa<ConfiguracaoFinanceiraResponse>('/configuracoes-financeiras', dto);
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.getEmpresa<DashboardResponse>('/dashboard');
  }

  gerarCarneVenda(vendaId: number): Observable<CarneResponse> {
    return this.getEmpresa<CarneResponse>(`/financeiro/carnes/venda/${vendaId}`);
  }

  gerarCarneAluguel(aluguelId: number): Observable<CarneResponse> {
    return this.getEmpresa<CarneResponse>(`/financeiro/carnes/aluguel/${aluguelId}`);
  }
}

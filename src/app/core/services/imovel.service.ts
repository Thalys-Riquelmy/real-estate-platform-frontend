import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ImovelResponse, ImovelRequest, FiltroImovel } from '../models/imovel.model';

@Injectable({ providedIn: 'root' })
export class ImovelService extends ApiService {

  listar(filtro?: FiltroImovel): Observable<ImovelResponse[]> {
    let params = new HttpParams();
    if (filtro) {
      Object.entries(filtro).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.getEmpresa<ImovelResponse[]>('/imoveis', params);
  }

  buscarPorId(id: number): Observable<ImovelResponse> {
    return this.getEmpresa<ImovelResponse>(`/imoveis/${id}`);
  }

  criar(dto: ImovelRequest): Observable<ImovelResponse> {
    return this.postEmpresa<ImovelResponse>('/imoveis', dto);
  }

  atualizar(id: number, dto: ImovelRequest): Observable<ImovelResponse> {
    return this.putEmpresa<ImovelResponse>(`/imoveis/${id}`, dto);
  }

  atualizarStatus(id: number, status: string): Observable<void> {
    return this.patchEmpresa<void>(`/imoveis/${id}/status`, { status });
  }

  excluir(id: number): Observable<void> {
    return this.deleteEmpresa<void>(`/imoveis/${id}`);
  }

  uploadFotos(id: number, fotos: File[]): Observable<ImovelResponse> {
    const formData = new FormData();
    fotos.forEach(f => formData.append('fotos', f));
    return this.http.post<ImovelResponse>(
      this.getEmpresaUrl(`/imoveis/${id}/fotos`),
      formData
    );
  }
}

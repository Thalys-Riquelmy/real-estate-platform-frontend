import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ImovelResponse, ImovelRequest, FiltroImovel, ImagemImovelResponse } from '../models/imovel.model';

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

  criarComImagens(dto: ImovelRequest, imagens: File[]): Observable<ImovelResponse> {
    const formData = new FormData();
    formData.append('imovel', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    imagens.forEach(img => formData.append('imagens', img));
    return this.http.post<ImovelResponse>(
      this.getEmpresaUrl('/imoveis/com-imagens'),
      formData
    );
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

  // Novos endpoints para imagens
  listarImagens(imovelId: number): Observable<ImagemImovelResponse[]> {
    return this.getEmpresa<ImagemImovelResponse[]>(`/imoveis/${imovelId}/imagens`);
  }

  uploadImagens(imovelId: number, imagens: File[]): Observable<ImagemImovelResponse[]> {
    const formData = new FormData();
    imagens.forEach(img => formData.append('imagens', img));
    return this.http.post<ImagemImovelResponse[]>(
      this.getEmpresaUrl(`/imoveis/${imovelId}/imagens/upload`),
      formData
    );
  }

  adicionarImagem(imovelId: number, imagem: File, principal: boolean = false): Observable<ImagemImovelResponse> {
    const formData = new FormData();
    formData.append('imagem', imagem);
    formData.append('principal', String(principal));
    return this.http.post<ImagemImovelResponse>(
      this.getEmpresaUrl(`/imoveis/${imovelId}/imagens`),
      formData
    );
  }

  removerImagem(imovelId: number, imagemId: number): Observable<void> {
    return this.deleteEmpresa<void>(`/imoveis/${imovelId}/imagens/${imagemId}`);
  }

  definirImagemPrincipal(imovelId: number, imagemId: number): Observable<void> {
    return this.patchEmpresa<void>(`/imoveis/${imovelId}/imagens/${imagemId}/principal`, {});
  }

  atualizarComImagens(id: number, dto: ImovelRequest, imagens: File[]): Observable<ImovelResponse> {
    const formData = new FormData();
    formData.append('imovel', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    imagens.forEach(img => formData.append('imagens', img));
    return this.http.put<ImovelResponse>(
      this.getEmpresaUrl(`/imoveis/${id}/com-imagens`),
      formData
    );
  }
}
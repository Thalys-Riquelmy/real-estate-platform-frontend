import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected http = inject(HttpClient);
  protected authService = inject(AuthService);
  
  protected get apiUrl(): string {
    return environment.apiUrl;
  }
  
  protected get empresaId(): number | null {
    return this.authService.getSelectedEmpresa()?.id ?? null;
  }
  
  protected getUrl(endpoint: string): string {
    return `${this.apiUrl}${endpoint}`;
  }
  
  protected getEmpresaUrl(endpoint: string): string {
    const id = this.empresaId;
    if (!id) {
      throw new Error('Nenhuma empresa selecionada');
    }
    return `${this.apiUrl}/empresas/${id}${endpoint}`;
  }
  
  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.getUrl(url), { params });
  }
  
  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(this.getUrl(url), body);
  }
  
  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(this.getUrl(url), body);
  }
  
  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(this.getUrl(url), body);
  }
  
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.getUrl(url));
  }
  
  // Métodos com empresaId automático
  getEmpresa<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(this.getEmpresaUrl(endpoint), { params });
  }
  
  postEmpresa<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(this.getEmpresaUrl(endpoint), body);
  }
  
  putEmpresa<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(this.getEmpresaUrl(endpoint), body);
  }
  
  patchEmpresa<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(this.getEmpresaUrl(endpoint), body);
  }
  
  deleteEmpresa<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.getEmpresaUrl(endpoint));
  }
}

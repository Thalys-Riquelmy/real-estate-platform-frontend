import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'CORRETOR';
  ativo: boolean;
  empresa?: EmpresaResponse;
  createdAt: string;
  updatedAt: string;
}

export interface EmpresaResponse {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  logoUrl: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface TokenResponse {
  token: string;
  tipo: string;
  expiresIn: number;
  usuario: UsuarioResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';
  private readonly EMPRESA_KEY = 'selected_empresa';
  
  // Signals para reatividade
  private currentUserSignal = signal<UsuarioResponse | null>(null);
  private currentEmpresaSignal = signal<EmpresaResponse | null>(null);
  
  public currentUser = this.currentUserSignal.asReadonly();
  public currentEmpresa = this.currentEmpresaSignal.asReadonly();

  constructor() {
    this.loadStoredData();
  }

  private loadStoredData(): void {
    try {
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const user = JSON.parse(storedUser);
        this.currentUserSignal.set(user);
        
        // Auto-seleciona empresa se não houver uma gravada
        const storedEmpresa = localStorage.getItem(this.EMPRESA_KEY);
        if ((!storedEmpresa || storedEmpresa === 'undefined' || storedEmpresa === 'null') && user.empresa) {
          this.setSelectedEmpresa(user.empresa);
        } else if (storedEmpresa && storedEmpresa !== 'undefined' && storedEmpresa !== 'null') {
          this.currentEmpresaSignal.set(JSON.parse(storedEmpresa));
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do localStorage:', error);
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http.post<ApiResponse<TokenResponse>>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const { token, usuario } = response.data;
            this.setToken(token);
            this.setCurrentUser(usuario);
            this.currentUserSignal.set(usuario);
            
            if (usuario.empresa) {
              this.setSelectedEmpresa(usuario.empresa);
            }
          }
        })
      );
  }

  logout(): void {
    this.clearToken();
    this.clearCurrentUser();
    this.currentUserSignal.set(null);
    this.currentEmpresaSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token === 'undefined' || token === 'null') return null;
    return token;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private setCurrentUser(user: UsuarioResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EMPRESA_KEY);
  }

  setSelectedEmpresa(empresa: EmpresaResponse): void {
    localStorage.setItem(this.EMPRESA_KEY, JSON.stringify(empresa));
    this.currentEmpresaSignal.set(empresa);
  }

  getSelectedEmpresa(): EmpresaResponse | null {
    return this.currentEmpresaSignal();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token !== '';
  }

  isAdmin(): boolean {
    return this.currentUserSignal()?.perfil === 'ADMIN';
  }
}

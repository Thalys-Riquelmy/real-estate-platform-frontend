import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'empresas',
        loadChildren: () => import('./features/empresas/empresas.routes').then(m => m.EMPRESAS_ROUTES)
      },
      {
        path: 'clientes',
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      {
        path: 'proprietarios',
        loadChildren: () => import('./features/proprietarios/proprietarios.routes').then(m => m.PROPRIETARIOS_ROUTES)
      },
      {
        path: 'imoveis',
        loadChildren: () => import('./features/imoveis/imoveis.routes').then(m => m.IMOVEIS_ROUTES)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
      },
      {
        path: 'alugueis',
        loadChildren: () => import('./features/alugueis/alugueis.routes').then(m => m.ALUGUEIS_ROUTES)
      },
      {
        path: 'vendas',
        loadChildren: () => import('./features/vendas/vendas.routes').then(m => m.VENDAS_ROUTES)
      },
      {
        path: 'financeiro',
        loadChildren: () => import('./features/financeiro/financeiro.routes').then(m => m.FINANCEIRO_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

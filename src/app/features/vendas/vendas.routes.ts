import { Routes } from '@angular/router';

export const VENDAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/vendas-list/vendas-list.component').then(m => m.VendasListComponent)
  }
];

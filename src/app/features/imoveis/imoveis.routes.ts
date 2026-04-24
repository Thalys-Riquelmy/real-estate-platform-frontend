import { Routes } from '@angular/router';

export const IMOVEIS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/imoveis-list/imoveis-list.component').then(m => m.ImoveisListComponent)
  }
];

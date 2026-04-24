import { Routes } from '@angular/router';

export const ALUGUEIS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/alugueis-list/alugueis-list.component').then(m => m.AlugueisListComponent)
  }
];

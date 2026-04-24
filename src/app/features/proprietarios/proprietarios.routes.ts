import { Routes } from '@angular/router';

export const PROPRIETARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/proprietarios-list/proprietarios-list.component').then(m => m.ProprietariosListComponent)
  }
];

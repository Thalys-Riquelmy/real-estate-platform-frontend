import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  @Input() isOpen = true;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-gauge-high', route: '/dashboard' },
    { label: 'Empresas', icon: 'fa-solid fa-building', route: '/empresas', roles: ['ADMIN'] },
    { label: 'Clientes', icon: 'fa-solid fa-user-group', route: '/clientes' },
    { label: 'Proprietários', icon: 'fa-solid fa-house-user', route: '/proprietarios' },
    { label: 'Imóveis', icon: 'fa-solid fa-city', route: '/imoveis' },
    { label: 'Usuários', icon: 'fa-solid fa-user-shield', route: '/usuarios', roles: ['ADMIN'] },
    { label: 'Aluguéis', icon: 'fa-solid fa-file-contract', route: '/alugueis' },
    { label: 'Vendas', icon: 'fa-solid fa-handshake', route: '/vendas' },
    { label: 'Financeiro', icon: 'fa-solid fa-chart-line', route: '/financeiro' }
  ];

  get visibleMenuItems(): MenuItem[] {
    const isAdmin = this.authService.isAdmin();
    return this.menuItems.filter(item => 
      !item.roles || item.roles.includes(isAdmin ? 'ADMIN' : 'CORRETOR')
    );
  }
}

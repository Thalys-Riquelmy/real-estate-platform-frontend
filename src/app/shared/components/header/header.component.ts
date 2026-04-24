import { Component, OnInit, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  
  menuClick = output<void>();
  
  userName = signal('');
  userPerfil = signal('');
  empresaNome = signal('');
  showUserMenu = signal(false);

  currentUser$ = toObservable(this.authService.currentUser);
  currentEmpresa$ = toObservable(this.authService.currentEmpresa);

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.userName.set(user.nome);
        this.userPerfil.set(user.perfil === 'ADMIN' ? 'Administrador' : 'Corretor');
      }
    });
    
    this.currentEmpresa$.subscribe(empresa => {
      if (empresa) {
        this.empresaNome.set(empresa.nome);
      }
    });
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.success('Logout realizado com sucesso');
    this.router.navigate(['/login']);
  }
}

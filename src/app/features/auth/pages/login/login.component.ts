import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  
  loading = signal(false);
  showPassword = signal(false);
  
  loginForm = this.fb.group({
    email: [localStorage.getItem('remembered_email') || '', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [!!localStorage.getItem('remembered_email')]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    
    this.authService.login(this.loginForm.value as LoginRequest).subscribe({
      next: () => {
        this.loading.set(false);
        
        // Tratar "Lembrar-me"
        if (this.loginForm.get('rememberMe')?.value) {
          localStorage.setItem('remembered_email', this.loginForm.get('email')?.value || '');
        } else {
          localStorage.removeItem('remembered_email');
        }

        this.notificationService.success('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erro no login', err);
        this.notificationService.error('Email ou senha inválidos');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}

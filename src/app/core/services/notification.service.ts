import { Injectable } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warn' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  show(message: string, type: NotificationType = 'info'): void {
    // Implementação temporária com console e alert enquanto removemos bibliotecas
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Opcionalmente usar alert ou criar um toast customizado depois
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warn');
  }

  info(message: string): void {
    this.show(message, 'info');
  }
}

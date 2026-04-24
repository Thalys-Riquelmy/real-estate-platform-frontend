import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="visible">
      <div class="loading-spinner">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      border-radius: inherit;
    }
    .loading-spinner {
      text-align: center;
      color: var(--primary);
      i { font-size: 2rem; }
    }
    .loading-message {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--slate-600);
    }
  `]
})
export class LoadingComponent {
  @Input() visible = false;
  @Input() message = '';
}

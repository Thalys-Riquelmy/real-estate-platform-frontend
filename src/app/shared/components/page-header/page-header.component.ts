import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() buttonText = '';
  @Input() buttonIcon = 'fa-solid fa-plus';
  @Input() buttonDisabled = false;
  @Output() buttonClick = new EventEmitter<void>();
}

import { Directive, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[maskCep]',
  standalone: true
})
export class MaskCepDirective {
  private el = inject(ElementRef<HTMLInputElement>);

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    if (value.length === 8) {
      value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    
    input.value = value;
  }
}

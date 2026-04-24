import { Directive, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[maskTelefone]',
  standalone: true
})
export class MaskTelefoneDirective {
  private el = inject(ElementRef<HTMLInputElement>);

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length === 10) {
      value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (value.length === 11) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    input.value = value;
  }
}

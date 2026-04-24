import { Directive, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[maskCpfCnpj]',
  standalone: true
})
export class MaskCpfCnpjDirective {
  private el = inject(ElementRef<HTMLInputElement>);

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 14) {
      value = value.slice(0, 14);
    }
    
    if (value.length <= 11) {
      // CPF
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    input.value = value;
  }
}

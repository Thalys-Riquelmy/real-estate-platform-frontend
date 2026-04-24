import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateBr',
  standalone: true
})
export class DateBrPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
}

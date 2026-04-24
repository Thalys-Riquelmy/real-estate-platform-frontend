import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const colors: Record<string, string> = {
      ativo: '#4caf50',
      disponivel: '#4caf50',
      pendente: '#ff9800',
      pago: '#4caf50',
      quitado: '#4caf50',
      atrasado: '#f44336',
      cancelado: '#9e9e9e',
      encerrado: '#9e9e9e',
      vendido: '#2196f3',
      alugado: '#9c27b0',
      inativo: '#f44336'
    };
    
    return colors[status?.toLowerCase()] || '#9e9e9e';
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { DateBrPipe } from '../../../../shared/pipes/date-br.pipe';
import { VendaService } from '../../../../core/services/venda.service';
import { ImovelService } from '../../../../core/services/imovel.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { VendaResponse, VendaRequest, ParcelaVendaResponse } from '../../../../core/models/venda.model';
import { PagamentoParcelaRequest } from '../../../../core/models/aluguel.model';
import { ImovelResponse } from '../../../../core/models/imovel.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-vendas-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
    CurrencyBrPipe, DateBrPipe
  ],
  templateUrl: './vendas-list.component.html',
  styleUrls: ['./vendas-list.component.scss']
})
export class VendasListComponent implements OnInit {
  private service = inject(VendaService);
  private imovelService = inject(ImovelService);
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  vendas = signal<VendaResponse[]>([]);
  imoveis = signal<ImovelResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  parcelas = signal<ParcelaVendaResponse[]>([]);
  
  loading = signal(false);
  loadingParcelas = signal(false);
  
  // Filtros
  searchTerm = signal('');
  filterStatus = signal<string>('');

  showFormModal = signal(false);
  showParcelasModal = signal(false);
  showPagarModal = signal(false);
  
  selectedVenda = signal<VendaResponse | null>(null);
  selectedParcela = signal<ParcelaVendaResponse | null>(null);
  formSubmitting = signal(false);

  form!: FormGroup;
  formPagamento!: FormGroup;

  filteredItems = computed(() => {
    let result = this.vendas();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    if (search) {
      result = result.filter(v =>
        v.imovel?.endereco.toLowerCase().includes(search) ||
        v.cliente?.nome.toLowerCase().includes(search)
      );
    }
    if (status) result = result.filter(v => v.status === status);

    return result;
  });

  totalItems = computed(() => this.vendas().length);
  totalAtivos = computed(() => this.vendas().filter(v => v.status === 'ativo').length);
  totalQuitados = computed(() => this.vendas().filter(v => v.status === 'quitado').length);
  
  totalFinanciado = computed(() => 
    this.vendas().reduce((acc, curr) => acc + curr.valorImovel, 0)
  );

  ngOnInit(): void {
    this.initForms();
    this.carregarDados();
    this.carregarImoveisEClientes();
  }

  private initForms(): void {
    this.form = this.fb.group({
      imovelId: [null, Validators.required],
      clienteId: [null, Validators.required],
      dataContrato: ['', Validators.required],
      valorImovel: [0, [Validators.required, Validators.min(1)]],
      valorEntrada: [0, [Validators.required, Validators.min(0)]],
      quantidadeParcelas: [1, [Validators.required, Validators.min(1), Validators.max(360)]],
      diaVencimento: [5, [Validators.required, Validators.min(1), Validators.max(31)]],
      aplicaIgpm: [false]
    });

    this.formPagamento = this.fb.group({
      dataPagamento: ['', Validators.required],
      formaPagamento: ['PIX', Validators.required],
      observacao: ['']
    });
  }

  carregarDados(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.vendas.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notification.error('Erro ao carregar contratos de venda');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  carregarImoveisEClientes(): void {
    this.imovelService.listar().subscribe({
      next: (data) => this.imoveis.set(data.filter(i => i.status === 'disponivel') || [])
    });
    this.clienteService.listar().subscribe({
      next: (data) => this.clientes.set(data.filter(c => c.tipo === 'comprador' || c.tipo === 'ambos') || [])
    });
  }

  abrirModalNovo(): void {
    const hoje = new Date().toISOString().split('T')[0];
    this.form.reset({
      dataContrato: hoje,
      valorImovel: 0,
      valorEntrada: 0,
      quantidadeParcelas: 1,
      diaVencimento: 5,
      aplicaIgpm: false
    });
    this.showFormModal.set(true);
  }

  fecharModal(): void {
    this.showFormModal.set(false);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: VendaRequest = this.form.value;

    if (dto.valorEntrada >= dto.valorImovel) {
      this.notification.error('A entrada não pode ser maior ou igual ao valor do imóvel');
      this.formSubmitting.set(false);
      return;
    }

    this.service.criar(dto).subscribe({
      next: () => {
        this.notification.success('Contrato de venda criado com sucesso');
        this.fecharModal();
        this.carregarDados();
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao criar venda');
        this.formSubmitting.set(false);
      }
    });
  }

  abrirModalParcelas(venda: VendaResponse): void {
    this.selectedVenda.set(venda);
    this.showParcelasModal.set(true);
    this.carregarParcelas(venda.id);
  }

  fecharModalParcelas(): void {
    this.showParcelasModal.set(false);
    this.selectedVenda.set(null);
    this.parcelas.set([]);
  }

  carregarParcelas(vendaId: number): void {
    this.loadingParcelas.set(true);
    this.service.getParcelas(vendaId).subscribe({
      next: (data) => {
        this.parcelas.set(data || []);
        this.loadingParcelas.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar parcelas');
        this.loadingParcelas.set(false);
      }
    });
  }

  abrirModalPagamento(parcela: ParcelaVendaResponse): void {
    this.selectedParcela.set(parcela);
    const hoje = new Date().toISOString().split('T')[0];
    this.formPagamento.reset({
      dataPagamento: hoje,
      formaPagamento: 'PIX',
      observacao: ''
    });
    this.showPagarModal.set(true);
  }

  fecharModalPagamento(): void {
    this.showPagarModal.set(false);
    this.selectedParcela.set(null);
  }

  confirmarPagamento(): void {
    if (this.formPagamento.invalid) {
      this.formPagamento.markAllAsTouched();
      return;
    }

    const venda = this.selectedVenda();
    const parcela = this.selectedParcela();
    if (!venda || !parcela) return;

    this.formSubmitting.set(true);
    const dto: PagamentoParcelaRequest = this.formPagamento.value;

    this.service.pagarParcela(venda.id, parcela.id, dto).subscribe({
      next: () => {
        this.notification.success('Pagamento registrado com sucesso');
        this.fecharModalPagamento();
        this.carregarParcelas(venda.id);
        this.carregarDados();
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao registrar pagamento');
        this.formSubmitting.set(false);
      }
    });
  }

  mudarStatusRapido(venda: VendaResponse, novoStatus: string): void {
    this.service.atualizarStatus(venda.id, novoStatus).subscribe({
      next: () => {
        this.notification.success('Status alterado com sucesso');
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao alterar status')
    });
  }

  onImovelChange(event: Event): void {
    const imovelId = Number((event.target as HTMLSelectElement).value);
    if (!imovelId) return;
    
    const imovel = this.imoveis().find(i => i.id === imovelId);
    if (imovel && imovel.valorVenda) {
      this.form.patchValue({ valorImovel: imovel.valorVenda });
    }
  }

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onFilterStatusChange(event: Event): void {
    this.filterStatus.set((event.target as HTMLSelectElement).value);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      ativo: 'badge-success',
      inadimplente: 'badge-danger',
      cancelado: 'badge-secondary',
      quitado: 'badge-primary',
      pendente: 'badge-warn', // parcelas
      pago: 'badge-success', // parcelas
      atrasado: 'badge-danger' // parcelas
    };
    return classes[status] || 'badge-secondary';
  }
}

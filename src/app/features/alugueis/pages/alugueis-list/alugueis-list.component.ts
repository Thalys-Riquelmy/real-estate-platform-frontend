import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { DateBrPipe } from '../../../../shared/pipes/date-br.pipe';
import { AluguelService } from '../../../../core/services/aluguel.service';
import { ImovelService } from '../../../../core/services/imovel.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AluguelResponse, AluguelRequest, PrestacaoAluguelResponse, PagamentoParcelaRequest, ContratoPdfResponse } from '../../../../core/models/aluguel.model';
import { ImovelResponse } from '../../../../core/models/imovel.model';
import { ClienteResponse } from '../../../../core/models/cliente.model';
import { SafePipe } from 'src/app/shared/pipes/safe.pipe';

@Component({
  selector: 'app-alugueis-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
    CurrencyBrPipe, DateBrPipe, SafePipe

  ],
  templateUrl: './alugueis-list.component.html',
  styleUrls: ['./alugueis-list.component.scss']
})
export class AlugueisListComponent implements OnInit {
  private service = inject(AluguelService);
  private imovelService = inject(ImovelService);
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  alugueis = signal<AluguelResponse[]>([]);
  imoveis = signal<ImovelResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  prestacoes = signal<PrestacaoAluguelResponse[]>([]);

  loading = signal(false);
  loadingPrestacoes = signal(false);

  // Filtros
  searchTerm = signal('');
  filterStatus = signal<string>('');

  showFormModal = signal(false);
  showPrestacoesModal = signal(false);
  showPagarModal = signal(false);
  showContratoModal = signal(false);

  selectedAluguel = signal<AluguelResponse | null>(null);
  selectedPrestacao = signal<PrestacaoAluguelResponse | null>(null);
  formSubmitting = signal(false);
  uploadingContrato = signal(false);

  // PDF
  contratoSelecionado = signal<File | null>(null);
  pdfVisualizacao = signal<string | null>(null);
  pdfCarregando = signal(false);

  form!: FormGroup;
  formPagamento!: FormGroup;

  filteredItems = computed(() => {
    let result = this.alugueis();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    if (search) {
      result = result.filter(a =>
        a.imovel?.endereco.toLowerCase().includes(search) ||
        a.cliente?.nome.toLowerCase().includes(search)
      );
    }
    if (status) result = result.filter(a => a.status === status);

    return result;
  });

  totalItems = computed(() => this.alugueis().length);
  totalAtivos = computed(() => this.alugueis().filter(a => a.status === 'ativo').length);
  totalInadimplentes = computed(() => this.alugueis().filter(a => a.status === 'inadimplente').length);
  totalEncerrados = computed(() => this.alugueis().filter(a => a.status === 'encerrado').length);

  receitaMensal = computed(() =>
    this.alugueis()
      .filter(a => a.status === 'ativo')
      .reduce((acc, curr) => acc + curr.valorAluguel, 0)
  );

  hasContratoPdf = computed(() => {
    const aluguel = this.selectedAluguel();
    return aluguel?.hasContratoPdf === true;
  });

  ngOnInit(): void {
    this.initForms();
    this.carregarDados();
    this.carregarImoveisEClientes();
  }

  private initForms(): void {
    this.form = this.fb.group({
      imovelId: [null, Validators.required],
      clienteId: [null, Validators.required],
      dataInicio: ['', Validators.required],
      dataFim: [''],
      valorAluguel: [0, [Validators.required, Validators.min(1)]],
      diaVencimento: [5, [Validators.required, Validators.min(1), Validators.max(31)]]
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
        this.alugueis.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notification.error('Erro ao carregar contratos de aluguel');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  carregarImoveisEClientes(): void {
    this.imovelService.listar().subscribe({
      next: (data) => this.imoveis.set(data.filter(i => i.status === 'disponivel' || i.status === 'alugado') || [])
    });
    this.clienteService.listar().subscribe({
      next: (data) => this.clientes.set(data.filter(c => c.tipo === 'locatario' || c.tipo === 'ambos') || [])
    });
  }

  abrirModalNovo(): void {
    this.form.reset({
      diaVencimento: 5,
      valorAluguel: 0
    });
    const hoje = new Date().toISOString().split('T')[0];
    this.form.patchValue({ dataInicio: hoje });
    this.contratoSelecionado.set(null);
    this.showFormModal.set(true);
  }

  fecharModal(): void {
    this.showFormModal.set(false);
    this.contratoSelecionado.set(null);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: AluguelRequest = this.form.value;
    const contrato = this.contratoSelecionado();

    if (contrato) {
      this.service.criarComContrato(dto, contrato).subscribe({
        next: () => {
          this.notification.success('Contrato de aluguel criado com sucesso');
          this.fecharModal();
          this.carregarDados();
          this.formSubmitting.set(false);
          this.contratoSelecionado.set(null);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao criar contrato');
          this.formSubmitting.set(false);
        }
      });
    } else {
      this.service.criar(dto).subscribe({
        next: () => {
          this.notification.success('Contrato de aluguel criado com sucesso');
          this.fecharModal();
          this.carregarDados();
          this.formSubmitting.set(false);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao criar contrato');
          this.formSubmitting.set(false);
        }
      });
    }
  }

  abrirModalPrestacoes(aluguel: AluguelResponse): void {
    this.selectedAluguel.set(aluguel);
    this.showPrestacoesModal.set(true);
    this.carregarPrestacoes(aluguel.id);
  }

  fecharModalPrestacoes(): void {
    this.showPrestacoesModal.set(false);
    this.selectedAluguel.set(null);
    this.prestacoes.set([]);
  }

  carregarPrestacoes(aluguelId: number): void {
    this.loadingPrestacoes.set(true);
    this.service.getPrestacoes(aluguelId).subscribe({
      next: (data) => {
        this.prestacoes.set(data || []);
        this.loadingPrestacoes.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar prestações');
        this.loadingPrestacoes.set(false);
      }
    });
  }

  gerarMaisPrestacoes(): void {
    const aluguel = this.selectedAluguel();
    if (!aluguel) return;

    this.loadingPrestacoes.set(true);
    this.service.gerarMaisPrestacoes(aluguel.id, 12).subscribe({
      next: () => {
        this.notification.success('Mais 12 prestações geradas com sucesso');
        this.carregarPrestacoes(aluguel.id);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao gerar prestações');
        this.loadingPrestacoes.set(false);
      }
    });
  }

  abrirModalPagamento(prestacao: PrestacaoAluguelResponse): void {
    this.selectedPrestacao.set(prestacao);
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
    this.selectedPrestacao.set(null);
  }

  confirmarPagamento(): void {
    if (this.formPagamento.invalid) {
      this.formPagamento.markAllAsTouched();
      return;
    }

    const aluguel = this.selectedAluguel();
    const prestacao = this.selectedPrestacao();
    if (!aluguel || !prestacao) return;

    this.formSubmitting.set(true);
    const dto: PagamentoParcelaRequest = this.formPagamento.value;

    this.service.pagarPrestacao(aluguel.id, prestacao.id, dto).subscribe({
      next: () => {
        this.notification.success('Pagamento registrado com sucesso');
        this.fecharModalPagamento();
        this.carregarPrestacoes(aluguel.id);
        this.carregarDados();
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao registrar pagamento');
        this.formSubmitting.set(false);
      }
    });
  }

  mudarStatusRapido(aluguel: AluguelResponse, novoStatus: string): void {
    this.service.atualizarStatus(aluguel.id, novoStatus).subscribe({
      next: () => {
        this.notification.success('Status do contrato alterado com sucesso');
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao alterar status')
    });
  }

  onImovelChange(event: Event): void {
    const imovelId = Number((event.target as HTMLSelectElement).value);
    if (!imovelId) return;

    const imovel = this.imoveis().find(i => i.id === imovelId);
    if (imovel && imovel.valorAluguel) {
      this.form.patchValue({ valorAluguel: imovel.valorAluguel });
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
      encerrado: 'badge-secondary',
      pendente: 'badge-warn',
      pago: 'badge-success',
      atrasado: 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  // ========== MÉTODOS DO PDF ==========
  onContratoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.notification.error('Apenas arquivos PDF são permitidos');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.notification.error('Arquivo muito grande. Máximo 10MB');
        return;
      }
      this.contratoSelecionado.set(file);
    }
  }

  removerContratoSelecionado(): void {
    this.contratoSelecionado.set(null);
    const fileInput = document.getElementById('contratoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  abrirModalContrato(aluguel: AluguelResponse): void {
    window.open(this.service.getContratoUrl(aluguel.id), '_blank');
  }

  fecharModalContrato(): void {
    this.showContratoModal.set(false);
    this.selectedAluguel.set(null);
    this.pdfVisualizacao.set(null);
    this.contratoSelecionado.set(null);
    this.pdfCarregando.set(false);
  }

  carregarVisualizacaoPdf(aluguelId: number): void {
    this.pdfCarregando.set(true);
    this.service.downloadContrato(aluguelId).subscribe({
      next: (blob: Blob) => {
        if (blob && blob.size > 0) {
          // Criar URL direta sem sanitizer
          const pdfUrl = URL.createObjectURL(blob);
          this.pdfVisualizacao.set(pdfUrl);
          this.pdfCarregando.set(false);
        } else {
          this.pdfVisualizacao.set(null);
          this.pdfCarregando.set(false);
          this.notification.error('PDF vazio');
        }
      },
      error: (err) => {
        console.error('Erro:', err);
        this.pdfVisualizacao.set(null);
        this.pdfCarregando.set(false);
        this.notification.error('Erro ao carregar PDF');
      }
    });
  }

  abrirPdfNovaAba(aluguelId: number): void {
    const url = this.service.getContratoUrl(aluguelId);
    console.log('Abrindo URL:', url);
    window.open(url, '_blank');
  }

  baixarContrato(aluguelId: number): void {
    this.service.downloadContrato(aluguelId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_aluguel_${aluguelId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);

        console.log('Blob recebido - Tamanho:', blob.size, 'bytes');
        this.notification.success('Download iniciado');
      },
      error: () => {
        this.notification.error('Erro ao baixar o contrato');
      }
    });
  }

  uploadContratoParaExistente(): void {
    const contrato = this.contratoSelecionado();
    const aluguel = this.selectedAluguel();

    if (!contrato || !aluguel) return;

    this.uploadingContrato.set(true);
    this.service.atualizarContrato(aluguel.id, contrato).subscribe({
      next: () => {
        this.notification.success('Contrato atualizado com sucesso');
        this.uploadingContrato.set(false);
        this.contratoSelecionado.set(null);
        this.carregarVisualizacaoPdf(aluguel.id);
        this.carregarDados();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao enviar contrato');
        this.uploadingContrato.set(false);
      }
    });
  }
}
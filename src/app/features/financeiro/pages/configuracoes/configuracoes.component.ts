import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { DateBrPipe } from '../../../../shared/pipes/date-br.pipe';
import { FinanceiroService } from '../../../../core/services/financeiro.service';
import { AluguelService } from '../../../../core/services/aluguel.service';
import { VendaService } from '../../../../core/services/venda.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfiguracaoFinanceiraResponse, ConfiguracaoFinanceiraRequest, DashboardResponse, CarneResponse } from '../../../../core/models/financeiro.model';
import { AluguelResponse } from '../../../../core/models/aluguel.model';
import { VendaResponse } from '../../../../core/models/venda.model';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PageHeaderComponent, LoadingComponent, CurrencyBrPipe, DateBrPipe
  ],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss'] // IDE refresh
})
export class ConfiguracoesComponent implements OnInit {
  private service = inject(FinanceiroService);
  private aluguelService = inject(AluguelService);
  private vendaService = inject(VendaService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  configuracao = signal<ConfiguracaoFinanceiraResponse | null>(null);
  dashboard = signal<DashboardResponse | null>(null);
  
  // Dados para geração de carnês
  alugueis = signal<AluguelResponse[]>([]);
  vendas = signal<VendaResponse[]>([]);
  carneGerado = signal<CarneResponse | null>(null);
  
  loading = signal(false);
  formSubmitting = signal(false);
  gerandoCarne = signal(false);

  form!: FormGroup;
  
  activeTab = signal<'dashboard' | 'config' | 'carnes'>('dashboard');
  tipoCarne = signal<'venda' | 'aluguel'>('aluguel');
  selectedContratoId = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.carregarDadosIniciais();
  }

  private initForm(): void {
    this.form = this.fb.group({
      jurosMensal: [0, [Validators.required, Validators.min(0)]],
      jurosDiario: [0, [Validators.required, Validators.min(0)]],
      multaFixa: [0, [Validators.required, Validators.min(0)]],
      diasCarencia: [0, [Validators.required, Validators.min(0)]],
      igpmAtual: [0, [Validators.required]],
      igpmDataReferencia: ['', Validators.required],
      formasPagamento: ['', Validators.required],
      observacoes: ['']
    });
  }

  carregarDadosIniciais(): void {
    this.loading.set(true);
    
    // Tentar carregar configurações
    this.service.getConfiguracoes().subscribe({
      next: (config) => {
        if (config) {
          this.configuracao.set(config);
          this.form.patchValue({
            ...config,
            igpmDataReferencia: config.igpmDataReferencia ? config.igpmDataReferencia.substring(0, 10) : ''
          });
        }
      },
      error: () => console.error('Erro ao carregar configurações')
    });

    // Tentar carregar dashboard
    this.service.getDashboard().subscribe({
      next: (dash) => this.dashboard.set(dash),
      error: () => console.error('Erro ao carregar dashboard')
    });

    this.loading.set(false);
  }

  carregarContratosParaCarnes(): void {
    if (this.tipoCarne() === 'aluguel' && this.alugueis().length === 0) {
      this.aluguelService.listar().subscribe(data => this.alugueis.set(data.filter(a => a.status === 'ativo')));
    } else if (this.tipoCarne() === 'venda' && this.vendas().length === 0) {
      this.vendaService.listar().subscribe(data => this.vendas.set(data.filter(v => v.status === 'ativo')));
    }
  }

  setTab(tab: 'dashboard' | 'config' | 'carnes'): void {
    this.activeTab.set(tab);
    if (tab === 'carnes') {
      this.carregarContratosParaCarnes();
    }
  }

  setTipoCarne(tipo: 'venda' | 'aluguel'): void {
    this.tipoCarne.set(tipo);
    this.selectedContratoId.set(null);
    this.carneGerado.set(null);
    this.carregarContratosParaCarnes();
  }

  salvarConfiguracao(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: ConfiguracaoFinanceiraRequest = this.form.value;

    this.service.updateConfiguracoes(dto).subscribe({
      next: (config) => {
        this.configuracao.set(config);
        this.notification.success('Configurações financeiras atualizadas com sucesso');
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao atualizar configurações');
        this.formSubmitting.set(false);
      }
    });
  }

  gerarCarne(): void {
    const contratoId = this.selectedContratoId();
    if (!contratoId) {
      this.notification.error('Selecione um contrato para gerar o carnê');
      return;
    }

    this.gerandoCarne.set(true);
    this.carneGerado.set(null);

    const obs = this.tipoCarne() === 'venda'
      ? this.service.gerarCarneVenda(contratoId)
      : this.service.gerarCarneAluguel(contratoId);

    obs.subscribe({
      next: (carne) => {
        this.carneGerado.set(carne);
        this.notification.success('Carnê gerado com sucesso');
        this.gerandoCarne.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao gerar carnê');
        this.gerandoCarne.set(false);
      }
    });
  }

  imprimirCarne(): void {
    window.print();
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj.pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';
import { CepPipe } from '../../../../shared/pipes/cep.pipe';
import { MaskCpfCnpjDirective } from '../../../../shared/directives/mask-cpf-cnpj.directive';
import { MaskTelefoneDirective } from '../../../../shared/directives/mask-telefone.directive';
import { MaskCepDirective } from '../../../../shared/directives/mask-cep.directive';
import { ClienteService } from '../../../../core/services/cliente.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClienteResponse, ClienteRequest, TIPO_CLIENTE_OPTIONS, ESTADO_OPTIONS } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent,
    CpfCnpjPipe, TelefonePipe, CepPipe,
    MaskCpfCnpjDirective, MaskTelefoneDirective, MaskCepDirective
  ],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  private service = inject(ClienteService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  readonly tiposOpcoes = TIPO_CLIENTE_OPTIONS;
  readonly estadoOpcoes = ESTADO_OPTIONS;

  clientes = signal<ClienteResponse[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  filterTipo = signal<string>('');

  showFormModal = signal(false);
  editingItem = signal<ClienteResponse | null>(null);
  formSubmitting = signal(false);

  showConfirmDialog = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({ title: '', message: '' });
  private confirmAction: (() => void) | null = null;

  form!: FormGroup;

  filteredItems = computed(() => {
    let result = this.clientes();
    const search = this.searchTerm().toLowerCase().trim();
    const tipo = this.filterTipo();

    if (search) {
      result = result.filter(c =>
        c.nome.toLowerCase().includes(search) ||
        c.cpfCnpj.includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.cidade?.toLowerCase().includes(search) ||
        c.bairro?.toLowerCase().includes(search)
      );
    }
    if (tipo) {
      result = result.filter(c => c.tipo === tipo);
    }

    return result;
  });

  totalItems = computed(() => this.clientes().length);
  totalCompradores = computed(() => this.clientes().filter(c => c.tipo === 'comprador').length);
  totalLocatarios = computed(() => this.clientes().filter(c => c.tipo === 'locatario').length);
  totalAmbos = computed(() => this.clientes().filter(c => c.tipo === 'ambos').length);

  ngOnInit(): void {
    this.initForm();
    this.carregarDados();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      cpfCnpj: ['', [Validators.required, Validators.maxLength(20)]],
      tipo: ['comprador', Validators.required],
      telefone: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      endereco: ['', Validators.maxLength(150)],
      numero: ['', Validators.maxLength(10)],
      complemento: ['', Validators.maxLength(100)],
      bairro: ['', Validators.maxLength(100)],
      cep: ['', Validators.maxLength(20)],
      cidade: ['', Validators.maxLength(100)],
      estado: ['', Validators.maxLength(2)],
      observacoes: ['']
    });
  }

  carregarDados(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.clientes.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notification.error('Erro ao carregar clientes');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  abrirModalNovo(): void {
    this.editingItem.set(null);
    this.form.reset({ 
      tipo: 'comprador',
      estado: ''
    });
    this.showFormModal.set(true);
  }

  abrirModalEditar(item: ClienteResponse): void {
    this.editingItem.set(item);
    this.form.patchValue({
      nome: item.nome,
      cpfCnpj: item.cpfCnpj,
      tipo: item.tipo,
      telefone: item.telefone,
      email: item.email,
      endereco: item.endereco,
      numero: item.numero,
      complemento: item.complemento,
      bairro: item.bairro,
      cep: item.cep,
      cidade: item.cidade,
      estado: item.estado,
      observacoes: item.observacoes
    });
    this.showFormModal.set(true);
  }

  fecharModal(): void {
    this.showFormModal.set(false);
    this.editingItem.set(null);
    this.form.reset({ tipo: 'comprador', estado: '' });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: ClienteRequest = this.form.value;
    const editing = this.editingItem();

    const obs = editing
      ? this.service.atualizar(editing.id, dto)
      : this.service.criar(dto);

    obs.subscribe({
      next: () => {
        this.notification.success(editing ? 'Cliente atualizado com sucesso' : 'Cliente cadastrado com sucesso');
        this.fecharModal();
        this.carregarDados();
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || (editing ? 'Erro ao atualizar cliente' : 'Erro ao cadastrar cliente'));
        this.formSubmitting.set(false);
      }
    });
  }

  confirmarExclusao(item: ClienteResponse): void {
    this.confirmDialogData.set({
      title: 'Excluir Cliente',
      message: `Tem certeza que deseja excluir o cliente "${item.nome}"? Esta ação não pode ser desfeita e pode falhar se o cliente possuir contratos vinculados.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });
    this.confirmAction = () => this.excluir(item.id);
    this.showConfirmDialog.set(true);
  }

  private excluir(id: number): void {
    this.service.excluir(id).subscribe({
      next: () => {
        this.notification.success('Cliente excluído com sucesso');
        this.carregarDados();
      },
      error: (err) => {
        const msg = err.status === 409 
          ? 'Não é possível excluir o cliente pois existem registros vinculados a ele.'
          : 'Erro ao excluir cliente';
        this.notification.error(msg);
      }
    });
  }

  onConfirm(): void {
    this.showConfirmDialog.set(false);
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  }

  onCancelConfirm(): void {
    this.showConfirmDialog.set(false);
    this.confirmAction = null;
  }

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onFilterTipoChange(event: Event): void {
    this.filterTipo.set((event.target as HTMLSelectElement).value);
  }

  getTipoLabel(tipo: string): string {
    return this.tiposOpcoes.find(t => t.value === tipo)?.label || tipo;
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      comprador: 'badge-comprador',
      locatario: 'badge-locatario',
      ambos: 'badge-ambos'
    };
    return classes[tipo] || '';
  }

  getInitials(nome: string): string {
    if (!nome) return '';
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Método para formatar o endereço completo para exibição
  getEnderecoCompleto(item: ClienteResponse): string {
    const partes = [];
    if (item.endereco) partes.push(item.endereco);
    if (item.numero) partes.push(item.numero);
    if (item.complemento) partes.push(item.complemento);
    if (item.bairro) partes.push(item.bairro);
    if (item.cidade) partes.push(item.cidade);
    if (item.estado) partes.push(item.estado);
    if (item.cep) partes.push(`CEP: ${item.cep}`);
    
    return partes.join(', ') || '—';
  }
}
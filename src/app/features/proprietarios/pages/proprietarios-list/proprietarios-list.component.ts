import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj.pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';
import { MaskCpfCnpjDirective } from '../../../../shared/directives/mask-cpf-cnpj.directive';
import { MaskTelefoneDirective } from '../../../../shared/directives/mask-telefone.directive';
import { MaskCepDirective } from '../../../../shared/directives/mask-cep.directive';
import { ProprietarioService } from '../../../../core/services/proprietario.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProprietarioResponse, ProprietarioRequest } from '../../../../core/models/proprietario.model';
import { ESTADO_OPTIONS } from '../../../../core/models/estado.model';

@Component({
  selector: 'app-proprietarios-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent,
    CpfCnpjPipe, TelefonePipe,
    MaskCpfCnpjDirective, MaskTelefoneDirective, MaskCepDirective
  ],
  templateUrl: './proprietarios-list.component.html',
  styleUrls: ['./proprietarios-list.component.scss']
})
export class ProprietariosListComponent implements OnInit {
  private service = inject(ProprietarioService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  readonly estadoOpcoes = ESTADO_OPTIONS;

  proprietarios = signal<ProprietarioResponse[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  filterStatus = signal<string>('');

  showFormModal = signal(false);
  editingItem = signal<ProprietarioResponse | null>(null);
  formSubmitting = signal(false);

  showConfirmDialog = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({ title: '', message: '' });
  private confirmAction: (() => void) | null = null;

  form!: FormGroup;

  filteredItems = computed(() => {
    let result = this.proprietarios();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    if (search) {
      result = result.filter(p =>
        p.nome.toLowerCase().includes(search) ||
        p.cpfCnpj.includes(search) ||
        (p.email && p.email.toLowerCase().includes(search)) ||
        (p.cidade && p.cidade.toLowerCase().includes(search)) ||
        (p.bairro && p.bairro.toLowerCase().includes(search))
      );
    }
    if (status === 'ativo') result = result.filter(p => p.ativo);
    else if (status === 'inativo') result = result.filter(p => !p.ativo);

    return result;
  });

  totalItems = computed(() => this.proprietarios().length);
  totalAtivos = computed(() => this.proprietarios().filter(p => p.ativo).length);
  totalInativos = computed(() => this.proprietarios().filter(p => !p.ativo).length);

  ngOnInit(): void {
    this.initForm();
    this.carregarDados();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      cpfCnpj: ['', [Validators.required, Validators.maxLength(20)]],
      telefone: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      endereco: ['', Validators.maxLength(150)],
      numero: ['', Validators.maxLength(10)],
      complemento: ['', Validators.maxLength(100)],
      bairro: ['', Validators.maxLength(100)],
      cep: ['', Validators.maxLength(20)],
      cidade: ['', Validators.maxLength(100)],
      estado: ['', Validators.maxLength(2)],
      banco: ['', Validators.maxLength(50)],
      agencia: ['', Validators.maxLength(20)],
      conta: ['', Validators.maxLength(20)]
    });
  }

  carregarDados(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.proprietarios.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notification.error('Erro ao carregar proprietários');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  abrirModalNovo(): void {
    this.editingItem.set(null);
    this.form.reset({
      estado: ''
    });
    this.showFormModal.set(true);
  }

  abrirModalEditar(item: ProprietarioResponse): void {
    this.editingItem.set(item);
    this.form.patchValue({
      nome: item.nome,
      cpfCnpj: item.cpfCnpj,
      telefone: item.telefone,
      email: item.email,
      endereco: item.endereco,
      numero: item.numero,
      complemento: item.complemento,
      bairro: item.bairro,
      cep: item.cep,
      cidade: item.cidade,
      estado: item.estado,
      banco: item.banco,
      agencia: item.agencia,
      conta: item.conta
    });
    this.showFormModal.set(true);
  }

  fecharModal(): void {
    this.showFormModal.set(false);
    this.editingItem.set(null);
    this.form.reset({ estado: '' });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: ProprietarioRequest = this.form.value;
    const editing = this.editingItem();

    const obs = editing
      ? this.service.atualizar(editing.id, dto)
      : this.service.criar(dto);

    obs.subscribe({
      next: () => {
        this.notification.success(editing ? 'Proprietário atualizado com sucesso' : 'Proprietário cadastrado com sucesso');
        this.fecharModal();
        this.carregarDados();
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || (editing ? 'Erro ao atualizar proprietário' : 'Erro ao cadastrar proprietário'));
        this.formSubmitting.set(false);
      }
    });
  }

  toggleStatus(item: ProprietarioResponse): void {
    if (item.ativo) {
      this.confirmDialogData.set({
        title: 'Desativar Proprietário',
        message: `Tem certeza que deseja desativar o proprietário "${item.nome}"?`,
        confirmText: 'Desativar',
        cancelText: 'Cancelar'
      });
      this.confirmAction = () => this.desativar(item.id);
    } else {
      this.confirmDialogData.set({
        title: 'Reativar Proprietário',
        message: `Deseja reativar o proprietário "${item.nome}"?`,
        confirmText: 'Reativar',
        cancelText: 'Cancelar'
      });
      this.confirmAction = () => this.reativar(item);
    }
    this.showConfirmDialog.set(true);
  }

  private desativar(id: number): void {
    this.service.excluir(id).subscribe({
      next: () => {
        this.notification.success('Proprietário desativado com sucesso');
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao desativar proprietário')
    });
  }

  private reativar(item: ProprietarioResponse): void {
    const dto: ProprietarioRequest = {
      nome: item.nome,
      cpfCnpj: item.cpfCnpj,
      telefone: item.telefone,
      email: item.email,
      endereco: item.endereco,
      numero: item.numero,
      complemento: item.complemento,
      bairro: item.bairro,
      cep: item.cep,
      cidade: item.cidade,
      estado: item.estado,
      banco: item.banco,
      agencia: item.agencia,
      conta: item.conta
    };
    this.service.atualizar(item.id, dto).subscribe({
      next: () => {
        this.notification.success('Proprietário reativado com sucesso');
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao reativar proprietário')
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

  onFilterStatusChange(event: Event): void {
    this.filterStatus.set((event.target as HTMLSelectElement).value);
  }

  getStatusClass(ativo: boolean): string {
    return ativo ? 'badge-ativo' : 'badge-inativo';
  }

  getInitials(nome: string): string {
    if (!nome) return '';
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Método para formatar o endereço completo para exibição
  getEnderecoCompleto(item: ProprietarioResponse): string {
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
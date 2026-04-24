import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UsuarioResponse, UsuarioRequest } from '../../../../core/models/usuario.model';
import { PerfilUsuario } from '../../../../core/models/enums/perfil-usuario.enum';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // State
  usuarios = signal<UsuarioResponse[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  filterPerfil = signal<string>('');
  filterStatus = signal<string>('');

  // Modal state
  showFormModal = signal(false);
  showSenhaModal = signal(false);
  editingUsuario = signal<UsuarioResponse | null>(null);
  senhaUsuarioId = signal<number | null>(null);
  formSubmitting = signal(false);

  // Confirm dialog
  showConfirmDialog = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({ title: '', message: '' });
  private confirmAction: (() => void) | null = null;

  // Forms
  usuarioForm!: FormGroup;
  senhaForm!: FormGroup;

  // Computed
  filteredUsuarios = computed(() => {
    let result = this.usuarios();
    const search = this.searchTerm().toLowerCase().trim();
    const perfil = this.filterPerfil();
    const status = this.filterStatus();

    if (search) {
      result = result.filter(u =>
        u.nome.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    if (perfil) {
      result = result.filter(u => u.perfil === perfil);
    }
    if (status === 'ativo') {
      result = result.filter(u => u.ativo);
    } else if (status === 'inativo') {
      result = result.filter(u => !u.ativo);
    }
    return result;
  });

  totalUsuarios = computed(() => this.usuarios().length);
  totalAtivos = computed(() => this.usuarios().filter(u => u.ativo).length);
  totalAdmins = computed(() => this.usuarios().filter(u => u.perfil === PerfilUsuario.ADMIN).length);
  totalCorretores = computed(() => this.usuarios().filter(u => u.perfil === PerfilUsuario.CORRETOR).length);

  ngOnInit(): void {
    this.initForms();
    this.carregarUsuarios();
  }

  private initForms(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      perfil: [PerfilUsuario.CORRETOR, Validators.required],
      ativo: [true]
    });

    this.senhaForm = this.fb.group({
      senhaAntiga: ['', [Validators.required]],
      senhaNova: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    });
  }

  carregarUsuarios(): void {
    this.loading.set(true);
    this.usuarioService.listarPorEmpresa().subscribe({
      next: (response) => {
        if (response.success) {
          this.usuarios.set(response.data || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.notificationService.error('Erro ao carregar usuários');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  // --- Form Modal ---
  abrirModalNovo(): void {
    this.editingUsuario.set(null);
    this.usuarioForm.reset({ perfil: PerfilUsuario.CORRETOR, ativo: true });
    this.usuarioForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('senha')?.updateValueAndValidity();
    this.showFormModal.set(true);
  }

  abrirModalEditar(usuario: UsuarioResponse): void {
    this.editingUsuario.set(usuario);
    this.usuarioForm.patchValue({
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo
    });
    // Senha não é obrigatória na edição
    this.usuarioForm.get('senha')?.clearValidators();
    this.usuarioForm.get('senha')?.setValidators([Validators.minLength(6)]);
    this.usuarioForm.get('senha')?.updateValueAndValidity();
    this.usuarioForm.get('senha')?.setValue('');
    this.showFormModal.set(true);
  }

  fecharModalForm(): void {
    this.showFormModal.set(false);
    this.editingUsuario.set(null);
    this.usuarioForm.reset();
  }

  salvarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: UsuarioRequest = this.usuarioForm.value;
    const editing = this.editingUsuario();

    if (editing) {
      this.usuarioService.atualizar(editing.id, dto).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Usuário atualizado com sucesso');
            this.fecharModalForm();
            this.carregarUsuarios();
          }
          this.formSubmitting.set(false);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Erro ao atualizar usuário');
          this.formSubmitting.set(false);
        }
      });
    } else {
      this.usuarioService.criar(dto).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Usuário criado com sucesso');
            this.fecharModalForm();
            this.carregarUsuarios();
          }
          this.formSubmitting.set(false);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Erro ao criar usuário');
          this.formSubmitting.set(false);
        }
      });
    }
  }

  // --- Ativar/Desativar ---
  toggleStatus(usuario: UsuarioResponse): void {
    if (usuario.ativo) {
      this.confirmDialogData.set({
        title: 'Desativar Usuário',
        message: `Tem certeza que deseja desativar o usuário "${usuario.nome}"? Ele perderá o acesso ao sistema.`,
        confirmText: 'Desativar',
        cancelText: 'Cancelar'
      });
      this.confirmAction = () => this.desativarUsuario(usuario.id);
    } else {
      this.confirmDialogData.set({
        title: 'Ativar Usuário',
        message: `Deseja reativar o acesso do usuário "${usuario.nome}" ao sistema?`,
        confirmText: 'Ativar',
        cancelText: 'Cancelar'
      });
      this.confirmAction = () => this.ativarUsuario(usuario.id);
    }
    this.showConfirmDialog.set(true);
  }

  private desativarUsuario(id: number): void {
    this.usuarioService.desativar(id).subscribe({
      next: () => {
        this.notificationService.success('Usuário desativado com sucesso');
        this.carregarUsuarios();
      },
      error: () => this.notificationService.error('Erro ao desativar usuário')
    });
  }

  private ativarUsuario(id: number): void {
    this.usuarioService.ativar(id).subscribe({
      next: () => {
        this.notificationService.success('Usuário ativado com sucesso');
        this.carregarUsuarios();
      },
      error: () => this.notificationService.error('Erro ao ativar usuário')
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

  // --- Alterar Senha ---
  abrirModalSenha(usuario: UsuarioResponse): void {
    this.senhaUsuarioId.set(usuario.id);
    this.senhaForm.reset();
    this.showSenhaModal.set(true);
  }

  fecharModalSenha(): void {
    this.showSenhaModal.set(false);
    this.senhaUsuarioId.set(null);
    this.senhaForm.reset();
  }

  alterarSenha(): void {
    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    const { senhaAntiga, senhaNova, confirmarSenha } = this.senhaForm.value;

    if (senhaNova !== confirmarSenha) {
      this.notificationService.error('A nova senha e a confirmação não coincidem');
      return;
    }

    const id = this.senhaUsuarioId();
    if (!id) return;

    this.formSubmitting.set(true);
    this.usuarioService.alterarSenha(id, senhaAntiga, senhaNova).subscribe({
      next: () => {
        this.notificationService.success('Senha alterada com sucesso');
        this.fecharModalSenha();
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erro ao alterar senha');
        this.formSubmitting.set(false);
      }
    });
  }

  // --- Helpers ---
  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onFilterPerfilChange(event: Event): void {
    this.filterPerfil.set((event.target as HTMLSelectElement).value);
  }

  onFilterStatusChange(event: Event): void {
    this.filterStatus.set((event.target as HTMLSelectElement).value);
  }

  getPerfilLabel(perfil: PerfilUsuario): string {
    return perfil === PerfilUsuario.ADMIN ? 'Administrador' : 'Corretor';
  }

  getPerfilClass(perfil: PerfilUsuario): string {
    return perfil === PerfilUsuario.ADMIN ? 'badge-admin' : 'badge-corretor';
  }

  getStatusClass(ativo: boolean): string {
    return ativo ? 'badge-ativo' : 'badge-inativo';
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  getInitials(nome: string): string {
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}

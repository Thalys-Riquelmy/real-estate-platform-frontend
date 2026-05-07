import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyBrPipe } from '../../../../shared/pipes/currency-br.pipe';
import { ImovelService } from '../../../../core/services/imovel.service';
import { ProprietarioService } from '../../../../core/services/proprietario.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ImovelResponse, ImovelRequest, TIPO_IMOVEL_OPTIONS, STATUS_IMOVEL_OPTIONS, ESTADOS_BR, ImagemImovelResponse } from '../../../../core/models/imovel.model';
import { ProprietarioResponse } from '../../../../core/models/proprietario.model';
import { CpfCnpjPipe } from 'src/app/shared';

@Component({
  selector: 'app-imoveis-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent,
    CurrencyBrPipe, CpfCnpjPipe
  ],
  templateUrl: './imoveis-list.component.html',
  styleUrls: ['./imoveis-list.component.scss']
})
export class ImoveisListComponent implements OnInit {
  private service = inject(ImovelService);
  private proprietarioService = inject(ProprietarioService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  readonly tiposOpcoes = TIPO_IMOVEL_OPTIONS;
  readonly statusOpcoes = STATUS_IMOVEL_OPTIONS;
  readonly estados = ESTADOS_BR;

  imoveis = signal<ImovelResponse[]>([]);
  proprietarios = signal<ProprietarioResponse[]>([]);
  loading = signal(false);

  // Filtros
  searchTerm = signal('');
  filterStatus = signal<string>('');
  filterTipo = signal<string>('');

  showFormModal = signal(false);
  editingItem = signal<ImovelResponse | null>(null);
  formSubmitting = signal(false);

  imagensSelecionadas = signal<File[]>([]);
  imagensPreview = signal<string[]>([]);
  imagensExistentes = signal<ImagemImovelResponse[]>([]);
  showImagensModal = signal(false);
  uploadingImagens = signal(false);

  showConfirmDialog = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({ title: '', message: '' });
  private confirmAction: (() => void) | null = null;

  form!: FormGroup;

  filteredItems = computed(() => {
    let result = this.imoveis();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const tipo = this.filterTipo();

    if (search) {
      result = result.filter(i =>
        i.endereco.toLowerCase().includes(search) ||
        (i.bairro && i.bairro.toLowerCase().includes(search)) ||
        (i.cidade && i.cidade.toLowerCase().includes(search))
      );
    }
    if (status) result = result.filter(i => i.status === status);
    if (tipo) result = result.filter(i => i.tipo === tipo);

    return result;
  });

  totalItems = computed(() => this.imoveis().length);
  totalDisponiveis = computed(() => this.imoveis().filter(i => i.status === 'disponivel').length);
  totalAlugados = computed(() => this.imoveis().filter(i => i.status === 'alugado').length);
  totalVendidos = computed(() => this.imoveis().filter(i => i.status === 'vendido').length);

  ngOnInit(): void {
    this.initForm();
    this.carregarDados();
    this.carregarProprietarios();
  }

  private initForm(): void {
    this.form = this.fb.group({
      proprietarioId: [null, Validators.required],
      tipo: ['casa', Validators.required],
      status: ['disponivel', Validators.required],
      destaque: [false],
      endereco: ['', [Validators.required, Validators.maxLength(150)]],
      numero: ['', Validators.maxLength(20)],
      complemento: ['', Validators.maxLength(100)],
      bairro: ['', Validators.maxLength(100)],
      cidade: ['', Validators.maxLength(100)],
      estado: ['SP', Validators.maxLength(2)],
      cep: ['', Validators.maxLength(9)],
      areaTerreno: [0, Validators.min(0)],
      areaConstruida: [0, Validators.min(0)],
      quartos: [0, Validators.min(0)],
      banheiros: [0, Validators.min(0)],
      vagas: [0, Validators.min(0)],
      andar: [0, Validators.min(0)],
      valorVenda: [0, Validators.min(0)],
      valorAluguel: [0, Validators.min(0)],
      observacoes: ['']
    });
  }

  carregarDados(): void {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.imoveis.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.notification.error('Erro ao carregar imóveis');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  carregarProprietarios(): void {
    this.proprietarioService.listar().subscribe({
      next: (data) => this.proprietarios.set(data.filter(p => p.ativo) || [])
    });
  }

  abrirModalNovo(): void {
    this.editingItem.set(null);
    this.form.reset({
      tipo: 'casa',
      status: 'disponivel',
      destaque: false,
      estado: 'SP',
      areaTerreno: 0,
      areaConstruida: 0,
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      andar: 0,
      valorVenda: 0,
      valorAluguel: 0
    });
    this.showFormModal.set(true);
  }

  abrirModalEditar(item: ImovelResponse): void {
    this.editingItem.set(item);
    this.form.patchValue({
      proprietarioId: item.proprietario?.id,
      tipo: item.tipo,
      status: item.status,
      destaque: item.destaque,
      endereco: item.endereco,
      numero: item.numero,
      complemento: item.complemento,
      bairro: item.bairro,
      cidade: item.cidade,
      estado: item.estado,
      cep: item.cep,
      areaTerreno: item.areaTerreno,
      areaConstruida: item.areaConstruida,
      quartos: item.quartos,
      banheiros: item.banheiros,
      vagas: item.vagas,
      andar: item.andar,
      valorVenda: item.valorVenda,
      valorAluguel: item.valorAluguel,
      observacoes: item.observacoes
    });
    this.showFormModal.set(true);
  }

  fecharModal(): void {
    this.showFormModal.set(false);
    this.editingItem.set(null);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: ImovelRequest = this.form.value;
    const editing = this.editingItem();
    const imagens = this.imagensSelecionadas();

    let obs;

    if (editing) {
      if (imagens.length > 0) {
        obs = this.service.atualizarComImagens(editing.id, dto, imagens);
      } else {
        obs = this.service.atualizar(editing.id, dto);
      }
    } else {
      if (imagens.length > 0) {
        obs = this.service.criarComImagens(dto, imagens);
      } else {
        obs = this.service.criar(dto);
      }
    }

    obs.subscribe({
      next: () => {
        this.notification.success(editing ? 'Imóvel atualizado com sucesso' : 'Imóvel cadastrado com sucesso');
        this.fecharModal();
        this.carregarDados();
        this.formSubmitting.set(false);
        this.imagensSelecionadas.set([]);
        this.imagensPreview.set([]);
      },
      error: (err) => {
        this.notification.error(err.error?.message || (editing ? 'Erro ao atualizar imóvel' : 'Erro ao cadastrar imóvel'));
        this.formSubmitting.set(false);
      }
    });
  }

  confirmarExclusao(item: ImovelResponse): void {
    this.confirmDialogData.set({
      title: 'Excluir Imóvel',
      message: `Tem certeza que deseja excluir o imóvel "${item.endereco}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });
    this.confirmAction = () => this.excluir(item.id);
    this.showConfirmDialog.set(true);
  }

  private excluir(id: number): void {
    this.service.excluir(id).subscribe({
      next: () => {
        this.notification.success('Imóvel excluído com sucesso');
        this.carregarDados();
      },
      error: (err) => {
        const msg = err.status === 409
          ? 'Não é possível excluir o imóvel pois existem contratos vinculados.'
          : 'Erro ao excluir imóvel';
        this.notification.error(msg);
      }
    });
  }

  mudarStatusRapido(imovel: ImovelResponse, novoStatus: string): void {
    this.service.atualizarStatus(imovel.id, novoStatus).subscribe({
      next: () => {
        this.notification.success('Status alterado com sucesso');
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao alterar status')
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

  onFilterTipoChange(event: Event): void {
    this.filterTipo.set((event.target as HTMLSelectElement).value);
  }

  getStatusLabel(status: string): string {
    return this.statusOpcoes.find(s => s.value === status)?.label || status;
  }

  getTipoLabel(tipo: string): string {
    return this.tiposOpcoes.find(t => t.value === tipo)?.label || tipo;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      disponivel: 'badge-success',
      vendido: 'badge-danger',
      alugado: 'badge-primary',
      reservado: 'badge-warn',
      manutencao: 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  onImagensSelecionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.imagensSelecionadas.set(files);

      const previews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target?.result as string);
          if (previews.length === files.length) {
            this.imagensPreview.set(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  abrirModalImagens(imovel: ImovelResponse): void {
    this.editingItem.set(imovel);
    this.carregarImagensExistentes(imovel.id);
    this.showImagensModal.set(true);
  }

  carregarImagensExistentes(imovelId: number): void {
    this.service.listarImagens(imovelId).subscribe({
      next: (imagens) => this.imagensExistentes.set(imagens),
      error: () => this.notification.error('Erro ao carregar imagens')
    });
  }

  uploadImagens(): void {
    if (this.imagensSelecionadas().length === 0) {
      this.notification.warning('Selecione pelo menos uma imagem');
      return;
    }

    this.uploadingImagens.set(true);
    const imovelId = this.editingItem()!.id;

    this.service.uploadImagens(imovelId, this.imagensSelecionadas()).subscribe({
      next: (imagens) => {
        this.notification.success(`${imagens.length} imagem(ns) enviada(s) com sucesso`);
        this.imagensSelecionadas.set([]);
        this.imagensPreview.set([]);
        this.carregarImagensExistentes(imovelId);
        this.carregarDados();
        this.uploadingImagens.set(false);
      },
      error: (err) => {
        this.notification.error('Erro ao enviar imagens');
        this.uploadingImagens.set(false);
      }
    });
  }

  removerImagem(imagemId: number): void {
    const imovelId = this.editingItem()!.id;
    this.service.removerImagem(imovelId, imagemId).subscribe({
      next: () => {
        this.notification.success('Imagem removida com sucesso');
        this.carregarImagensExistentes(imovelId);
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao remover imagem')
    });
  }

  definirComoPrincipal(imagemId: number): void {
    const imovelId = this.editingItem()!.id;
    this.service.definirImagemPrincipal(imovelId, imagemId).subscribe({
      next: () => {
        this.notification.success('Imagem principal definida');
        this.carregarImagensExistentes(imovelId);
        this.carregarDados();
      },
      error: () => this.notification.error('Erro ao definir imagem principal')
    });
  }

  getImagemPrincipal(): ImagemImovelResponse | undefined {
    return this.imagensExistentes().find(img => img.principal);
  }

  salvarComImagens(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmitting.set(true);
    const dto: ImovelRequest = this.form.value;
    const imagens = this.imagensSelecionadas();

    this.service.criarComImagens(dto, imagens).subscribe({
      next: () => {
        this.notification.success('Imóvel cadastrado com sucesso');
        this.fecharModal();
        this.carregarDados();
        this.formSubmitting.set(false);
        this.imagensSelecionadas.set([]);
        this.imagensPreview.set([]);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao cadastrar imóvel');
        this.formSubmitting.set(false);
      }
    });
  }

  fecharModalImagens(): void {
    this.showImagensModal.set(false);
    this.imagensSelecionadas.set([]);
    this.imagensPreview.set([]);
  }

  removerPreview(index: number): void {
    const novasPreviews = this.imagensPreview().filter((_, i) => i !== index);
    const novosArquivos = this.imagensSelecionadas().filter((_, i) => i !== index);
    this.imagensPreview.set(novasPreviews);
    this.imagensSelecionadas.set(novosArquivos);
  }
}

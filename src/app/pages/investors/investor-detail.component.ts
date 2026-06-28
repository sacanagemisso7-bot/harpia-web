import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Document, DocumentCategory } from '../../core/models/document.model';
import { Investment, InvestmentType } from '../../core/models/investment.model';
import { Interaction, InteractionType } from '../../core/models/interaction.model';
import { Investor, InvestorStatus } from '../../core/models/investor.model';
import { DocumentService } from '../../core/services/document.service';
import { InteractionService } from '../../core/services/interaction.service';
import { InvestmentService } from '../../core/services/investment.service';
import { InvestorService } from '../../core/services/investor.service';
import { extractError, isEmailValid } from '../../shared/utils/http-error';

@Component({
  selector: 'app-investor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <a
      routerLink="/investors"
      class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
    >
      ← Voltar
    </a>

    @if (loading()) {
      <p class="text-sm text-muted">Carregando...</p>
    } @else if (error()) {
      <div class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error() }}</div>
    } @else {
      @if (investor(); as inv) {
      <!-- Cabeçalho -->
      <div class="mb-8">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-ink">{{ inv.name }}</h1>
          <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="statusClass(inv.status)">
            {{ inv.status }}
          </span>
          <button
            type="button"
            (click)="openEdit(inv)"
            class="ml-auto rounded border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
          >
            Editar
          </button>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <span>📧 {{ inv.email || '—' }}</span>
          <span>📞 {{ inv.phone || '—' }}</span>
          <span>📅 Entrada: {{ formatDate(inv.entryDate) }}</span>
        </div>
        @if (inv.notes) {
          <p class="mt-3 max-w-2xl rounded border border-border bg-surface p-3 text-sm text-ink">
            {{ inv.notes }}
          </p>
        }
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Coluna esquerda: Aportes -->
        <section>
          <div class="mb-3 flex items-baseline justify-between">
            <h2 class="text-lg font-semibold text-ink">
              Aportes <span class="text-sm font-normal text-muted">({{ investments().length }})</span>
            </h2>
            <span class="text-sm font-semibold text-primary">{{ formatBRL(totalInvested()) }}</span>
          </div>

          @if (investments().length === 0) {
            <div class="rounded-lg border border-border bg-white p-5 text-sm text-muted">
              Nenhum aporte registrado
            </div>
          } @else {
            <div class="space-y-3">
              @for (ap of investments(); track ap.id) {
                <div class="rounded-lg border border-border bg-white p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-primary">{{ formatBRL(ap.amount) }}</span>
                    <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="typeClass(ap.type)">
                      {{ ap.type }}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-muted">{{ formatDate(ap.date) }}</p>
                  @if (ap.notes) {
                    <p class="mt-2 text-sm text-ink">{{ ap.notes }}</p>
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- Coluna direita: Interações -->
        <section>
          <h2 class="mb-3 text-lg font-semibold text-ink">
            Histórico de Interações
            <span class="text-sm font-normal text-muted">({{ interactions().length }})</span>
          </h2>

          @if (interactions().length === 0) {
            <div class="rounded-lg border border-border bg-white p-5 text-sm text-muted">
              Nenhuma interação registrada
            </div>
          } @else {
            <ol class="relative space-y-4 border-l border-border pl-5">
              @for (it of interactions(); track it.id) {
                <li class="relative">
                  <span class="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary"></span>
                  <div class="rounded-lg border border-border bg-white p-4">
                    <div class="flex items-center justify-between">
                      <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="badgeClass(it.type)">
                        {{ it.type }}
                      </span>
                      <span class="text-xs text-muted">{{ formatDate(it.date) }}</span>
                    </div>
                    <p class="mt-2 text-sm text-ink">{{ it.summary }}</p>
                    @if (it.nextStep) {
                      <p class="mt-2 rounded bg-surface px-3 py-2 text-sm text-ink">
                        <span class="font-medium text-primary">Próximo passo:</span> {{ it.nextStep }}
                      </p>
                    }
                  </div>
                </li>
              }
            </ol>
          }
        </section>
      </div>

      <!-- Documentos -->
      <section class="mt-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-ink">
            Documentos <span class="text-sm font-normal text-muted">({{ documents().length }})</span>
          </h2>
          <button
            type="button"
            (click)="openUpload()"
            class="rounded bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            + Enviar Documento
          </button>
        </div>

        @if (documents().length === 0) {
          <div class="rounded-lg border border-border bg-white p-5 text-sm text-muted">
            Nenhum documento anexado
          </div>
        } @else {
          <div class="divide-y divide-border rounded-lg border border-border bg-white">
            @for (doc of documents(); track doc.id) {
              <div class="flex items-center justify-between gap-4 p-4">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="text-xl">📄</span>
                  <div class="min-w-0">
                    <p class="truncate font-medium text-ink">{{ doc.name }}</p>
                    <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="categoryClass(doc.category)">
                      {{ categoryLabel(doc.category) }}
                    </span>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <a
                    [href]="getFileUrl(doc)"
                    target="_blank"
                    rel="noopener"
                    class="text-sm font-medium text-primary hover:underline"
                  >
                    Baixar
                  </a>
                  <button
                    type="button"
                    (click)="removeDocument(doc)"
                    class="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </section>
      }
    }

    <!-- Modal: Enviar Documento -->
    @if (uploadOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeUpload()">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Enviar Documento</h2>

          <form (ngSubmit)="upload()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Nome *</label>
              <input
                type="text"
                name="docName"
                [(ngModel)]="docName"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Categoria</label>
              <select
                name="docCategory"
                [(ngModel)]="docCategory"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              >
                @for (opt of categoryOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Arquivo *</label>
              <input
                type="file"
                (change)="onFileSelected($event)"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary file:mr-3 file:rounded file:border-0 file:bg-surface file:px-3 file:py-1 file:text-sm file:text-ink"
              />
            </div>

            @if (uploadError()) {
              <p class="text-sm text-red-600">{{ uploadError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeUpload()"
                class="rounded border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!docName.trim() || !selectedFile || uploading()"
                class="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ uploading() ? 'Enviando...' : 'Enviar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal: Editar Investidor -->
    @if (editOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeEdit()">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Editar Investidor</h2>

          <form (ngSubmit)="saveEdit()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Nome *</label>
              <input
                type="text"
                name="editName"
                [(ngModel)]="editForm.name"
                required
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  name="editEmail"
                  [(ngModel)]="editForm.email"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
                @if (editEmailInvalid()) {
                  <p class="mt-1 text-xs text-red-600">Email inválido</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Telefone</label>
                <input
                  type="text"
                  name="editPhone"
                  [(ngModel)]="editForm.phone"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Status</label>
                <select
                  name="editStatus"
                  [(ngModel)]="editForm.status"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="PROSPECTO">Prospecto</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Data de Entrada</label>
                <input
                  type="date"
                  name="editEntryDate"
                  [(ngModel)]="editForm.entryDate"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Observações</label>
              <textarea
                name="editNotes"
                [(ngModel)]="editForm.notes"
                rows="3"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              ></textarea>
            </div>

            @if (saveEditError()) {
              <p class="text-sm text-red-600">{{ saveEditError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeEdit()"
                class="rounded border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!editForm.name.trim() || editEmailInvalid() || savingEdit()"
                class="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ savingEdit() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class InvestorDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly investorService = inject(InvestorService);
  private readonly investmentService = inject(InvestmentService);
  private readonly interactionService = inject(InteractionService);
  private readonly documentService = inject(DocumentService);

  private investorId = '';

  readonly investor = signal<Investor | null>(null);
  readonly investments = signal<Investment[]>([]);
  readonly interactions = signal<Interaction[]>([]);
  readonly documents = signal<Document[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly uploadOpen = signal(false);
  readonly uploading = signal(false);
  readonly uploadError = signal('');
  docName = '';
  docCategory: DocumentCategory = 'OUTRO';
  selectedFile: File | null = null;

  readonly editOpen = signal(false);
  readonly savingEdit = signal(false);
  readonly saveEditError = signal('');
  editForm: {
    name: string;
    email: string;
    phone: string;
    status: InvestorStatus;
    entryDate: string;
    notes: string;
  } = { name: '', email: '', phone: '', status: 'PROSPECTO', entryDate: '', notes: '' };

  readonly categoryOptions: { value: DocumentCategory; label: string }[] = [
    { value: 'CONTRATO', label: 'Contrato' },
    { value: 'COMPROVANTE', label: 'Comprovante' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  private readonly categoryLabels: Record<DocumentCategory, string> = {
    CONTRATO: 'Contrato',
    COMPROVANTE: 'Comprovante',
    OUTRO: 'Outro',
  };

  private readonly categoryClasses: Record<DocumentCategory, string> = {
    CONTRATO: 'bg-blue-100 text-blue-700',
    COMPROVANTE: 'bg-primary/10 text-primary',
    OUTRO: 'bg-gray-100 text-gray-700',
  };

  readonly totalInvested = computed(() =>
    this.investments().reduce((sum, i) => sum + i.amount, 0),
  );

  private readonly currencyFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly dateFmt = new Intl.DateTimeFormat('pt-BR');

  private readonly statusClasses: Record<InvestorStatus, string> = {
    ATIVO: 'bg-primary/10 text-primary',
    PROSPECTO: 'bg-yellow-100 text-yellow-700',
    INATIVO: 'bg-gray-100 text-gray-700',
  };

  private readonly typeClasses: Record<InvestmentType, string> = {
    FINANCEIRO: 'bg-primary/10 text-primary',
    PERMUTA: 'bg-blue-100 text-blue-700',
    OUTRO: 'bg-gray-100 text-gray-700',
  };

  private readonly badgeClasses: Record<InteractionType, string> = {
    REUNIAO: 'bg-blue-100 text-blue-700',
    LIGACAO: 'bg-green-100 text-green-700',
    WHATSAPP: 'bg-emerald-100 text-emerald-700',
    EMAIL: 'bg-purple-100 text-purple-700',
    OUTRO: 'bg-gray-100 text-gray-700',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Investidor não encontrado.');
      this.loading.set(false);
      return;
    }
    this.investorId = id;

    forkJoin({
      investor: this.investorService.getById(id),
      investments: this.investmentService.list(id),
      interactions: this.interactionService.list(id),
      documents: this.documentService.list(id),
    }).subscribe({
      next: ({ investor, investments, interactions, documents }) => {
        this.investor.set(investor);
        this.investments.set(investments);
        this.interactions.set(
          [...interactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
        );
        this.documents.set(documents);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os dados do investidor.');
        this.loading.set(false);
      },
    });
  }

  openEdit(inv: Investor): void {
    this.editForm = {
      name: inv.name,
      email: inv.email ?? '',
      phone: inv.phone ?? '',
      status: inv.status,
      entryDate: inv.entryDate ? inv.entryDate.slice(0, 10) : '',
      notes: inv.notes ?? '',
    };
    this.saveEditError.set('');
    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.editOpen.set(false);
  }

  editEmailInvalid(): boolean {
    const email = this.editForm.email.trim();
    return email.length > 0 && !isEmailValid(email);
  }

  saveEdit(): void {
    if (!this.editForm.name.trim() || this.editEmailInvalid() || this.savingEdit()) {
      return;
    }
    this.savingEdit.set(true);
    this.saveEditError.set('');

    const payload: Partial<Investor> = {
      name: this.editForm.name.trim(),
      email: this.editForm.email.trim() || undefined,
      phone: this.editForm.phone.trim() || undefined,
      status: this.editForm.status,
      entryDate: this.editForm.entryDate
        ? new Date(this.editForm.entryDate).toISOString()
        : undefined,
      notes: this.editForm.notes.trim() || undefined,
    };

    this.investorService.update(this.investorId, payload).subscribe({
      next: (updated) => {
        this.savingEdit.set(false);
        this.investor.set(updated);
        this.closeEdit();
      },
      error: (err) => {
        this.savingEdit.set(false);
        this.saveEditError.set(extractError(err));
      },
    });
  }

  openUpload(): void {
    this.docName = '';
    this.docCategory = 'OUTRO';
    this.selectedFile = null;
    this.uploadError.set('');
    this.uploadOpen.set(true);
  }

  closeUpload(): void {
    this.uploadOpen.set(false);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const maxBytes = 25 * 1024 * 1024;
    if (file && file.size > maxBytes) {
      this.selectedFile = null;
      this.uploadError.set('Arquivo muito grande. Máximo 25MB.');
      return;
    }
    this.uploadError.set('');
    this.selectedFile = file;
  }

  upload(): void {
    if (!this.docName.trim() || !this.selectedFile || this.uploading()) {
      return;
    }
    this.uploading.set(true);
    this.uploadError.set('');

    const formData = new FormData();
    formData.append('name', this.docName.trim());
    formData.append('category', this.docCategory);
    formData.append('investorId', this.investorId);
    formData.append('file', this.selectedFile);

    this.documentService.upload(formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.closeUpload();
        this.reloadDocuments();
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(extractError(err, 'Não foi possível enviar o documento. Tente novamente.'));
      },
    });
  }

  removeDocument(doc: Document): void {
    this.documentService.remove(doc.id).subscribe({
      next: () => this.reloadDocuments(),
    });
  }

  private reloadDocuments(): void {
    this.documentService.list(this.investorId).subscribe({
      next: (docs) => this.documents.set(docs),
    });
  }

  getFileUrl(doc: Document): string {
    return `${environment.apiUrl}/${doc.fileUrl}`;
  }

  categoryLabel(category: DocumentCategory): string {
    return this.categoryLabels[category] ?? category;
  }

  categoryClass(category: DocumentCategory): string {
    return this.categoryClasses[category] ?? this.categoryClasses.OUTRO;
  }

  formatBRL(value: number): string {
    return this.currencyFmt.format(value ?? 0);
  }

  formatDate(value?: string | null): string {
    return value ? this.dateFmt.format(new Date(value)) : '—';
  }

  statusClass(status: InvestorStatus): string {
    return this.statusClasses[status] ?? this.statusClasses.INATIVO;
  }

  typeClass(type: InvestmentType): string {
    return this.typeClasses[type] ?? this.typeClasses.OUTRO;
  }

  badgeClass(type: InteractionType): string {
    return this.badgeClasses[type] ?? this.badgeClasses.OUTRO;
  }
}

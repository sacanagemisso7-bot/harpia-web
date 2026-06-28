import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Interaction, InteractionType } from '../../core/models/interaction.model';
import { Investor } from '../../core/models/investor.model';
import { InteractionService } from '../../core/services/interaction.service';
import { InvestorService } from '../../core/services/investor.service';
import { extractError } from '../../shared/utils/http-error';

interface InteractionForm {
  investorId: string;
  type: InteractionType;
  date: string;
  summary: string;
  nextStep: string;
}

@Component({
  selector: 'app-interactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Interações</h1>
      <button
        type="button"
        (click)="openModal()"
        class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        + Nova Interação
      </button>
    </div>

    <!-- Filtro -->
    <div class="mb-4">
      <select
        [(ngModel)]="investorFilter"
        (ngModelChange)="reload()"
        class="rounded border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">Todos os investidores</option>
        @for (inv of investors(); track inv.id) {
          <option [value]="inv.id">{{ inv.name }}</option>
        }
      </select>
    </div>

    <!-- Tabela -->
    <div class="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      @if (loading()) {
        <p class="p-5 text-sm text-muted">Carregando...</p>
      } @else if (error()) {
        <p class="p-5 text-sm text-red-600">{{ error() }}</p>
      } @else if (interactions().length === 0) {
        <p class="p-5 text-sm text-muted">Nenhuma interação encontrada</p>
      } @else {
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Investidor</th>
              <th class="px-4 py-3 font-medium">Tipo</th>
              <th class="px-4 py-3 font-medium">Data</th>
              <th class="px-4 py-3 font-medium">Resumo</th>
              <th class="px-4 py-3 font-medium">Próximo Passo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (it of interactions(); track it.id) {
              <tr class="transition-colors hover:bg-surface">
                <td class="px-4 py-3 font-medium text-ink">{{ investorName(it) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="badgeClass(it.type)">
                    {{ typeLabel(it.type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-muted">{{ formatDate(it.date) }}</td>
                <td class="max-w-xs truncate px-4 py-3 text-ink">{{ it.summary }}</td>
                <td class="max-w-xs truncate px-4 py-3 text-muted">{{ it.nextStep || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- Modal -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Nova Interação</h2>

          <form (ngSubmit)="save()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Investidor *</label>
                <select
                  name="investorId"
                  [(ngModel)]="form.investorId"
                  required
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Selecione...</option>
                  @for (inv of investors(); track inv.id) {
                    <option [value]="inv.id">{{ inv.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Tipo</label>
                <select
                  name="type"
                  [(ngModel)]="form.type"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  @for (opt of typeOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Data *</label>
              <input
                type="date"
                name="date"
                [(ngModel)]="form.date"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Resumo *</label>
              <textarea
                name="summary"
                [(ngModel)]="form.summary"
                rows="3"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              ></textarea>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Próximo Passo</label>
              <input
                type="text"
                name="nextStep"
                [(ngModel)]="form.nextStep"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            @if (saveError()) {
              <p class="text-sm text-red-600">{{ saveError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeModal()"
                class="rounded border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!isValid() || saving()"
                class="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class InteractionsComponent implements OnInit {
  private readonly interactionService = inject(InteractionService);
  private readonly investorService = inject(InvestorService);

  readonly interactions = signal<Interaction[]>([]);
  readonly investors = signal<Investor[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  investorFilter = '';

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  form: InteractionForm = this.emptyForm();

  private readonly investorMap = computed(
    () => new Map(this.investors().map((i) => [i.id, i.name])),
  );

  private readonly dateFmt = new Intl.DateTimeFormat('pt-BR');

  readonly typeOptions: { value: InteractionType; label: string }[] = [
    { value: 'REUNIAO', label: 'Reunião' },
    { value: 'LIGACAO', label: 'Ligação' },
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  private readonly typeLabels: Record<InteractionType, string> = {
    REUNIAO: 'Reunião',
    LIGACAO: 'Ligação',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'Email',
    OUTRO: 'Outro',
  };

  private readonly badgeClasses: Record<InteractionType, string> = {
    REUNIAO: 'bg-blue-100 text-blue-700',
    LIGACAO: 'bg-green-100 text-green-700',
    WHATSAPP: 'bg-emerald-100 text-emerald-700',
    EMAIL: 'bg-purple-100 text-purple-700',
    OUTRO: 'bg-gray-100 text-gray-700',
  };

  ngOnInit(): void {
    forkJoin({
      interactions: this.interactionService.list(this.investorFilter),
      investors: this.investorService.list(),
    }).subscribe({
      next: ({ interactions, investors }) => {
        this.interactions.set(this.sortByDateDesc(interactions));
        this.investors.set(investors);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as interações.');
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.interactionService.list(this.investorFilter).subscribe({
      next: (list) => {
        this.interactions.set(this.sortByDateDesc(list));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as interações.');
        this.loading.set(false);
      },
    });
  }

  openModal(): void {
    this.form = this.emptyForm();
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  isValid(): boolean {
    return !!this.form.investorId && !!this.form.date && !!this.form.summary.trim();
  }

  save(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const payload: Partial<Interaction> = {
      date: new Date(this.form.date).toISOString(),
      type: this.form.type,
      summary: this.form.summary.trim(),
      investorId: this.form.investorId,
    };
    if (this.form.nextStep.trim()) payload.nextStep = this.form.nextStep.trim();

    this.interactionService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(extractError(err));
      },
    });
  }

  investorName(it: Interaction): string {
    return it.investor?.name ?? this.investorMap().get(it.investorId) ?? '—';
  }

  formatDate(value?: string | null): string {
    return value ? this.dateFmt.format(new Date(value)) : '—';
  }

  typeLabel(type: InteractionType): string {
    return this.typeLabels[type] ?? type;
  }

  badgeClass(type: InteractionType): string {
    return this.badgeClasses[type] ?? this.badgeClasses.OUTRO;
  }

  private sortByDateDesc(list: Interaction[]): Interaction[] {
    return [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }

  private emptyForm(): InteractionForm {
    return { investorId: '', type: 'REUNIAO', date: new Date().toISOString().slice(0, 10), summary: '', nextStep: '' };
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Investment, InvestmentType } from '../../core/models/investment.model';
import { Investor } from '../../core/models/investor.model';
import { Project } from '../../core/models/project.model';
import { InvestmentService } from '../../core/services/investment.service';
import { InvestorService } from '../../core/services/investor.service';
import { ProjectService } from '../../core/services/project.service';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask.directive';
import { extractError } from '../../shared/utils/http-error';

interface InvestmentForm {
  investorId: string;
  projectId: string;
  amount: number | null;
  date: string;
  type: InvestmentType;
  notes: string;
}

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Aportes</h1>
      <button
        type="button"
        (click)="openModal()"
        class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        + Novo Aporte
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-col gap-3 sm:flex-row">
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

      <select
        [(ngModel)]="projectFilter"
        (ngModelChange)="reload()"
        class="rounded border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">Todos os projetos</option>
        @for (proj of projects(); track proj.id) {
          <option [value]="proj.id">{{ proj.name }}</option>
        }
      </select>
    </div>

    <!-- Tabela -->
    <div class="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      @if (loading()) {
        <p class="p-5 text-sm text-muted">Carregando...</p>
      } @else if (error()) {
        <p class="p-5 text-sm text-red-600">{{ error() }}</p>
      } @else if (investments().length === 0) {
        <p class="p-5 text-sm text-muted">Nenhum aporte encontrado</p>
      } @else {
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Investidor</th>
              <th class="px-4 py-3 font-medium">Projeto</th>
              <th class="px-4 py-3 font-medium">Valor</th>
              <th class="px-4 py-3 font-medium">Tipo</th>
              <th class="px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (ap of investments(); track ap.id) {
              <tr class="transition-colors hover:bg-surface">
                <td class="px-4 py-3 font-medium text-ink">{{ investorName(ap.investorId) }}</td>
                <td class="px-4 py-3 text-muted">{{ projectName(ap.projectId) }}</td>
                <td class="px-4 py-3 font-bold text-primary">{{ formatBRL(ap.amount) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="typeClass(ap.type)">
                    {{ typeLabel(ap.type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-muted">{{ formatDate(ap.date) }}</td>
              </tr>
            }
          </tbody>
          <tfoot class="border-t border-border bg-surface text-sm">
            <tr>
              <td class="px-4 py-3 font-medium text-ink" colspan="2">Total</td>
              <td class="px-4 py-3 font-bold text-primary">{{ formatBRL(total()) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      }
    </div>

    <!-- Modal -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Novo Aporte</h2>

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
                <label class="mb-1 block text-sm font-medium text-ink">Projeto *</label>
                <select
                  name="projectId"
                  [(ngModel)]="form.projectId"
                  required
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Selecione...</option>
                  @for (proj of projects(); track proj.id) {
                    <option [value]="proj.id">{{ proj.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Valor (R$) *</label>
                <input
                  type="text"
                  name="amount"
                  appCurrencyMask
                  [(ngModel)]="form.amount"
                  inputmode="numeric"
                  placeholder="R$ 0,00"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
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

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Observações</label>
              <textarea
                name="notes"
                [(ngModel)]="form.notes"
                rows="3"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              ></textarea>
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
export class InvestmentsComponent implements OnInit {
  private readonly investmentService = inject(InvestmentService);
  private readonly investorService = inject(InvestorService);
  private readonly projectService = inject(ProjectService);

  readonly investments = signal<Investment[]>([]);
  readonly investors = signal<Investor[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  investorFilter = '';
  projectFilter = '';

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  form: InvestmentForm = this.emptyForm();

  readonly total = computed(() => this.investments().reduce((sum, a) => sum + a.amount, 0));

  private readonly investorMap = computed(
    () => new Map(this.investors().map((i) => [i.id, i.name])),
  );
  private readonly projectMap = computed(
    () => new Map(this.projects().map((p) => [p.id, p.name])),
  );

  private readonly currencyFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly dateFmt = new Intl.DateTimeFormat('pt-BR');

  readonly typeOptions: { value: InvestmentType; label: string }[] = [
    { value: 'FINANCEIRO', label: 'Financeiro' },
    { value: 'PERMUTA', label: 'Permuta' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  private readonly typeLabels: Record<InvestmentType, string> = {
    FINANCEIRO: 'Financeiro',
    PERMUTA: 'Permuta',
    OUTRO: 'Outro',
  };

  private readonly typeClasses: Record<InvestmentType, string> = {
    FINANCEIRO: 'bg-primary/10 text-primary',
    PERMUTA: 'bg-blue-100 text-blue-700',
    OUTRO: 'bg-gray-100 text-gray-700',
  };

  ngOnInit(): void {
    // investidores e projetos são carregados uma vez (para dropdowns e nomes);
    // os aportes respeitam os filtros atuais.
    forkJoin({
      investments: this.investmentService.list(this.investorFilter, this.projectFilter),
      investors: this.investorService.list(),
      projects: this.projectService.list(),
    }).subscribe({
      next: ({ investments, investors, projects }) => {
        this.investments.set(investments);
        this.investors.set(investors);
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os aportes.');
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.investmentService.list(this.investorFilter, this.projectFilter).subscribe({
      next: (list) => {
        this.investments.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os aportes.');
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
    return (
      !!this.form.investorId &&
      !!this.form.projectId &&
      this.form.amount != null &&
      this.form.amount > 0 &&
      !!this.form.date
    );
  }

  save(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const payload: Partial<Investment> = {
      amount: this.form.amount as number,
      date: new Date(this.form.date).toISOString(),
      type: this.form.type,
      investorId: this.form.investorId,
      projectId: this.form.projectId,
    };
    if (this.form.notes.trim()) payload.notes = this.form.notes.trim();

    this.investmentService.create(payload).subscribe({
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

  investorName(id: string): string {
    return this.investorMap().get(id) ?? '—';
  }

  projectName(id: string): string {
    return this.projectMap().get(id) ?? '—';
  }

  formatBRL(value: number): string {
    return this.currencyFmt.format(value ?? 0);
  }

  formatDate(value?: string | null): string {
    return value ? this.dateFmt.format(new Date(value)) : '—';
  }

  typeLabel(type: InvestmentType): string {
    return this.typeLabels[type] ?? type;
  }

  typeClass(type: InvestmentType): string {
    return this.typeClasses[type] ?? this.typeClasses.OUTRO;
  }

  private emptyForm(): InvestmentForm {
    return { investorId: '', projectId: '', amount: null, date: '', type: 'FINANCEIRO', notes: '' };
  }
}

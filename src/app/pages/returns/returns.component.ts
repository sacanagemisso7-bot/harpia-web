import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Investment } from '../../core/models/investment.model';
import { Investor } from '../../core/models/investor.model';
import { Return, ReturnStatus } from '../../core/models/return.model';
import { InvestmentService } from '../../core/services/investment.service';
import { InvestorService } from '../../core/services/investor.service';
import { ReturnService } from '../../core/services/return.service';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask.directive';
import { extractError } from '../../shared/utils/http-error';

interface ReturnForm {
  investmentId: string;
  expectedAmount: number | null;
  expectedDate: string;
}

interface PaymentForm {
  realizedDate: string;
  realizedAmount: number | null;
}

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyMaskDirective],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Retornos</h1>
      <button
        type="button"
        (click)="openCreate()"
        class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        + Novo Retorno
      </button>
    </div>

    <!-- Cards de resumo -->
    <div class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">Total Pendente</p>
        <p class="mt-1 text-xl font-bold text-ink">{{ formatBRL(totalPendente()) }}</p>
      </div>
      <div class="rounded-lg border border-border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">Total Atrasado</p>
        <p class="mt-1 text-xl font-bold" [class.text-red-600]="totalAtrasado() > 0" [class.text-ink]="totalAtrasado() === 0">
          {{ formatBRL(totalAtrasado()) }}
        </p>
      </div>
      <div class="rounded-lg border border-border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">Total Pago</p>
        <p class="mt-1 text-xl font-bold text-primary">{{ formatBRL(totalPago()) }}</p>
      </div>
    </div>

    <!-- Filtro -->
    <div class="mb-4">
      <select
        [(ngModel)]="statusFilter"
        (ngModelChange)="reload()"
        class="rounded border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">Todos os status</option>
        @for (opt of statusOptions; track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
    </div>

    <!-- Tabela -->
    <div class="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      @if (loading()) {
        <p class="p-5 text-sm text-muted">Carregando...</p>
      } @else if (error()) {
        <p class="p-5 text-sm text-red-600">{{ error() }}</p>
      } @else if (returns().length === 0) {
        <p class="p-5 text-sm text-muted">Nenhum retorno encontrado</p>
      } @else {
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Investidor</th>
              <th class="px-4 py-3 font-medium">Valor Esperado</th>
              <th class="px-4 py-3 font-medium">Data Esperada</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Valor Realizado</th>
              <th class="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (ret of returns(); track ret.id) {
              <tr class="transition-colors hover:bg-surface">
                <td class="px-4 py-3 font-medium text-ink">{{ investorNameByInvestment(ret.investmentId) }}</td>
                <td class="px-4 py-3 text-ink">{{ formatBRL(ret.expectedAmount) }}</td>
                <td class="px-4 py-3 text-muted">{{ formatDate(ret.expectedDate) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="badgeClass(ret.status)">
                    {{ statusLabel(ret.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-muted">
                  {{ ret.realizedAmount != null ? formatBRL(ret.realizedAmount) : '—' }}
                </td>
                <td class="px-4 py-3">
                  @if (ret.status !== 'PAGO') {
                    <button
                      type="button"
                      (click)="openPayment(ret)"
                      class="rounded border border-primary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      Marcar como Pago
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- Modal: Novo Retorno -->
    @if (createOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeCreate()">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Novo Retorno</h2>

          <form (ngSubmit)="saveCreate()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Aporte *</label>
              <select
                name="investmentId"
                [(ngModel)]="createForm.investmentId"
                required
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Selecione...</option>
                @for (ap of investments(); track ap.id) {
                  <option [value]="ap.id">{{ investmentLabel(ap) }}</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Valor Esperado (R$) *</label>
                <input
                  type="text"
                  name="expectedAmount"
                  appCurrencyMask
                  [(ngModel)]="createForm.expectedAmount"
                  inputmode="numeric"
                  placeholder="R$ 0,00"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Data Esperada *</label>
                <input
                  type="date"
                  name="expectedDate"
                  [(ngModel)]="createForm.expectedDate"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            @if (saveError()) {
              <p class="text-sm text-red-600">{{ saveError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeCreate()"
                class="rounded border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!isCreateValid() || saving()"
                class="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal: Marcar como Pago -->
    @if (paying(); as ret) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closePayment()">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-1 text-lg font-semibold text-ink">Marcar como Pago</h2>
          <p class="mb-4 text-sm text-muted">
            {{ investorNameByInvestment(ret.investmentId) }} — esperado {{ formatBRL(ret.expectedAmount) }}
            (venc. {{ formatDate(ret.expectedDate) }})
          </p>

          <form (ngSubmit)="confirmPayment()" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Data Realizada *</label>
                <input
                  type="date"
                  name="realizedDate"
                  [(ngModel)]="paymentForm.realizedDate"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Valor Realizado (R$) *</label>
                <input
                  type="text"
                  name="realizedAmount"
                  appCurrencyMask
                  [(ngModel)]="paymentForm.realizedAmount"
                  inputmode="numeric"
                  placeholder="R$ 0,00"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            @if (saveError()) {
              <p class="text-sm text-red-600">{{ saveError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closePayment()"
                class="rounded border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!isPaymentValid() || saving()"
                class="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ saving() ? 'Salvando...' : 'Confirmar Pagamento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ReturnsComponent implements OnInit {
  private readonly returnService = inject(ReturnService);
  private readonly investmentService = inject(InvestmentService);
  private readonly investorService = inject(InvestorService);

  readonly returns = signal<Return[]>([]);
  readonly investments = signal<Investment[]>([]);
  readonly investors = signal<Investor[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  statusFilter: ReturnStatus | '' = '';

  readonly createOpen = signal(false);
  readonly paying = signal<Return | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal('');
  createForm: ReturnForm = this.emptyCreateForm();
  paymentForm: PaymentForm = { realizedDate: '', realizedAmount: null };

  readonly totalPendente = computed(() => this.sumExpected('PENDENTE'));
  readonly totalAtrasado = computed(() => this.sumExpected('ATRASADO'));
  readonly totalPago = computed(() =>
    this.returns()
      .filter((r) => r.status === 'PAGO')
      .reduce((sum, r) => sum + (r.realizedAmount ?? 0), 0),
  );

  private readonly investmentMap = computed(
    () => new Map(this.investments().map((i) => [i.id, i])),
  );
  private readonly investorMap = computed(
    () => new Map(this.investors().map((i) => [i.id, i.name])),
  );

  private readonly currencyFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly dateFmt = new Intl.DateTimeFormat('pt-BR');

  readonly statusOptions: { value: ReturnStatus; label: string }[] = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PAGO', label: 'Pago' },
    { value: 'ATRASADO', label: 'Atrasado' },
  ];

  private readonly statusLabels: Record<ReturnStatus, string> = {
    PENDENTE: 'Pendente',
    PAGO: 'Pago',
    ATRASADO: 'Atrasado',
  };

  private readonly badgeClasses: Record<ReturnStatus, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    PAGO: 'bg-primary/10 text-primary',
    ATRASADO: 'bg-red-100 text-red-700',
  };

  ngOnInit(): void {
    forkJoin({
      returns: this.returnService.list(undefined, this.statusFilter),
      investments: this.investmentService.list(),
      investors: this.investorService.list(),
    }).subscribe({
      next: ({ returns, investments, investors }) => {
        this.returns.set(returns);
        this.investments.set(investments);
        this.investors.set(investors);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os retornos.');
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.returnService.list(undefined, this.statusFilter).subscribe({
      next: (list) => {
        this.returns.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os retornos.');
        this.loading.set(false);
      },
    });
  }

  // --- Novo retorno ---
  openCreate(): void {
    this.createForm = this.emptyCreateForm();
    this.saveError.set('');
    this.createOpen.set(true);
  }

  closeCreate(): void {
    this.createOpen.set(false);
  }

  isCreateValid(): boolean {
    return (
      !!this.createForm.investmentId &&
      this.createForm.expectedAmount != null &&
      this.createForm.expectedAmount > 0 &&
      !!this.createForm.expectedDate
    );
  }

  saveCreate(): void {
    if (!this.isCreateValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const payload: Partial<Return> = {
      expectedAmount: this.createForm.expectedAmount as number,
      expectedDate: new Date(this.createForm.expectedDate).toISOString(),
      investmentId: this.createForm.investmentId,
    };

    this.returnService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeCreate();
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(extractError(err));
      },
    });
  }

  // --- Marcar como pago ---
  openPayment(ret: Return): void {
    this.saveError.set('');
    this.paymentForm = {
      realizedDate: new Date().toISOString().slice(0, 10),
      realizedAmount: ret.expectedAmount,
    };
    this.paying.set(ret);
  }

  closePayment(): void {
    this.paying.set(null);
  }

  isPaymentValid(): boolean {
    return (
      !!this.paymentForm.realizedDate &&
      this.paymentForm.realizedAmount != null &&
      this.paymentForm.realizedAmount > 0
    );
  }

  confirmPayment(): void {
    const ret = this.paying();
    if (!ret || !this.isPaymentValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const payload: Partial<Return> = {
      status: 'PAGO',
      realizedDate: new Date(this.paymentForm.realizedDate).toISOString(),
      realizedAmount: this.paymentForm.realizedAmount as number,
    };

    this.returnService.update(ret.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closePayment();
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(extractError(err, 'Não foi possível confirmar o pagamento. Tente novamente.'));
      },
    });
  }

  // --- Helpers ---
  investorNameByInvestment(investmentId: string): string {
    const investment = this.investmentMap().get(investmentId);
    if (!investment) {
      return '—';
    }
    return this.investorMap().get(investment.investorId) ?? '—';
  }

  investmentLabel(ap: Investment): string {
    const name = this.investorMap().get(ap.investorId) ?? '—';
    return `${name} - ${this.formatBRL(ap.amount)}`;
  }

  formatBRL(value: number): string {
    return this.currencyFmt.format(value ?? 0);
  }

  formatDate(value?: string | null): string {
    return value ? this.dateFmt.format(new Date(value)) : '—';
  }

  statusLabel(status: ReturnStatus): string {
    return this.statusLabels[status] ?? status;
  }

  badgeClass(status: ReturnStatus): string {
    return this.badgeClasses[status] ?? this.badgeClasses.PENDENTE;
  }

  private sumExpected(status: ReturnStatus): number {
    return this.returns()
      .filter((r) => r.status === status)
      .reduce((sum, r) => sum + r.expectedAmount, 0);
  }

  private emptyCreateForm(): ReturnForm {
    return { investmentId: '', expectedAmount: null, expectedDate: '' };
  }
}

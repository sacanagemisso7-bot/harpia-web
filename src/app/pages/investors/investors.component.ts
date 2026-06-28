import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Investor, InvestorStatus } from '../../core/models/investor.model';
import { InvestorService } from '../../core/services/investor.service';

interface InvestorForm {
  name: string;
  email: string;
  phone: string;
  status: InvestorStatus;
  entryDate: string;
  notes: string;
}

@Component({
  selector: 'app-investors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Investidores</h1>
      <button
        type="button"
        (click)="openModal()"
        class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        + Novo Investidor
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <select
        [(ngModel)]="statusFilter"
        (ngModelChange)="reload()"
        class="rounded border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">Todos os status</option>
        <option value="ATIVO">Ativo</option>
        <option value="PROSPECTO">Prospecto</option>
        <option value="INATIVO">Inativo</option>
      </select>

      <input
        type="text"
        [(ngModel)]="search"
        (ngModelChange)="search$.next($event)"
        placeholder="Buscar por nome..."
        class="w-full rounded border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary sm:max-w-xs"
      />
    </div>

    <!-- Tabela -->
    <div class="overflow-hidden rounded-lg bg-white shadow-sm">
      @if (loading()) {
        <p class="p-5 text-sm text-gray-500">Carregando...</p>
      } @else if (error()) {
        <p class="p-5 text-sm text-red-600">{{ error() }}</p>
      } @else if (investors().length === 0) {
        <p class="p-5 text-sm text-gray-500">Nenhum investidor encontrado</p>
      } @else {
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Nome</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Telefone</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Data de Entrada</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (inv of investors(); track inv.id) {
              <tr
                [routerLink]="['/investors', inv.id]"
                class="cursor-pointer transition-colors hover:bg-surface"
              >
                <td class="px-4 py-3 font-medium text-ink">{{ inv.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ inv.email || '—' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ inv.phone || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="badgeClass(inv.status)">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ formatDate(inv.entryDate) }}</td>
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
          <h2 class="mb-4 text-lg font-semibold text-primary">Novo Investidor</h2>

          <form (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Nome *</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="form.name"
                required
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="form.email"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  [(ngModel)]="form.phone"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Status</label>
                <select
                  name="status"
                  [(ngModel)]="form.status"
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
                  name="entryDate"
                  [(ngModel)]="form.entryDate"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
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
                [disabled]="!form.name.trim() || saving()"
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
export class InvestorsComponent implements OnInit {
  private readonly investorService = inject(InvestorService);

  readonly investors = signal<Investor[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  statusFilter: InvestorStatus | '' = '';
  search = '';
  readonly search$ = new Subject<string>();

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  form: InvestorForm = this.emptyForm();

  private readonly dateFmt = new Intl.DateTimeFormat('pt-BR');

  private readonly badgeClasses: Record<InvestorStatus, string> = {
    ATIVO: 'bg-primary/10 text-primary',
    PROSPECTO: 'bg-yellow-100 text-yellow-700',
    INATIVO: 'bg-gray-100 text-gray-700',
  };

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => this.reload());
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.investorService.list(this.statusFilter, this.search.trim()).subscribe({
      next: (list) => {
        this.investors.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os investidores.');
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

  save(): void {
    if (!this.form.name.trim() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const payload: Partial<Investor> = { name: this.form.name.trim(), status: this.form.status };
    if (this.form.email.trim()) payload.email = this.form.email.trim();
    if (this.form.phone.trim()) payload.phone = this.form.phone.trim();
    if (this.form.entryDate) payload.entryDate = new Date(this.form.entryDate).toISOString();
    if (this.form.notes.trim()) payload.notes = this.form.notes.trim();

    this.investorService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.reload();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Não foi possível salvar. Verifique os dados e tente novamente.');
      },
    });
  }

  formatDate(value?: string | null): string {
    return value ? this.dateFmt.format(new Date(value)) : '—';
  }

  badgeClass(status: InvestorStatus): string {
    return this.badgeClasses[status] ?? this.badgeClasses.INATIVO;
  }

  private emptyForm(): InvestorForm {
    return { name: '', email: '', phone: '', status: 'PROSPECTO', entryDate: '', notes: '' };
  }
}

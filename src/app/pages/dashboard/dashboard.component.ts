import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardOverview } from '../../core/models/dashboard.model';
import { InteractionType } from '../../core/models/interaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-ink">Dashboard</h1>

    @if (loading()) {
      <p class="text-sm text-gray-500">Carregando...</p>
    } @else if (error()) {
      <div class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ error() }}
      </div>
    } @else {
      @if (data(); as d) {
      <!-- Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="relative rounded-lg border border-border bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Total Captado</p>
          <p class="mt-2 text-2xl font-bold text-primary">{{ formatBRL(d.totalCaptado) }}</p>
          <span class="absolute right-4 top-4 text-2xl">💰</span>
        </div>

        <div class="relative rounded-lg border border-border bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Investidores Ativos</p>
          <p class="mt-2 text-2xl font-bold text-ink">{{ d.totalInvestidores }}</p>
          <span class="absolute right-4 top-4 text-2xl">👥</span>
        </div>

        <div class="relative rounded-lg border border-border bg-white p-5 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Retornos Pendentes</p>
          <p class="mt-2 text-2xl font-bold text-ink">{{ d.retornosPendentes.count }}</p>
          <p class="text-sm text-gray-500">{{ formatBRL(d.retornosPendentes.valor) }}</p>
          <span class="absolute right-4 top-4 text-2xl">⏳</span>
        </div>

        <div
          class="relative rounded-lg border border-border bg-white p-5 shadow-sm"
          [class.ring-1]="d.retornosAtrasados.count > 0"
          [class.ring-red-200]="d.retornosAtrasados.count > 0"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Retornos Atrasados</p>
          <p
            class="mt-2 text-2xl font-bold"
            [class.text-red-600]="d.retornosAtrasados.count > 0"
            [class.text-ink]="d.retornosAtrasados.count === 0"
          >
            {{ d.retornosAtrasados.count }}
          </p>
          <p
            class="text-sm"
            [class.text-red-600]="d.retornosAtrasados.count > 0"
            [class.text-gray-500]="d.retornosAtrasados.count === 0"
          >
            {{ formatBRL(d.retornosAtrasados.valor) }}
          </p>
          <span class="absolute right-4 top-4 text-2xl">⚠️</span>
        </div>
      </div>

      <!-- Últimas interações -->
      <section class="mt-8">
        <h2 class="mb-3 text-lg font-semibold text-primary">Últimas Interações</h2>

        <div class="rounded-lg border border-border bg-white shadow-sm">
          @if (d.ultimasInteracoes.length === 0) {
            <p class="p-5 text-sm text-gray-500">Nenhuma interação registrada</p>
          } @else {
            <ul class="divide-y divide-border">
              @for (it of d.ultimasInteracoes; track it.id) {
                <li class="flex items-start justify-between gap-4 p-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-ink">{{ it.investor?.name ?? '—' }}</span>
                      <span
                        class="rounded px-2 py-0.5 text-xs font-medium"
                        [ngClass]="badgeClass(it.type)"
                      >
                        {{ it.type }}
                      </span>
                    </div>
                    <p class="mt-1 truncate text-sm text-gray-600">{{ it.summary }}</p>
                  </div>
                  <span class="shrink-0 text-sm text-gray-400">{{ formatDate(it.date) }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </section>
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly data = signal<DashboardOverview | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  private readonly currencyFmt = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly dateFmt = new Intl.DateTimeFormat('pt-BR');

  private readonly badgeClasses: Record<InteractionType, string> = {
    REUNIAO: 'bg-blue-100 text-blue-700',
    LIGACAO: 'bg-green-100 text-green-700',
    WHATSAPP: 'bg-emerald-100 text-emerald-700',
    EMAIL: 'bg-purple-100 text-purple-700',
    OUTRO: 'bg-gray-100 text-gray-700',
  };

  ngOnInit(): void {
    this.dashboardService.getOverview().subscribe({
      next: (overview) => {
        this.data.set(overview);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o dashboard. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  formatBRL(value: number): string {
    return this.currencyFmt.format(value ?? 0);
  }

  formatDate(value: string): string {
    return this.dateFmt.format(new Date(value));
  }

  badgeClass(type: InteractionType): string {
    return this.badgeClasses[type] ?? this.badgeClasses.OUTRO;
  }
}

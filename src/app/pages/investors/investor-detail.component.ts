import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Investment, InvestmentType } from '../../core/models/investment.model';
import { Interaction, InteractionType } from '../../core/models/interaction.model';
import { Investor, InvestorStatus } from '../../core/models/investor.model';
import { InteractionService } from '../../core/services/interaction.service';
import { InvestmentService } from '../../core/services/investment.service';
import { InvestorService } from '../../core/services/investor.service';

@Component({
  selector: 'app-investor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
      }
    }
  `,
})
export class InvestorDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly investorService = inject(InvestorService);
  private readonly investmentService = inject(InvestmentService);
  private readonly interactionService = inject(InteractionService);

  readonly investor = signal<Investor | null>(null);
  readonly investments = signal<Investment[]>([]);
  readonly interactions = signal<Interaction[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

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

    forkJoin({
      investor: this.investorService.getById(id),
      investments: this.investmentService.list(id),
      interactions: this.interactionService.list(id),
    }).subscribe({
      next: ({ investor, investments, interactions }) => {
        this.investor.set(investor);
        this.investments.set(investments);
        this.interactions.set(
          [...interactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os dados do investidor.');
        this.loading.set(false);
      },
    });
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

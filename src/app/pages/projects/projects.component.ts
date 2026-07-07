import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project, ProjectStatus } from '../../core/models/project.model';
import { ProjectService } from '../../core/services/project.service';

interface ProjectForm {
  name: string;
  description: string;
  status: ProjectStatus;
  location: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Projetos</h1>
      <button
        type="button"
        (click)="openModal()"
        class="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        + Novo Projeto
      </button>
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
    <div class="overflow-hidden rounded-xl border border-border bg-white shadow-md">
      @if (loading()) {
        <p class="p-5 text-sm text-muted">Carregando...</p>
      } @else if (error()) {
        <p class="p-5 text-sm text-red-600">{{ error() }}</p>
      } @else if (projects().length === 0) {
        <p class="p-5 text-sm text-muted">Nenhum projeto encontrado</p>
      } @else {
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Nome</th>
              <th class="px-4 py-3 font-medium">Localização</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Descrição</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (proj of projects(); track proj.id) {
              <tr class="transition-colors hover:bg-surface">
                <td class="px-4 py-3 font-medium text-ink">{{ proj.name }}</td>
                <td class="px-4 py-3 text-muted">{{ proj.location || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" [ngClass]="badgeClass(proj.status)">
                    {{ statusLabel(proj.status) }}
                  </span>
                </td>
                <td class="max-w-xs truncate px-4 py-3 text-muted">{{ proj.description || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- Modal -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Novo Projeto</h2>

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

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Descrição</label>
              <textarea
                name="description"
                [(ngModel)]="form.description"
                rows="3"
                class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Status</label>
                <select
                  name="status"
                  [(ngModel)]="form.status"
                  class="w-full rounded border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  @for (opt of statusOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Localização</label>
                <input
                  type="text"
                  name="location"
                  [(ngModel)]="form.location"
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
export class ProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  statusFilter: ProjectStatus | '' = '';

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  form: ProjectForm = this.emptyForm();

  readonly statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'EM_CAPTACAO', label: 'Em Captação' },
    { value: 'EM_OBRA', label: 'Em Obra' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  private readonly statusLabels: Record<ProjectStatus, string> = {
    EM_CAPTACAO: 'Em Captação',
    EM_OBRA: 'Em Obra',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  };

  private readonly badgeClasses: Record<ProjectStatus, string> = {
    EM_CAPTACAO: 'bg-primary/10 text-primary',
    EM_OBRA: 'bg-blue-100 text-blue-700',
    ENTREGUE: 'bg-gray-100 text-gray-700',
    CANCELADO: 'bg-red-100 text-red-700',
  };

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.projectService.list(this.statusFilter).subscribe({
      next: (list) => {
        this.projects.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os projetos.');
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

    const payload: Partial<Project> = { name: this.form.name.trim(), status: this.form.status };
    if (this.form.description.trim()) payload.description = this.form.description.trim();
    if (this.form.location.trim()) payload.location = this.form.location.trim();

    this.projectService.create(payload).subscribe({
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

  statusLabel(status: ProjectStatus): string {
    return this.statusLabels[status] ?? status;
  }

  badgeClass(status: ProjectStatus): string {
    return this.badgeClasses[status] ?? this.badgeClasses.ENTREGUE;
  }

  private emptyForm(): ProjectForm {
    return { name: '', description: '', status: 'EM_CAPTACAO', location: '' };
  }
}

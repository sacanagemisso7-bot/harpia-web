import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  CreatePersonInput,
  Person,
  PersonDocumentType,
  PersonRoleType,
  PersonType,
} from '../../core/models/person.model';
import { PersonService } from '../../core/services/person.service';
import { extractError, isEmailValid } from '../../shared/utils/http-error';
import { ROLE_OPTIONS, roleBadge, roleLabel } from '../../shared/utils/person-roles';

interface PersonForm {
  name: string;
  documentType: PersonDocumentType;
  document: string;
  personType: PersonType;
  email: string;
  phone: string;
  address: string;
  notes: string;
  roles: PersonRoleType[];
}

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-ink">Pessoas</h1>
      <button
        type="button"
        (click)="openModal()"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        + Nova Pessoa
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <select
        [(ngModel)]="roleFilter"
        (ngModelChange)="reload()"
        class="rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      >
        <option value="">Todos os papéis</option>
        @for (opt of roleOptions; track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>

      <input
        type="text"
        [(ngModel)]="search"
        (ngModelChange)="search$.next($event)"
        placeholder="Buscar por nome..."
        class="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary sm:max-w-xs"
      />
    </div>

    <!-- Tabela -->
    <div class="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      @if (loading()) {
        <p class="p-5 text-sm text-muted">Carregando...</p>
      } @else if (error()) {
        <p class="p-5 text-sm text-red-600">{{ error() }}</p>
      } @else if (people().length === 0) {
        <p class="p-5 text-sm text-muted">Nenhuma pessoa encontrada</p>
      } @else {
        <table class="w-full text-left text-sm">
          <thead class="border-b border-border bg-surface-warm text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Nome</th>
              <th class="px-4 py-3 font-medium">Documento</th>
              <th class="px-4 py-3 font-medium">Contato</th>
              <th class="px-4 py-3 font-medium">Papéis</th>
              <th class="px-4 py-3 font-medium">Tipo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @for (p of people(); track p.id) {
              <tr [routerLink]="['/people', p.id]" class="cursor-pointer transition-colors hover:bg-surface-warm">
                <td class="px-4 py-3 font-medium text-ink">{{ p.name }}</td>
                <td class="px-4 py-3 text-muted">{{ p.document || '—' }}</td>
                <td class="px-4 py-3 text-muted">
                  <div>{{ p.email || '—' }}</div>
                  @if (p.phone) {
                    <div class="text-xs">{{ p.phone }}</div>
                  }
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    @for (r of p.roles; track r.id) {
                      <span class="rounded-full px-2 py-0.5 text-xs font-medium" [ngClass]="badge(r.role)">
                        {{ label(r.role) }}
                      </span>
                    }
                    @if (p.roles.length === 0) {
                      <span class="text-xs text-muted">—</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3 text-muted">{{ typeLabel(p.personType) }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- Modal Nova Pessoa -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
        <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h2 class="mb-4 text-lg font-semibold text-ink">Nova Pessoa</h2>

          <form (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Nome *</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="form.name"
                required
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Tipo de Pessoa</label>
                <select
                  name="personType"
                  [(ngModel)]="form.personType"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="FISICA">Física</option>
                  <option value="JURIDICA">Jurídica</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Tipo de Doc.</label>
                <select
                  name="documentType"
                  [(ngModel)]="form.documentType"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Documento *</label>
                <input
                  type="text"
                  name="document"
                  [(ngModel)]="form.document"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                @if (documentInvalid()) {
                  <p class="mt-1 text-xs text-red-600">Documento inválido para {{ form.documentType }}</p>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="form.email"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                @if (emailInvalid()) {
                  <p class="mt-1 text-xs text-red-600">Email inválido</p>
                }
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  [(ngModel)]="form.phone"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Endereço</label>
              <input
                type="text"
                name="address"
                [(ngModel)]="form.address"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-ink">Observações</label>
              <textarea
                name="notes"
                [(ngModel)]="form.notes"
                rows="2"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              ></textarea>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-ink">Papéis</label>
              <div class="flex flex-wrap gap-2">
                @for (opt of roleOptions; track opt.value) {
                  <button
                    type="button"
                    (click)="toggleRole(opt.value)"
                    class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    [class]="form.roles.includes(opt.value)
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-muted hover:bg-surface-warm'"
                  >
                    {{ opt.label }}
                  </button>
                }
              </div>
            </div>

            @if (saveError()) {
              <p class="text-sm text-red-600">{{ saveError() }}</p>
            }

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="closeModal()"
                class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-warm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!isValid() || saving()"
                class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
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
export class PeopleComponent implements OnInit {
  private readonly personService = inject(PersonService);

  readonly people = signal<Person[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  roleFilter: PersonRoleType | '' = '';
  search = '';
  readonly search$ = new Subject<string>();

  readonly modalOpen = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  form: PersonForm = this.emptyForm();

  readonly roleOptions = ROLE_OPTIONS;
  readonly label = roleLabel;
  readonly badge = roleBadge;

  ngOnInit(): void {
    this.search$.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => this.reload());
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set('');
    this.personService.list(this.roleFilter, this.search.trim()).subscribe({
      next: (list) => {
        this.people.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as pessoas.');
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

  toggleRole(role: PersonRoleType): void {
    const roles = this.form.roles;
    this.form.roles = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
  }

  emailInvalid(): boolean {
    const email = this.form.email.trim();
    return email.length > 0 && !isEmailValid(email);
  }

  documentInvalid(): boolean {
    const doc = this.form.document.trim();
    if (!doc) {
      return false;
    }
    const digits = doc.replace(/\D/g, '');
    return this.form.documentType === 'CPF' ? digits.length !== 11 : digits.length !== 14;
  }

  isValid(): boolean {
    return (
      !!this.form.name.trim() &&
      !!this.form.document.trim() &&
      !this.documentInvalid() &&
      !this.emailInvalid()
    );
  }

  save(): void {
    if (!this.isValid() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    const payload: CreatePersonInput = {
      name: this.form.name.trim(),
      personType: this.form.personType,
      documentType: this.form.documentType,
      document: this.form.document.trim(),
      roles: this.form.roles,
    };
    if (this.form.email.trim()) payload.email = this.form.email.trim();
    if (this.form.phone.trim()) payload.phone = this.form.phone.trim();
    if (this.form.address.trim()) payload.address = this.form.address.trim();
    if (this.form.notes.trim()) payload.notes = this.form.notes.trim();

    this.personService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(
          err?.status === 409 ? 'Documento já cadastrado' : extractError(err),
        );
      },
    });
  }

  typeLabel(type: PersonType): string {
    return type === 'FISICA' ? 'Física' : 'Jurídica';
  }

  private emptyForm(): PersonForm {
    return {
      name: '',
      documentType: 'CPF',
      document: '',
      personType: 'FISICA',
      email: '',
      phone: '',
      address: '',
      notes: '',
      roles: [],
    };
  }
}

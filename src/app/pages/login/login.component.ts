import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-surface px-4">
      <div class="w-full max-w-[400px] rounded-xl border border-border bg-white p-8 shadow-md">
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-primary">Harpia</h1>
          <p class="mt-1 text-sm text-gray-500">Gestão de Investidores</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-ink">E-mail</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="w-full rounded border border-border px-3 py-2 text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="seu@email.com"
            />
            @if (isInvalid('email')) {
              <p class="mt-1 text-xs text-red-600">
                @if (form.controls.email.errors?.['required']) {
                  Informe seu e-mail.
                } @else {
                  E-mail inválido.
                }
              </p>
            }
          </div>

          <div>
            <label for="password" class="mb-1 block text-sm font-medium text-ink">Senha</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="w-full rounded border border-border px-3 py-2 text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••"
            />
            @if (isInvalid('password')) {
              <p class="mt-1 text-xs text-red-600">
                @if (form.controls.password.errors?.['required']) {
                  Informe sua senha.
                } @else {
                  A senha deve ter ao menos 6 caracteres.
                }
              </p>
            }
          </div>

          @if (errorMessage()) {
            <p class="text-center text-sm text-red-600">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full rounded bg-primary py-2.5 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(control: 'email' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Email ou senha inválidos');
      },
    });
  }
}

import { Component, inject } from '@angular/core';
import { LogOut, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="flex items-center justify-end gap-4 bg-white border-b border-border px-6 py-3">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          A
        </div>
        <span class="text-sm font-medium text-ink">{{ userName }}</span>
      </div>
      <button
        type="button"
        (click)="logout()"
        class="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface transition-colors"
      >
        <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
        Sair
      </button>
    </header>
  `,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  readonly userName = 'Admin Harpia';
  readonly LogOutIcon = LogOut;

  logout(): void {
    this.authService.logout();
  }
}

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  Building2,
  LayoutDashboard,
  LucideAngularModule,
  LucideIconData,
  MessageSquare,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-angular';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="flex h-screen w-64 flex-col border-r border-border bg-white">
      <!-- Logo -->
      <div class="flex items-center gap-2.5 px-6 py-6">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          H
        </span>
        <span class="text-xl font-bold tracking-tight text-ink">Harpia</span>
      </div>

      <!-- Navegação -->
      <nav class="flex-1 px-3 py-2 space-y-1">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary/10 text-primary border-primary"
            class="flex items-center gap-3 rounded-r px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface transition-colors border-l-2 border-transparent"
          >
            <lucide-icon [img]="item.icon" [size]="18"></lucide-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Perfil do usuário -->
      <div class="flex items-center gap-3 border-t border-border px-4 py-4">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          AH
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-ink">Admin Harpia</p>
          <p class="text-xs text-muted">Admin</p>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Investidores', path: '/investors', icon: Users },
    { label: 'Projetos', path: '/projects', icon: Building2 },
    { label: 'Aportes', path: '/investments', icon: Wallet },
    { label: 'Retornos', path: '/returns', icon: TrendingUp },
    { label: 'Interações', path: '/interactions', icon: MessageSquare },
  ];
}

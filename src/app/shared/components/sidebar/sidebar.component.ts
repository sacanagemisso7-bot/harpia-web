import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="flex h-screen w-64 flex-col border-r border-border bg-white">
      <div class="flex items-center gap-2 px-6 py-6">
        <span class="text-xl">🦅</span>
        <span class="text-2xl font-bold tracking-tight text-primary">Harpia</span>
      </div>

      <nav class="flex-1 px-3 py-2 space-y-1">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary/10 text-primary border-l-2 border-primary"
            class="flex items-center gap-3 rounded-r px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface transition-colors border-l-2 border-transparent"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="px-6 py-4 text-xs text-muted border-t border-border">
        Harpia &copy; {{ year }}
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly year = new Date().getFullYear();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Investidores', path: '/investors', icon: '👥' },
    { label: 'Projetos', path: '/projects', icon: '🏗️' },
    { label: 'Aportes', path: '/investments', icon: '💰' },
    { label: 'Retornos', path: '/returns', icon: '📈' },
    { label: 'Interações', path: '/interactions', icon: '💬' },
  ];
}

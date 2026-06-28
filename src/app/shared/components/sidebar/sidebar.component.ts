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
    <aside class="flex h-screen w-64 flex-col bg-primary text-white">
      <div class="flex items-center gap-2 px-6 py-6 border-b border-white/10">
        <span class="text-2xl font-bold tracking-wide text-accent">Harpia</span>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-white/10 border-l-4 border-accent"
            class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5 transition-colors border-l-4 border-transparent"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="px-6 py-4 text-xs text-gray-400 border-t border-white/10">
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

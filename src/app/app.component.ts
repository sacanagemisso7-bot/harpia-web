import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    @if (isLoginPage()) {
      <router-outlet />
    } @else {
      <div class="flex h-screen overflow-hidden">
        <app-sidebar />
        <div class="flex flex-1 flex-col overflow-hidden">
          <app-header />
          <main class="flex-1 overflow-y-auto bg-surface p-6">
            <router-outlet />
          </main>
        </div>
      </div>
    }
  `,
})
export class AppComponent {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isLoginPage(): boolean {
    return this.currentUrl().startsWith('/login');
  }
}

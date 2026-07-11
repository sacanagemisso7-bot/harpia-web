import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="flex flex-col items-start">
      <h1 class="text-2xl font-bold text-ink">{{ title() }}</h1>
      <p class="mt-2 rounded-md bg-surface-warm px-2.5 py-1 text-sm text-muted">
        em construção
      </p>
    </div>
  `,
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = toSignal(
    this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Página')),
    { initialValue: 'Página' },
  );
}

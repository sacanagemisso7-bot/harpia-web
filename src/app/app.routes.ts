import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';

const placeholder = (title: string) => ({
  canActivate: [authGuard],
  component: PlaceholderComponent,
  data: { title },
});

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  { path: 'dashboard', ...placeholder('Dashboard') },
  { path: 'people', ...placeholder('Pessoas') },
  { path: 'interactions', ...placeholder('Interações') },
  { path: 'developments', ...placeholder('Empreendimentos') },
  { path: 'investments', ...placeholder('Investimentos') },
  { path: 'returns', ...placeholder('Retornos') },
  { path: 'companies', ...placeholder('Empresas / SPEs') },
  { path: 'bank-accounts', ...placeholder('Contas Bancárias') },
  { path: '**', redirectTo: 'dashboard' },
];

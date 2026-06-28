import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'investors',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/investors/investors.component').then((m) => m.InvestorsComponent),
  },
  {
    path: 'investors/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/investors/investor-detail.component').then(
        (m) => m.InvestorDetailComponent,
      ),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
  },
  {
    path: 'investments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/investments/investments.component').then((m) => m.InvestmentsComponent),
  },
  {
    path: 'returns',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/returns/returns.component').then((m) => m.ReturnsComponent),
  },
  {
    path: 'interactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/interactions/interactions.component').then((m) => m.InteractionsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];

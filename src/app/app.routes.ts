import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    children: [],
  },
  {
    path: 'dashboard/seller',
    loadComponent: () =>
      import('./features/layouts/dashboard-layout/dashboard-layout.component').then(
        c => c.DashboardLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/seller-dashboard/seller-dashboard.component').then(
            c => c.SellerDashboardComponent
          ),
      },
      {
        path: 'quotes',
        loadComponent: () =>
          import('./features/seller-dashboard/quotes/quotes.component').then(
            c => c.QuotesComponent
          ),
      },
    ],
  },
];

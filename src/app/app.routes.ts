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
        path: 'quotes-requests',
        loadComponent: () =>
          import('./features/seller-dashboard/quotes-requests/quotes-requests.component').then(
            c => c.QuotesRequestsComponent
          ),
      },
    ],
  },
];

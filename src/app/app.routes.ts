import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/layouts/dashboard-layout/dashboard-layout.component').then(
        c => c.DashboardLayoutComponent
      ),
    children: [
      {
        path: 'seller',
        loadComponent: () =>
          import('./features/seller-dashboard/seller-dashboard.component').then(
            c => c.SellerDashboardComponent
          ),
      },
    ],
  },
];

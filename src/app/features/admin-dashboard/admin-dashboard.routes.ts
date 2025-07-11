import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { roleGuard } from '../../core/auth/guards/role.guard';
import { emailVerificationGuard } from '../../core/auth/guards/email-verification.guard';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';

export const adminDashboardRoutes: Routes = [
  {
    path: 'dashboard/admin',
    canActivate: [authGuard, roleGuard(['admin']), emailVerificationGuard],
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-dashboard.component').then(c => c.AdminDashboardComponent),
        title: 'Dashboard - Genie',
      },
      {
        path: 'pending-users',
        loadComponent: () =>
          import('./users/pending-users/pending-users.component').then(
            c => c.PendingUsersComponent
          ),
        title: 'Pending Users - Genie',
      },
      {
        path: 'all-users',
        loadComponent: () =>
          import('./users/all-users/all-users.component').then(c => c.AllUsersComponent),
        title: 'All Users - Genie',
      },
      {
        path: 'pending-products',
        loadComponent: () =>
          import('./products/pending-products/pending-products.component').then(
            c => c.PendingProductsComponent
          ),
        title: 'Pending Products - Genie',
      },
      {
        path: 'all-products',
        loadComponent: () =>
          import('./products/all-products/all-products.component').then(
            c => c.AllProductsComponent
          ),
        title: 'All Products - Genie',
      },
      {
        path: 'pending-categories',
        loadComponent: () =>
          import('./categories/pending-categories/pending-categories.component').then(
            c => c.PendingCategoriesComponent
          ),
        title: 'Pending Categories - Genie',
      },
      {
        path: 'all-categories',
        loadComponent: () =>
          import('./categories/all-categories/all-categories.component').then(
            c => c.AllCategoriesComponent
          ),
        title: 'All Categories - Genie',
      },
      {
        path: 'pending-contracts',
        loadComponent: () =>
          import('./contracts/pending-contracts/pending-contracts.component').then(
            c => c.PendingContractsComponent
          ),
        title: 'Pending Contracts - Genie',
      },
      {
        path: 'contracts',
        loadComponent: () =>
          import('./contracts/all-contracts/all-contracts.component').then(
            c => c.AllContractsComponent
          ),
        title: 'All Contracts - Genie',
      },
    ],
  },
];

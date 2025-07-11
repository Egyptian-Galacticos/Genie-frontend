import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { roleGuard } from '../../core/auth/guards/role.guard';
import { emailVerificationGuard } from '../../core/auth/guards/email-verification.guard';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';

export const sellerDashboardRoutes: Routes = [
  {
    path: 'dashboard/seller',
    canActivate: [authGuard, roleGuard(['seller']), emailVerificationGuard],
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        title: 'Seller Dashboard - Genie',
        loadComponent: () =>
          import('./seller-dashboard.component').then(c => c.SellerDashboardComponent),
      },
      {
        path: 'quotes-requests',
        title: 'Quotes Requests - Genie',
        loadComponent: () =>
          import('./quotes-requests/quotes-requests.component').then(
            c => c.QuotesRequestsComponent
          ),
      },
      {
        path: 'quotes-responses',
        title: 'Quotes Responses - Genie',
        loadComponent: () => import('./quotes/quotes.component').then(c => c.QuotesComponent),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            title: 'My Products - Genie',
            loadComponent: () =>
              import('./products/all-products/all-products.component').then(
                c => c.AllProductsComponent
              ),
          },
          {
            path: 'add',
            title: 'Add Product - Genie',
            loadComponent: () =>
              import('./products/add-product/add-product.component').then(
                c => c.AddProductComponent
              ),
          },
          {
            path: 'bulk-upload',
            title: 'Bulk Upload Products - Genie',
            loadComponent: () =>
              import('./bulk-upload/bulk-upload.component').then(c => c.BulkUploadComponent),
          },
        ],
      },
      {
        path: 'chat',
        loadComponent: () => import('../chat/chat.component').then(c => c.ChatComponent),
        title: 'Messages - Genie',
      },
    ],
  },
];

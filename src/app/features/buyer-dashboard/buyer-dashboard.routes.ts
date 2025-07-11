import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { roleGuard } from '../../core/auth/guards/role.guard';
import { emailVerificationGuard } from '../../core/auth/guards/email-verification.guard';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';

export const buyerDashboardRoutes: Routes = [
  {
    path: 'dashboard/buyer',
    canActivate: [authGuard, roleGuard(['buyer']), emailVerificationGuard],
    title: 'Buyer Dashboard - Genie',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./buyer-dashboard.component').then(c => c.BuyerDashboardComponent),
        title: 'Dashboard - Genie',
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./wishlist/wishlist.component').then(c => c.WishlistComponent),
        title: 'Wishlist - Genie',
      },
      {
        path: 'quotes-requests',
        loadComponent: () =>
          import('./components/quotes-requests/quotes-requests.component').then(
            c => c.BuyerQuotesRequestsComponent
          ),
        title: 'Quote Requests - Genie',
      },
      {
        path: 'quotes-responses',
        loadComponent: () =>
          import('./components/quotes-responses/quotes-responses.component').then(
            c => c.BuyerQuotesResponsesComponent
          ),
        title: 'Quote Responses - Genie',
      },
      {
        path: 'chat',
        loadComponent: () => import('../chat/chat.component').then(c => c.ChatComponent),
        title: 'Messages - Genie',
      },
    ],
  },
];

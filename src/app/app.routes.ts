import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { HomePageComponent } from './features/home/home-page/home-page.component';
import { emailVerificationGuard } from './core/auth/guards/email-verification.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { DashboardLayoutComponent } from './features/layouts/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
        title: 'Homepage - Genie',
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import('./pages/terms-and-conditions/terms-and-conditions.component').then(
            m => m.TermsAndConditionsComponent
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
        title: 'Products - Genie',
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
        title: 'Profile - Genie',
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'auth/email-pending',
    loadComponent: () =>
      import(
        './core/auth/pages/email-verification-pending/email-verification-pending.component'
      ).then(m => m.EmailVerificationPendingComponent),
    title: 'Email Verification Required - Genie',
    canActivate: [authGuard],
  },
  {
    path: 'auth/email-verify',
    loadComponent: () =>
      import('./core/auth/pages/verify-email/verify-email.component').then(
        m => m.VerifyEmailComponent
      ),
    title: 'Verify Email - Genie',
  },
  {
    path: 'auth/company-send',
    loadComponent: () =>
      import(
        './core/auth/pages/company-email-verification/company-email-verification.component'
      ).then(m => m.CompanyEmailVerificationComponent),
    title: 'Send Company Email Verification - Genie',
    canActivate: [authGuard],
  },
  {
    path: 'auth/company-verify',
    loadComponent: () =>
      import('./core/auth/pages/verify-company-email/verify-company-email.component').then(
        m => m.VerifyCompanyEmailComponent
      ),
    title: 'Verify Company Email - Genie',
  },
  {
    path: 'auth',
    loadChildren: () => import('./core/auth/auth.routes').then(m => m.authRoutes),
    title: 'Auth - Genie',
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-redirect.component').then(
        m => m.DashboardRedirectComponent
      ),
    title: 'Dashboard - Genie',
    canActivate: [authGuard, emailVerificationGuard],
  },

  {
    path: 'dashboard/seller',
    canActivate: [authGuard, roleGuard(['seller']), emailVerificationGuard],
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        title: 'Seller Dashboard - Genie',
        loadComponent: () =>
          import('./features/seller-dashboard/seller-dashboard.component').then(
            c => c.SellerDashboardComponent
          ),
      },
      {
        path: 'quotes-requests',
        title: 'Quotes Requests - Genie',
        loadComponent: () =>
          import('./features/seller-dashboard/quotes-requests/quotes-requests.component').then(
            c => c.QuotesRequestsComponent
          ),
      },
      {
        path: 'quotes-responses',
        title: 'Quotes Responses - Genie',
        loadComponent: () =>
          import('./features/seller-dashboard/quotes/quotes.component').then(
            c => c.QuotesComponent
          ),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            title: 'My Products - Genie',
            loadComponent: () =>
              import(
                './features/seller-dashboard/products/all-products/all-products.component'
              ).then(c => c.AllProductsComponent),
          },
          {
            path: 'add',
            title: 'Add Product - Genie',
            loadComponent: () =>
              import('./features/seller-dashboard/products/add-product/add-product.component').then(
                c => c.AddProductComponent
              ),
          },
          {
            path: 'bulk-upload',
            title: 'Bulk Upload Products - Genie',
            loadComponent: () =>
              import('./features/seller-dashboard/bulk-upload/bulk-upload.component').then(
                c => c.BulkUploadComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'dashboard/buyer',
    canActivate: [authGuard, roleGuard(['buyer']), emailVerificationGuard],
    title: 'Buyer Dashboard - Genie',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/buyer-dashboard/buyer-dashboard.component').then(
            c => c.BuyerDashboardComponent
          ),
        title: 'Dashboard - Genie',
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/buyer-dashboard/wishlist/wishlist.component').then(
            c => c.WishlistComponent
          ),
        title: 'Wishlist - Genie',
      },
      {
        path: 'quotes-requests',
        loadComponent: () =>
          import(
            './features/buyer-dashboard/components/quotes-requests/quotes-requests.component'
          ).then(c => c.BuyerQuotesRequestsComponent),
        title: 'Quote Requests - Genie',
      },
      {
        path: 'quotes-responses',
        loadComponent: () =>
          import(
            './features/buyer-dashboard/components/quotes-responses/quotes-responses.component'
          ).then(c => c.BuyerQuotesResponsesComponent),
        title: 'Quote Responses - Genie',
      },
    ],
  },
  {
    path: 'dashboard/admin',
    canActivate: [roleGuard(['admin']), authGuard, emailVerificationGuard],
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard.component').then(
            c => c.AdminDashboardComponent
          ),
        title: 'Dashboard - Genie',
      },
      {
        path: 'pending-users',
        loadComponent: () =>
          import('./features/admin-dashboard/users/pending-users/pending-users.component').then(
            c => c.PendingUsersComponent
          ),
        title: 'Pending Users - Genie',
      },
      {
        path: 'pending-products',
        loadComponent: () =>
          import(
            './features/admin-dashboard/products/pending-products/pending-products.component'
          ).then(c => c.PendingProductsComponent),
        title: 'Pending Products - Genie',
      },
      {
        path: 'pending-categories',
        loadComponent: () =>
          import(
            './features/admin-dashboard/categories/pending-categories/pending-categories.component'
          ).then(c => c.PendingCategoriesComponent),
        title: 'Pending Categories - Genie',
      },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Unauthorized - Genie',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Genie',
  },
];

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { HomePageComponent } from './features/home/home-page/home-page.component';
import { emailVerificationGuard } from './core/auth/guards/email-verification.guard';
import { adminDashboardRoutes } from './features/admin-dashboard/admin-dashboard.routes';
import { sellerDashboardRoutes } from './features/seller-dashboard/seller-dashboard.routes';
import { buyerDashboardRoutes } from './features/buyer-dashboard/buyer-dashboard.routes';

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
        title: 'Contact Us - Genie',
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
        title: 'About Us - Genie',
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import('./pages/terms-and-conditions/terms-and-conditions.component').then(
            m => m.TermsAndConditionsComponent
          ),
        title: 'Terms and Conditions - Genie',
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

  // Dashboard Routes
  ...sellerDashboardRoutes,
  ...buyerDashboardRoutes,
  ...adminDashboardRoutes,

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

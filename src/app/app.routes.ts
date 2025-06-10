import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { emailVerificationGuard } from './core/auth/guards/email-verification.guard';

export const routes: Routes = [
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

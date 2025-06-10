import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('../auth/pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Genie',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../auth/pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Create Account - Genie',
  },
  {
    path: 'register-success',
    loadComponent: () =>
      import('../auth/pages/register-success/register-success.component').then(
        m => m.RegisterSuccessComponent
      ),
    title: 'Registration Successful - Genie',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('../auth/pages/forgot-password/forgot-password.component').then(
        m => m.ForgotPasswordComponent
      ),
    title: 'Forgot Password - Genie',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('../auth/pages/reset-password/reset-password.component').then(
        m => m.ResetPasswordComponent
      ),
    title: 'Reset Password - Genie',
  },
  {
    path: 'account-suspended',
    loadComponent: () =>
      import('../auth/pages/account-suspended/account-suspended.component').then(
        m => m.AccountSuspendedComponent
      ),
    title: 'Account Suspended - Genie',
  },
];

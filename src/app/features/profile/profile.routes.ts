import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile.component').then(m => m.ProfileComponent),
    children: [
      {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full',
      },
      {
        path: 'user',
        loadComponent: () => import('./pages/user/user.component').then(m => m.UserComponent),
        title: 'Profile Data - Genie',
      },
      {
        path: 'company',
        loadComponent: () =>
          import('./pages/company/company.component').then(m => m.CompanyComponent),
        title: 'Company Data - Genie',
      },
      {
        path: 'password',
        loadComponent: () =>
          import('./pages/password/password.component').then(m => m.PasswordComponent),
        title: 'Change Password - Genie',
      },
      {
        path: 'deactivation',
        loadComponent: () =>
          import('./pages/deactivation/deactivation.component').then(m => m.DeactivationComponent),
        title: 'Account Deactivation - Genie',
      },
    ],
  },
];

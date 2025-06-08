import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

/**
 * Role-based guard factory
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return false;
    }

    return toObservable(authService.isInitializing).pipe(
      filter(isInitializing => !isInitializing),
      take(1),
      map(() => {
        if (!authService.isAuthenticated()) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url },
            replaceUrl: true,
          });
          return false;
        }

        if (authService.hasAnyRole(requiredRoles)) {
          return true;
        }

        router.navigate(['/unauthorized'], { replaceUrl: true });
        return false;
      })
    );
  };
};

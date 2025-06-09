import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

/**
 * Guest guard - redirects authenticated users away from auth pages
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return toObservable(authService.isInitializing).pipe(
    filter(isInitializing => !isInitializing),
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        return true;
      }

      router.navigate(['/'], { replaceUrl: true });
      return false;
    })
  );
};

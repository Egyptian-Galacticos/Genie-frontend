import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

/**
 * Email verification guard for route activation
 * Checks if the authenticated user has verified their email address
 * Only applies to buyers
 * Redirects to email verification pending page if not verified
 */
export const emailVerificationGuard: CanActivateFn = (route, state) => {
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
      const user = authService.user();
      const isAuthenticated = authService.isAuthenticated();
      
      // If not authenticated or no user, allow navigation
      if (!isAuthenticated || !user) {
        return true;
      }

      // If email is verified, allow navigation
      if (user.is_email_verified) {
        return true;
      }

      // Check if user is a buyer
      const isBuyer = authService.hasRole('buyer');

      // Skip verification check for non-buyers
      if (!isBuyer) {
        return true;
      }

      // At this point: user is a buyer and email is not verified
      router.navigate(['/auth/email-pending'], {
        queryParams: { returnUrl: state.url },
        replaceUrl: true,
      });
      return false;
    })
  );
};

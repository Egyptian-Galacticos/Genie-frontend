import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Skip auth public endpoints
  if (shouldSkipAuth(req.url)) {
    return next(req);
  }
  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors by attempting to refresh the token
      if (error.status === 401 && !shouldSkipAuth(req.url)) {
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
            // Retry the original request with the new token
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // If refresh fails, let the auth service handle logout
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

/**
 * Check if auth should be skipped for this request
 */
function shouldSkipAuth(url: string): boolean {
  const skipAuthEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/email/verify',
    '/public/',
  ];

  return skipAuthEndpoints.some(endpoint => url.includes(endpoint));
}

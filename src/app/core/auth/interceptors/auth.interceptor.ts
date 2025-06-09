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
  if (shouldSkipAuth(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);

  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !shouldSkipAuth(req.url)) {
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(retryReq);
          }),
          catchError(refreshError => throwError(() => refreshError))
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
    '/auth/refresh-token',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/email/verify',
    '/public/',
  ];

  return skipAuthEndpoints.some(endpoint => url.includes(endpoint));
}

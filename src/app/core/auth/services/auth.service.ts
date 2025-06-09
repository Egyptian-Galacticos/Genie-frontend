import { Injectable, signal, computed, effect, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError, switchMap, tap, finalize } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RefreshTokenRequest,
  User,
  AuthTokens,
} from '../interfaces/login.interface';
import { RegistrationData, RegistrationResponse } from '../interfaces/register.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _user = signal<User | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _isInitializing = signal<boolean>(true);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isInitializing = this._isInitializing.asReadonly();
  readonly userRoles = computed(() => this._user()?.roles || []);

  private refreshTokenTimer?: ReturnType<typeof setTimeout>;
  private refreshInProgress = signal<boolean>(false);
  private rememberMePreference = signal<boolean>(false);

  constructor() {
    if (this.isBrowser) {
      this.initializeAuth();
      this.setupTokenRefresh();
    }
  }

  /**
   * Initialize authentication state from stored tokens
   */
  private initializeAuth(): void {
    this.guardBrowser(() => {
      const accessToken = this.getStoredAccessToken();
      const userData = this.getStoredUserData();
      const refreshToken = this.getStoredRefreshToken();

      // Determine remember me preference from where tokens are stored
      const accessTokenInLocalStorage = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const refreshTokenInLocalStorage = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      this.rememberMePreference.set(!!(accessTokenInLocalStorage || refreshTokenInLocalStorage));

      if (accessToken && userData) {
        this._accessToken.set(accessToken);
        this._user.set(userData);
        this._isAuthenticated.set(true);
        this._isInitializing.set(false);
      } else if (refreshToken && userData) {
        this.attemptSilentRefresh();
      } else {
        this._isInitializing.set(false);
      }
    });
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (!this.isBrowser) return;

    effect(() => {
      const isAuthenticated = this._isAuthenticated();
      if (isAuthenticated) {
        this.scheduleTokenRefresh();
      } else {
        this.clearRefreshTimer();
      }
    });
  }

  /**
   * Attempt silent token refresh during initialization
   */
  private attemptSilentRefresh(): void {
    this.refreshToken().subscribe({
      next: () => {
        const userData = this.getStoredUserData();
        if (userData) {
          this._user.set(userData);
          this._isAuthenticated.set(true);
        }
        this._isInitializing.set(false);
      },
      error: error => {
        this.clearAccessTokenOnly();

        if (error?.status === 401 || error?.status === 403) {
          this.clearRefreshTokenAndUserData();
        }

        this._isInitializing.set(false);
      },
    });
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials).pipe(
      tap(response => {
        if (response.success) {
          this.handleLoginSuccess(response, credentials.remember_me);
        }
      })
    );
  }

  /**
   * Handle successful login
   */
  private handleLoginSuccess(response: LoginResponse, rememberMe?: boolean): void {
    const { user, access_token, refresh_token, expires_in } = response.data;

    this.rememberMePreference.set(!!rememberMe);
    this.storeTokens({ access_token, refresh_token, expires_in }, rememberMe);
    this.storeUserData(user);

    this._accessToken.set(access_token);
    this._user.set(user);
    this._isAuthenticated.set(true);

    if (this.isBrowser) {
      this.scheduleTokenRefresh(expires_in);
    }
  }

  /**
   * Logout user
   */
  logout(): Observable<unknown> {
    return this.apiService.post('auth/logout', {}).pipe(
      finalize(() => {
        this.handleLogout();
      }),
      catchError(() => {
        this.handleLogout();
        return EMPTY;
      })
    );
  }

  /**
   * Handle logout cleanup
   */
  private handleLogout(): void {
    this.clearTokens();
    this.clearUserData();
    this.clearRefreshTimer();

    this._accessToken.set(null);
    this._user.set(null);
    this._isAuthenticated.set(false);
    this.rememberMePreference.set(false);

    if (this.isBrowser) {
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<string> {
    if (this.refreshInProgress()) {
      return EMPTY;
    }

    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      this.clearAuthenticationState();
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshInProgress.set(true);

    const refreshRequest: RefreshTokenRequest = { refresh_token: refreshToken };

    return this.apiService.post<RefreshTokenResponse>('auth/refresh-token', refreshRequest).pipe(
      tap(response => {
        if (response.success) {
          const { access_token, expires_in } = response.data;
          this.updateAccessToken(access_token);
          if (this.isBrowser) {
            this.scheduleTokenRefresh(expires_in);
          }
        }
      }),
      switchMap(response =>
        response.success
          ? [response.data.access_token]
          : throwError(() => new Error('Token refresh failed'))
      ),
      catchError(error => {
        this.clearAuthenticationState();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInProgress.set(false);
      })
    );
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this._accessToken() || this.getStoredAccessToken();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresIn?: number): void {
    if (!this.isBrowser) return;

    this.clearRefreshTimer();

    const refreshTime = expiresIn ? (expiresIn - 300) * 1000 : 3300000; // 55 minutes default

    this.ngZone.runOutsideAngular(() => {
      this.refreshTokenTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.refreshToken().subscribe({
            error: () => {
              // Silent error handling for auto refresh
            },
          });
        });
      }, refreshTime);
    });
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
      this.refreshTokenTimer = undefined;
    }
  }

  /**
   * Update access token
   */
  private updateAccessToken(token: string): void {
    this._accessToken.set(token);
    this.storeAccessToken(token);
  }

  /**
   * Clear authentication state (consolidated method)
   */
  private clearAuthenticationState(): void {
    this.clearAccessTokenOnly();
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._accessToken.set(null);
  }

  /**
   * Browser guard helper
   */
  private guardBrowser(callback: () => void): void {
    if (!this.isBrowser) {
      this._isInitializing.set(false);
      return;
    }
    callback();
  }

  /**
   * Store tokens securely based on remember me preference
   */
  private storeTokens(tokens: AuthTokens, rememberMe?: boolean): void {
    this.guardBrowser(() => {
      if (rememberMe) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
      } else {
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
      }
    });
  }

  /**
   * Store access token based on remember me preference
   */
  private storeAccessToken(token: string): void {
    this.guardBrowser(() => {
      if (this.rememberMePreference()) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      } else {
        sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      }
    });
  }

  /**
   * Store user data
   */
  private storeUserData(user: User): void {
    this.guardBrowser(() => {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
    });
  }

  /**
   * Get stored access token with fallback
   */
  private getStoredAccessToken(): string | null {
    if (!this.isBrowser) return null;

    return this.rememberMePreference()
      ? localStorage.getItem(this.ACCESS_TOKEN_KEY)
      : sessionStorage.getItem(this.ACCESS_TOKEN_KEY) ||
          localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get stored refresh token with fallback
   */
  private getStoredRefreshToken(): string | null {
    if (!this.isBrowser) return null;

    return this.rememberMePreference()
      ? localStorage.getItem(this.REFRESH_TOKEN_KEY)
      : sessionStorage.getItem(this.REFRESH_TOKEN_KEY) ||
          localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  private getStoredUserData(): User | null {
    if (!this.isBrowser) return null;

    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Clear all tokens from both storage locations
   */
  private clearTokens(): void {
    this.guardBrowser(() => {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    });
  }

  /**
   * Clear only access tokens from both storage locations
   */
  private clearAccessTokenOnly(): void {
    this.guardBrowser(() => {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    });
  }

  /**
   * Clear refresh token and user data from both storage locations
   */
  private clearRefreshTokenAndUserData(): void {
    this.guardBrowser(() => {
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
    });
  }

  /**
   * Clear user data
   */
  private clearUserData(): void {
    this.guardBrowser(() => {
      localStorage.removeItem(this.USER_DATA_KEY);
    });
  }

  /**
   * Register new user
   */
  register(data: RegistrationData): Observable<RegistrationResponse> {
    return this.apiService.post<RegistrationResponse>('auth/register', data).pipe(
      tap(response => {
        if (response.success) {
          const { user, access_token, refresh_token, expires_in } = response.data;
          const convertedUser: User = {
            ...user,
            roles: [...user.roles],
            company: {
              ...user.company,
              website: user.company.website || null,
              description: user.company.description || null,
              logo: user.company.logo || null,
            },
          };
          this.handleLoginSuccess(
            {
              success: true,
              message: response.message,
              data: { user: convertedUser, access_token, refresh_token, expires_in },
            },
            true
          );
        }
      })
    );
  }

  /**
   * Generic auth API call helper
   */
  private authApiCall(
    endpoint: string,
    data: Record<string, unknown>
  ): Observable<{ message: string; success: boolean }> {
    return this.apiService
      .post<{ message: string; success: boolean }>(`auth/${endpoint}`, data)
      .pipe(catchError(error => throwError(() => error)));
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<{ message: string; success: boolean }> {
    return this.authApiCall('forgot-password', { email });
  }

  /**
   * Reset password
   */
  resetPassword(data: {
    token: string;
    password: string;
    password_confirmation: string;
    email: string;
  }): Observable<{ message: string; success: boolean }> {
    return this.authApiCall('reset-password', data);
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): Observable<{ message: string; success: boolean }> {
    return this.authApiCall('email/verify', { token });
  }

  /**
   * Resend email verification
   */
  resendVerificationEmail(email: string): Observable<{ message: string; success: boolean }> {
    return this.authApiCall('email/resend-verification', { email });
  }
}

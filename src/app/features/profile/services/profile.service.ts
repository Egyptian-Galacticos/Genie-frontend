import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/interfaces/api.interface';
import {
  Profile,
  User,
  Company,
  PasswordChangeRequest,
  ProfileApiResponse,
  UserUpdateRequest,
  MessageResponse,
} from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiService = inject(ApiService);

  private _profile = signal<Profile | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly user = computed(() => this.profile()?.user || null);
  readonly company = computed(() => this.profile()?.company || null);
  readonly roles = computed(() => this.profile()?.roles || []);
  readonly isLoaded = computed(() => this.profile() !== null);

  readonly canUpdateEmail = computed(() => {
    const user = this.user();
    return user ? !user.is_email_verified : false;
  });

  readonly canUpdateCompanyEmail = computed(() => {
    const company = this.company();
    return company ? !company.is_email_verified : false;
  });

  readonly canUpdateRestrictedCompanyFields = computed(() => {
    const user = this.user();
    const roles = this.roles();

    if (!user) return false;

    const isBuyer = roles.includes('buyer');
    const isSeller = roles.includes('seller');
    const isPending = user.status === 'pending';

    // buyer and no seller - pending OR no role and pending → can update
    if ((isBuyer && !isSeller && isPending) || (!isBuyer && !isSeller && isPending)) {
      return true;
    }

    // All other cases → can't update
    return false;
  });

  readonly canViewRestrictedCompanyFields = computed(() => {
    const user = this.user();
    const roles = this.roles();

    if (!user) return false;

    const isBuyer = roles.includes('buyer');
    const isSeller = roles.includes('seller');
    const isActive = user.status === 'active';

    if (isBuyer && !isSeller && isActive) {
      return false;
    }

    return true;
  });

  readonly getUpdatePermissions = computed(() => ({
    canUpdateEmail: this.canUpdateEmail(),
    canUpdateCompanyEmail: this.canUpdateCompanyEmail(),
    canUpdateRestrictedCompanyFields: this.canUpdateRestrictedCompanyFields(),
    canViewRestrictedCompanyFields: this.canViewRestrictedCompanyFields(),
    isCompanyEmailVerified: this.company()?.is_email_verified || false,
    isUserEmailVerified: this.user()?.is_email_verified || false,
    userStatus: this.user()?.status || 'unknown',
    userRoles: this.roles(),
  }));

  /**
   * Load profile data from API
   */
  loadProfile(): Observable<Profile> {
    return this.handleRequest(
      this.apiService.get<ApiResponse<ProfileApiResponse>>('me').pipe(
        map(response => this.transformApiResponse(response.data)),
        tap(profile => this._profile.set(profile))
      ),
      'Failed to load profile'
    );
  }

  /**
   * Update user profile information
   */
  updateUser(userData: UserUpdateRequest): Observable<User> {
    return this.handleRequest(
      this.apiService.put<ApiResponse<User>>('user/profile', userData).pipe(
        map(response => response.data),
        tap(updatedUser => {
          const currentProfile = this._profile();
          if (currentProfile) {
            this._profile.set({
              ...currentProfile,
              user: updatedUser,
            });
          }
        })
      ),
      'Failed to update user profile'
    );
  }

  /**
   * Update company information
   */
  updateCompany(formData: FormData): Observable<Company> {
    // Add Laravel method spoofing for all requests
    formData.append('_method', 'PUT');

    return this.handleRequest(
      this.apiService.post<ApiResponse<Company>>('user/company', formData).pipe(
        map(response => response.data),
        tap(updatedCompany => {
          const currentProfile = this._profile();
          if (currentProfile) {
            this._profile.set({
              ...currentProfile,
              company: updatedCompany,
            });
          }
        })
      ),
      'Failed to update company'
    );
  }

  /**
   * Change user password
   */
  changePassword(passwordData: PasswordChangeRequest): Observable<MessageResponse> {
    return this.handleRequest(
      this.apiService
        .put<ApiResponse<MessageResponse>>('user/password', passwordData)
        .pipe(map(response => response.data)),
      'Failed to change password'
    );
  }

  /**
   * Deactivate user account
   */
  deactivateAccount(userId: number): Observable<MessageResponse> {
    return this.handleRequest(
      this.apiService.delete<ApiResponse<MessageResponse>>(`user/${userId}`).pipe(
        map(response => response.data),
        tap(() => this._profile.set(null))
      ),
      'Failed to deactivate account'
    );
  }

  /**
   * Refresh profile data
   */
  refresh(): Observable<Profile> {
    return this.loadProfile();
  }

  /**
   * Transform API response to internal Profile structure
   */
  private transformApiResponse(apiData: ProfileApiResponse): Profile {
    return {
      user: {
        id: apiData.id,
        first_name: apiData.first_name,
        last_name: apiData.last_name,
        full_name: apiData.full_name,
        email: apiData.email,
        phone_number: apiData.phone_number,
        is_email_verified: apiData.is_email_verified,
        status: apiData.status,
        last_login_at: apiData.last_login_at,
        created_at: apiData.created_at,
        updated_at: apiData.updated_at,
      },
      company: apiData.company,
      roles: apiData.roles,
    };
  }

  /**
   * Helper method to handle common loading and error states
   */
  private handleRequest<T>(operation: Observable<T>, errorMessage: string): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    return operation.pipe(
      tap(() => this._loading.set(false)),
      catchError(error => {
        this._error.set(error.message || errorMessage);
        this._loading.set(false);
        return throwError(() => error);
      })
    );
  }
}

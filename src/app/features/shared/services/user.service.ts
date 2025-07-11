import { IUser } from '../utils/interfaces';
import { PaginatedResponse, RequestOptions } from './../../../core/interfaces/api.interface';
import { ApiService } from './../../../core/services/api.service';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(ApiService);

  getUsers(requestOptions: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IUser>>('admin/users', requestOptions);
  }
  approveUser(userId: number) {
    return this.apiService.put(`admin/seller-registrations/${userId}/review`, {
      action: 'approve',
    });
  }

  /**
   * Deactivate a seller user
   * @param userId User ID to deactivate
   * @returns Observable of API response
   */
  deactivateSeller(userId: number) {
    return this.apiService.put(`admin/users/${userId}`, {
      status: 'pending',
    });
  }

  /**
   * Suspend a user
   * @param userId User ID to suspend
   * @returns Observable of API response
   */
  suspendUser(userId: number) {
    return this.apiService.put(`admin/users/${userId}`, {
      status: 'suspended',
    });
  }

  /**
   * Activate a user
   * @param userId User ID to activate
   * @returns Observable of API response
   */
  activateUser(userId: number) {
    return this.apiService.put(`admin/users/${userId}`, {
      status: 'active',
    });
  }

  /**
   * Activate a seller (approve pending seller registration)
   * @param userId User ID to activate as seller
   * @returns Observable of API response
   */
  activateSeller(userId: number) {
    return this.apiService.put(`admin/seller-registrations/${userId}/review`, {
      action: 'approve',
    });
  }
}

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
}

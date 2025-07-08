import { IAdminStatistics, IBuyerStatistics, ISellerStatistics } from '../utils/interfaces';
import {
  ApiResponse,
  PaginatedResponse,
  RequestOptions,
} from '../../../core/interfaces/api.interface';
import { ApiService } from '../../../core/services/api.service';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiService = inject(ApiService);
  getBuyerStatistics(requestOptions: RequestOptions) {
    requestOptions.params = {
      ...requestOptions.params,
      user_type: 'buyer',
    };
    return this.apiService.get<ApiResponse<IBuyerStatistics>>('statistics', requestOptions);
  }
  getSellerStatistics(requestOptions: RequestOptions) {
    requestOptions.params = {
      ...requestOptions.params,
      user_type: 'seller',
    };
    return this.apiService.get<PaginatedResponse<ISellerStatistics>>('statistics', requestOptions);
  }
  getAdminStatistics(requestOptions: RequestOptions) {
    requestOptions.params = {
      ...requestOptions.params,
      user_type: 'admin',
    };
    return this.apiService.get<PaginatedResponse<IAdminStatistics>>('statistics', requestOptions);
  }
}

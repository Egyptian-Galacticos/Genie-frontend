import { PaginatedResponse, RequestOptions } from '../../../core/interfaces/api.interface';
import { ApiService } from './../../../core/services/api.service';
import { CreateQuoteDto, IRequestForQuote } from './../utils/interfaces';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QuotesService {
  private readonly apiService = inject(ApiService);

  getCurrentSellerQuoteRequest(requestOptions: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IRequestForQuote>>(
      'quotes-requests',
      requestOptions
    );
  }
  updateQuoteRequestStatus(dto: Partial<IRequestForQuote>) {
    return this.apiService.patch(`quotes-requests/${dto.id}`, dto);
  }
  createQuote(dto: CreateQuoteDto) {
    return this.apiService.post('quotes', dto);
  }
}

import { ApiResponse } from './../../../core/interfaces/conversation.interface';
import { PaginatedResponse, RequestOptions } from '../../../core/interfaces/api.interface';
import { ApiService } from './../../../core/services/api.service';
import { CreateQuoteDto, IQuote, IRequestForQuote } from './../utils/interfaces';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QuotesService {
  private readonly apiService = inject(ApiService);

  getCurrentSellerQuoteRequest(requestOptions: RequestOptions) {
    requestOptions.params = { ...requestOptions?.params, user_type: 'seller' };
    return this.apiService.get<PaginatedResponse<IRequestForQuote>>('rfqs', requestOptions);
  }

  getCurrentSellerQuotes(requestOptions: RequestOptions) {
    requestOptions.params = { ...requestOptions?.params, user_type: 'seller' };
    return this.apiService.get<PaginatedResponse<IQuote>>('quotes', requestOptions);
  }
  updateQuoteRequestStatus(dto: Partial<IRequestForQuote>) {
    return this.apiService.put(`rfqs/${dto.id}`, dto);
  }

  createQuote(dto: CreateQuoteDto) {
    return this.apiService.post<ApiResponse<IQuote>>('quotes', dto);
  }
  getBuyerRFQs(requestOptions: RequestOptions) {
    requestOptions.params = { ...requestOptions?.params, user_type: 'buyer' };
    return this.apiService.get<PaginatedResponse<IRequestForQuote>>('rfqs', requestOptions);
  }

  getBuyerQuotes(requestOptions: RequestOptions) {
    requestOptions.params = { ...requestOptions?.params, user_type: 'buyer' };
    return this.apiService.get<PaginatedResponse<IQuote>>('quotes', requestOptions);
  }
  createRFQ(rfqData: Partial<IRequestForQuote>) {
    return this.apiService.post('rfqs', rfqData);
  }

  acceptQuote(quoteId: string | number) {
    return this.apiService.put(`quotes/${quoteId}`, { status: 'accepted' });
  }

  rejectQuote(quoteId: string | number) {
    return this.apiService.put(`quotes/${quoteId}`, { status: 'rejected' });
  }
  getQuoteById(quoteId: string | number) {
    return this.apiService.get<ApiResponse<IQuote>>(`quotes/${quoteId}`);
  }
  getRFQById(rfqId: string | number) {
    return this.apiService.get<ApiResponse<IRequestForQuote>>(`rfqs/${rfqId}`);
  }
}

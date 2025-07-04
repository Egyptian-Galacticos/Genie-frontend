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
    return this.apiService.get<PaginatedResponse<IRequestForQuote>>('rfqs', requestOptions);
  }

  getCurrentSellerQuotes(requestOptions: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IQuote>>('quotes', requestOptions);
  }
  updateQuoteRequestStatus(dto: Partial<IRequestForQuote>) {
    return this.apiService.put(`rfqs/${dto.id}`, dto);
  }

  createQuote(dto: CreateQuoteDto) {
    return this.apiService.post('quotes', dto);
  }
  getBuyerRFQs(requestOptions?: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IRequestForQuote>>('rfqs', requestOptions);
  }

  getBuyerQuotes(requestOptions?: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IQuote>>('quotes', requestOptions);
  }
  createRFQ(rfqData: Partial<IRequestForQuote>) {
    return this.apiService.post('rfqs', rfqData);
  }

  acceptQuote(quoteId: string | number, quote: IQuote) {
    return this.apiService.put(`quotes/${quoteId}`, { ...quote, status: 'accepted' });
  }

  rejectQuote(quoteId: string | number, quote: IQuote) {
    return this.apiService.put(`quotes/${quoteId}`, { ...quote, status: 'rejected' });
  }
}

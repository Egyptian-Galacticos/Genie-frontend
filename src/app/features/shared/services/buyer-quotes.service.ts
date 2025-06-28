import { PaginatedResponse, RequestOptions } from '../../../core/interfaces/api.interface';
import { ApiService } from './../../../core/services/api.service';
import { IBuyerRequestForQuote, IBuyerQuote } from './../utils/buyer-interfaces';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BuyerQuotesService {
  private readonly apiService = inject(ApiService);

  getBuyerRFQs(requestOptions?: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IBuyerRequestForQuote>>('rfqs', requestOptions);
  }

  getBuyerQuotes(requestOptions?: RequestOptions) {
    return this.apiService.get<PaginatedResponse<IBuyerQuote>>('quotes', requestOptions);
  }
  createRFQ(rfqData: Partial<IBuyerRequestForQuote>) {
    return this.apiService.post('rfqs', rfqData);
  }

  acceptQuote(quoteId: string | number) {
    return this.apiService.put(`quotes/${quoteId}/accept`, {});
  }

  rejectQuote(quoteId: string | number) {
    return this.apiService.put(`quotes/${quoteId}/reject`, {});
  }
}

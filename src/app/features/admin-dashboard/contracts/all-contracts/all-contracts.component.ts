import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Contract, IQuote } from '../../../shared/utils/interfaces';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import {
  RequestOptions,
  PaginatedResponse,
  ApiResponse,
} from '../../../../core/interfaces/api.interface';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContractService } from '../../../shared/services/contract.service';
import { BadgeModule } from 'primeng/badge';
import { ContractDetailsDialogComponent } from '../../../shared/contract-details-dialog/contract-details-dialog.component';
import { QuoteDetailsDialogComponent } from '../../../shared/quote-details-dialog/quote-details-dialog.component';
import { QuotesService } from '../../../shared/services/quotes.service';

@Component({
  selector: 'app-all-contracts',
  templateUrl: './all-contracts.component.html',
  imports: [
    DataTableComponent,
    ButtonModule,
    DatePipe,
    ToastModule,
    ConfirmDialogModule,
    BadgeModule,
    ContractDetailsDialogComponent,
    QuoteDetailsDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class AllContractsComponent {
  contractService = inject(ContractService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  quoteService = inject(QuotesService);

  allContracts = model<Contract[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  quoteModalVisible = model<boolean>(false);
  selectedQuote = model<IQuote | null>(null);
  contractModalVisible = model<boolean>(false);
  selectedContract = model<Contract | null>(null);

  // Fetch all contracts from the service
  getAllContracts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);

    this.contractService.getContractsForAdmin(requestOptions).subscribe({
      next: (response: PaginatedResponse<Contract>) => {
        console.log('Fetching all contracts with options:', requestOptions);
        this.allContracts.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('All contracts fetched successfully:', this.allContracts());
      },
      error: (error: Error) => {
        console.error('Error fetching all contracts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch all contracts. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }
  viewQuote(quote: IQuote) {
    this.quoteService.getQuoteByIdForAdmin(quote.id).subscribe({
      next: (response: ApiResponse<IQuote>) => {
        this.selectedQuote.set(response.data);
        this.quoteModalVisible.set(true);
      },
      error: (error: Error) => {
        console.error('Error fetching quote details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch quote details. Please try again later.',
        });
      },
    });
  }
  viewContract(contract: Contract) {
    this.selectedContract.set(contract);
    this.contractModalVisible.set(true);
  }
  cols = [
    { field: 'contract_number', header: 'Contract', sortableColumn: true, filterableColumn: true },
    { field: 'seller.company.name', header: 'Seller' },
    { field: 'buyer.company_id', header: 'Buyer' },
    { field: 'quote_id', header: 'Quote' },
    {
      field: 'status',
      header: 'Status',
      filterableColumn: true,
      filterType: 'select',
      matchMode: 'equals',
      options: [
        'pending_approval',
        'pending_payment',
        'pending_payment_confirmation',
        'buyer_payment_rejected',
        'in_progress',
        'delivered_and_paid',
        'completed',
        'shipped',
        'cancelled',
      ],
    },
    { field: 'created_at', header: 'Creation Date', sortableColumn: true },
    { field: 'actions', header: 'Actions', filterType: 'clear' },
  ];
}

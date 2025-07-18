import { ContractService } from './../../shared/services/contract.service';
import { CreateContract, IQuote } from '../../shared/utils/interfaces';
import { PaginatedResponse, RequestOptions } from '../../../core/interfaces/api.interface';
import { Component, inject, model, signal } from '@angular/core';
import { DashboardInfoCardComponent } from '../../shared/dashboard-info-card/dashboard-info-card.component';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, SortMeta } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { QuotesService } from '../../shared/services/quotes.service';
import { ToastModule } from 'primeng/toast';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { StatusUtils } from '../../shared/utils/status-utils';
import { QuoteDetailsDialogComponent } from '../../shared/quote-details-dialog/quote-details-dialog.component';
import { ContractDialogComponent } from '../../shared/contract-dialog/contract-dialog.component';
import { ChatService } from '../../chat/services/chat.service';

@Component({
  selector: 'app-quotes',
  imports: [
    DashboardInfoCardComponent,
    TableModule,
    BadgeModule,
    ButtonModule,
    SkeletonModule,
    MultiSelectModule,
    FormsModule,
    DataTableComponent,
    CurrencyPipe,
    ToastModule,
    DatePipe,
    TitleCasePipe,
    QuoteDetailsDialogComponent,
    ContractDialogComponent,
  ],
  templateUrl: './quotes.component.html',
  providers: [MessageService],
})
export class QuotesComponent {
  private quoteService = inject(QuotesService);
  private messageService = inject(MessageService);
  private contractService = inject(ContractService);
  private chatService = inject(ChatService);

  createContractVisible = model<boolean>(false);
  quotes: PaginatedResponse<IQuote> | null = null;
  quotesLoading = true;
  quoteDetailsDialogVisible = signal<boolean>(false);
  selectedQuote: IQuote | null = null;
  first = 0;
  multiSortMeta: SortMeta[] = [{ field: 'date', order: -1 }];
  currentRequestOptions!: RequestOptions;

  //create quote modal variables
  createQuoteModalVisible = model<boolean>(false);
  beingQuotedQuoteRequest!: IQuote;
  creatingQuote = false;

  loadQuotes(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.quotesLoading = true;
    this.quoteService.getCurrentSellerQuotes(requestOptions).subscribe({
      next: (response: PaginatedResponse<IQuote>) => {
        this.quotes = response;
        this.quotesLoading = false;
      },
      error: error => {
        console.error(error);
        this.showError("Couldn't load quotes");
        this.quotesLoading = false;
      },
    });
  }

  // table columns definition
  cols = [
    {
      field: 'id',
      header: 'ID',
      sortableColumn: true,
      filterableColumn: false,
    },
    {
      field: 'buyer.company.name',
      header: 'Company Name',
      sortableColumn: false,
      filterableColumn: false,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'quote_items',
      header: 'Items',
      sortableColumn: false,
      filterableColumn: false,
    },
    {
      field: 'total_amount',
      header: 'Total Amount',
      sortableColumn: false,
      filterableColumn: false,
    },
    {
      field: 'status',
      header: 'Status',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'select',
      options: ['pending', 'sent', 'rejected', 'accepted'],
    },
    {
      field: 'created_at',
      header: 'Date Received',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'date',
    },
    {
      field: 'actions',
      header: 'Actions',
      sortableColumn: false,
      filterableColumn: false,
      filterType: 'clear',
    },
  ];

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    return StatusUtils.getStatusSeverity(status);
  }
  viewQuoteDetails(quote: IQuote) {
    console.log('Viewing quote details:', quote);
    this.selectedQuote = quote;
    this.quoteDetailsDialogVisible.set(true);
  }
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
  contractCreated(contractData: CreateContract): void {
    this.createContractVisible.set(false);
    this.contractService.createContract(contractData).subscribe({
      next: response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contract Created',
          detail: `Contract #${response.data.id} has been created successfully.`,
          life: 3000,
        });
        this.chatService.startConversation(this.selectedQuote?.buyer?.id || 0).subscribe({
          next: conversation => {
            this.chatService
              .sendMessage(
                conversation.id,
                `Contract #${response.data.id} has been created successfully`,
                'contract'
              )
              .subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Message Sent',
                    detail: 'Notification message sent to the buyer.',
                  });
                },
              });
          },
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create contract. Please try again.',
          life: 5000,
        });
      },
    });
  }

  createContract(quote: IQuote) {
    console.log('Creating contract for quote:', quote);
    this.quoteDetailsDialogVisible.set(false);
    this.selectedQuote = quote;
    this.createContractVisible.set(true);
  }
}

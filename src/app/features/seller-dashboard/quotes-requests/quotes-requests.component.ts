import { CreateQuoteDto, IRequestForQuote } from './../../shared/utils/interfaces';
import { PaginatedResponse, RequestOptions } from '../../../core/interfaces/api.interface';
import { Component, inject, signal } from '@angular/core';
import { DashboardInfoCardComponent } from '../../shared/dashboard-info-card/dashboard-info-card.component';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, SortMeta } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/data-table/data-table.component';
import { CreateQuoteModalComponent } from '../../shared/create-quote-modal/create-quote-modal.component';
import { QuotesService } from '../../shared/services/quotes.service';
import { ToastModule } from 'primeng/toast';
import { DatePipe } from '@angular/common';

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
    CreateQuoteModalComponent,
    CreateQuoteModalComponent,
    ToastModule,
    DatePipe,
  ],
  templateUrl: './quotes-requests.component.html',
  styleUrl: './quotes-requests.component.css',
  providers: [MessageService],
})
export class QuotesRequestsComponent {
  private quoteService = inject(QuotesService);
  private messageService = inject(MessageService);

  quotesResponse: PaginatedResponse<IRequestForQuote> | null = null;
  quotesLoading = true;
  first = 0;
  multiSortMeta: SortMeta[] = [{ field: 'date', order: -1 }];
  currentRequestOptions!: RequestOptions;

  //create quote modal variables
  createQuoteModalVisible = signal<boolean>(false);
  beingQuotedQuoteRequest!: IRequestForQuote;
  creatingQuote = false;

  loadQuoteRequests(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.quotesLoading = true;
    this.quoteService.getCurrentSellerQuoteRequest(requestOptions).subscribe({
      next: (response: PaginatedResponse<IRequestForQuote>) => {
        this.quotesResponse = response;
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
      filterableColumn: false,
    },
    {
      field: 'buyer.company.name',
      header: 'Company Name',
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'product.name',
      header: 'Product',
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'date',
      header: 'Date',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'date',
    },
    {
      field: 'status',
      header: 'Status',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'select',
      options: ['new', 'pending', 'approved', 'canceled', 'rejected'],
    },
    { field: 'actions', header: 'Actions', filterableColumn: false, filterType: 'clear' },
  ];

  getStatusSeverity(status: string): 'warn' | 'success' | 'danger' | 'secondary' | 'info' {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warn';
      case 'quoted':
      case 'seen':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  // open create quote modal
  openCreateQuoteModal(quoteRequest: IRequestForQuote) {
    this.beingQuotedQuoteRequest = quoteRequest;
    this.createQuoteModalVisible.set(true);
  }
  // create quote, then close modal, then reload quotes
  CreateQuote(event: Partial<CreateQuoteDto>) {
    this.creatingQuote = true;
    this.quoteService.createQuote(event as CreateQuoteDto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quote sent successfully',
          life: 5000,
        });
        this.quoteService
          .updateQuoteRequestStatus({
            id: this.beingQuotedQuoteRequest.id,
            status: 'Quoted',
          })
          .subscribe({
            next: () => {
              this.beingQuotedQuoteRequest.status = 'Quoted';
            },
            error: () => {
              this.showError("Couldn't mark quote request as quoted");
            },
          });
        this.creatingQuote = false;
        this.createQuoteModalVisible.set(false);
      },
      error: () => {
        this.showError("Couldn't send quote");
        this.creatingQuote = false;
      },
    });
  }

  markQuoteRequestAsSeen(quoteRequest: IRequestForQuote) {
    this.quoteService.updateQuoteRequestStatus({ id: quoteRequest.id, status: 'seen' }).subscribe({
      next: () => {
        quoteRequest.status = 'seen';
      },
      error: () => {
        this.showError("Couldn't mark quote request as seen");
      },
    });
  }
  markQuoteRequestAsRejected(quoteRequest: IRequestForQuote) {
    this.quoteService
      .updateQuoteRequestStatus({ id: quoteRequest.id, status: 'rejected' })
      .subscribe({
        next: () => {
          quoteRequest.status = 'rejected';
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: "Couldn't mark quote request as rejected",
            life: 5000,
          });
        },
      });
  }
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
}

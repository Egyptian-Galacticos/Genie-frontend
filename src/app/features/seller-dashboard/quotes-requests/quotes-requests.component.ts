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
import { StatusUtils } from '../../shared/utils/status-utils';
import { RfqDetailsDialogComponent } from '../../shared/rfq-details-dialog/rfq-details-dialog.component';

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
    ToastModule,
    DatePipe,
    RfqDetailsDialogComponent,
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
  RfqDetailsVisible = signal<boolean>(false);
  selectedRfq: IRequestForQuote | null = null;
  rfqDetailsDialogVisible = signal<boolean>(false);

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
    return StatusUtils.getStatusSeverity(status);
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
        this.creatingQuote = false;
        this.createQuoteModalVisible.set(false);
        this.beingQuotedQuoteRequest.status = 'Quoted';
      },
      error: () => {
        this.showError("Couldn't send quote");
        // this.showError("Couldn't mark quote request as quoted");
        this.creatingQuote = false;
      },
    });
  }

  markQuoteRequestAsSeen(quoteRequest: IRequestForQuote) {
    this.quoteService.updateQuoteRequestStatus({ id: quoteRequest.id, status: 'Seen' }).subscribe({
      next: () => {
        quoteRequest.status = 'Seen';
      },
      error: () => {
        this.showError("Couldn't mark quote request as Seen");
      },
    });
  }
  markQuoteRequestAsRejected(quoteRequest: IRequestForQuote) {
    this.quoteService
      .updateQuoteRequestStatus({ id: quoteRequest.id, status: 'Rejected' })
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
  viewDetails(quoteRequest: IRequestForQuote) {
    this.selectedRfq = quoteRequest;
    this.rfqDetailsDialogVisible.set(true);
  }

  // Handle RFQ dialog actions
  onRfqChat(rfq: IRequestForQuote) {
    console.log('Opening chat for RFQ:', rfq.id);
    // Implement chat functionality
  }

  onRfqQuote(rfq: IRequestForQuote) {
    this.openCreateQuoteModal(rfq);
    this.rfqDetailsDialogVisible.set(false);
  }

  onRfqMarkAsSeen(rfq: IRequestForQuote) {
    this.markQuoteRequestAsSeen(rfq);
    this.rfqDetailsDialogVisible.set(false);
  }

  onRfqReject(rfq: IRequestForQuote) {
    this.markQuoteRequestAsRejected(rfq);
    this.rfqDetailsDialogVisible.set(false);
  }

  closeRfqDetailsDialog() {
    this.rfqDetailsDialogVisible.set(false);
    this.selectedRfq = null;
  }
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
}

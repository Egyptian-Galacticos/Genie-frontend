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
      },
      error: error => {
        console.log(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Couldn't load quotes",
          life: 5000,
        });
        this.quotesResponse = {
          success: false,
          data: this.quotesPlaceholder,
          pagination: {
            page: 1,
            limit: 10,
            total: 6,
            totalPages: 1,
          },
        };
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

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'new':
        return 'info';
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'canceled':
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  }

  // open create quote modal
  openCreateQuoteModal(quoteRequest: IRequestForQuote) {
    console.log(quoteRequest, this.createQuoteModalVisible());
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
        this.loadQuoteRequests(this.currentRequestOptions);
        this.creatingQuote = false;
        this.createQuoteModalVisible.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Couldn't send quote",
          life: 5000,
        });
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Couldn't mark quote request as seen",
          life: 5000,
        });
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
  quotesPlaceholder = [
    {
      id: '1',
      quote: 'Quote 1',
      status: 'canceled',
      date: '2023-01-02',
      buyer: {
        id: '1',
        user_id: '1',
        name: 'Buyer 1',
        logo: 'https://via.placeholder.com/150',
        description: 'Description 1',
        website: 'https://example.com',
        email: 'q9l5M@example.com',
        tax_id: '123456789',
        company_phone: '123456789',
        commercial_registration: '123456789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: '12345',
        },
      },
      product: {
        id: '1',
        name: 'Product 1',
      },
    },
    {
      id: '2',
      quote: 'Quote 2',
      status: 'New',
      date: '2023-01-05',
      buyer: {
        id: '1',
        user_id: '1',
        name: 'Buyer 1',
        logo: 'https://via.placeholder.com/150',
        description: 'Description 1',
        website: 'https://example.com',
        email: 'q9l5M@example.com',
        tax_id: '123456789',
        company_phone: '123456789',
        commercial_registration: '123456789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: '12345',
        },
      },
      product: {
        id: '2',
        name: 'Product 2',
      },
    },
    {
      id: '3',
      quote: 'Quote 3',
      status: 'New',
      date: '2023-01-04',
      buyer: {
        id: '1',
        user_id: '1',
        name: 'Buyer 1',
        logo: 'https://via.placeholder.com/150',
        description: 'Description 1',
        website: 'https://example.com',
        email: 'q9l5M@example.com',
        tax_id: '123456789',
        company_phone: '123456789',
        commercial_registration: '123456789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: '12345',
        },
      },
      product: {
        id: '3',
        name: 'Product 3',
      },
    },
    {
      id: '4',
      quote: 'Quote 4',
      status: 'New',
      date: '2023-01-10',
      buyer: {
        id: '1',
        user_id: '1',
        name: 'Buyer 1',
        logo: 'https://via.placeholder.com/150',
        description: 'Description 1',
        website: 'https://example.com',
        email: 'q9l5M@example.com',
        tax_id: '123456789',
        company_phone: '123456789',
        commercial_registration: '123456789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: '12345',
        },
      },
      product: {
        id: '4',
        name: 'Product 4',
      },
    },
    {
      id: '5',
      quote: 'Quote 5',
      status: 'New',
      date: '2023-01-09',
      buyer: {
        id: '1',
        user_id: '1',
        name: 'Buyer 1',
        logo: 'https://via.placeholder.com/150',
        description: 'Description 1',
        website: 'https://example.com',
        email: 'q9l5M@example.com',
        tax_id: '123456789',
        company_phone: '123456789',
        commercial_registration: '123456789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: '12345',
        },
      },
      product: {
        id: '5',
        name: 'Product 5',
      },
    },
    {
      id: '6',
      quote: 'Quote 6',
      status: 'New',
      date: '2023-01-08',
      buyer: {
        id: '1',
        user_id: '1',
        name: 'Buyer 1',
        logo: 'https://via.placeholder.com/150',
        description: 'Description 1',
        website: 'https://example.com',
        email: 'q9l5M@example.com',
        tax_id: '123456789',
        company_phone: '123456789',
        commercial_registration: '123456789',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          country: 'USA',
          zip_code: '12345',
        },
      },
      product: {
        id: '6',
        name: 'Product 6',
      },
    },
  ];
}

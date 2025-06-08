import { RequestOptions } from '../../../core/interfaces/api.interface';
import { ApiService } from '../../../core/services/api.service';
import { Component, inject, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardInfoCardComponent } from '../../shared/dashboard-info-card/dashboard-info-card.component';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SortMeta } from 'primeng/api';
import { IRequestForQuote } from '../../shared/utils/interfaces';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/data-table/data-table.component';

interface QuotesResponse {
  data: IRequestForQuote[];
  totalRecords: number;
  page: number;
  size: number;
}

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
  ],
  templateUrl: './quotes-requests.component.html',
  styleUrl: './quotes-requests.component.css',
})
export class QuotesRequestsComponent implements OnInit {
  quotes: IRequestForQuote[] = [];
  quotesLoading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  multiSortMeta: SortMeta[] = [{ field: 'date', order: -1 }];

  private apiService = inject(ApiService);
  ngOnInit() {
    this.quotesLoading = true;
  }

  loadQuotes(requestOptions: RequestOptions) {
    console.log('event', requestOptions);
    this.quotesLoading = true;

    this.getQuotesFromBackend(requestOptions).subscribe({
      next: (response: QuotesResponse) => {
        this.quotes = response.data;
        this.totalRecords = response.totalRecords;
        this.quotesLoading = false;
      },
      error: error => {
        console.error('Error loading quotes:', error);
        this.quotesLoading = false;
        //don't forget to display an error message in Toast
      },
    });
  }

  private getQuotesFromBackend(options: RequestOptions): Observable<QuotesResponse> {
    console.log('Loading quotes with query params:', options);
    // return this.apiService.get<QuotesResponse>('quotes', options);
    return of({
      data: this.quotesPlaceholder,
      totalRecords: 0,
      page: 1,
      size: 10,
    });
  }
  cols = [
    {
      field: 'id',
      header: 'ID',
      filterableColumn: false,
    },
    {
      field: 'buyer.name',
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

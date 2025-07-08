import { Component, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerQuotesService } from '../../../shared/services/buyer-quotes.service';
import { IBuyerRequestForQuote, IBuyerMedia, IBuyerProduct, IBuyerCompany, IBuyerUser } from '../../../shared/utils/buyer-interfaces';
import { dataTableColumn } from '../../../shared/utils/interfaces';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { DashboardInfoCardComponent } from './../../../shared/dashboard-info-card/dashboard-info-card.component';
import { RequestOptions, ApiResponse } from '../../../../core/interfaces/api.interface';
import { SortMeta, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { StatusUtils } from '../../../shared/utils/status-utils';

@Component({
  selector: 'app-buyer-quotes-requests',
  imports: [
  CommonModule,
    DataTableComponent,
    DashboardInfoCardComponent,
    ToastModule,
    ButtonModule,
    BadgeModule,
    DialogModule,
    TagModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './quotes-requests.component.html',
  styleUrl: './quotes-requests.component.css',
})
export class BuyerQuotesRequestsComponent implements OnInit {
  @ViewChild('customBodyTemplate', { static: true }) customBodyTemplate!: TemplateRef<unknown>;
  private quotesService = inject(BuyerQuotesService);
  private messageService = inject(MessageService);
  rfqResponse: ApiResponse<IBuyerRequestForQuote[]> | null = null;
  rfqData: IBuyerRequestForQuote[] = [];
  loading = false;
  first = 0;
  multiSortMeta: SortMeta[] = [{ field: 'date', order: -1 }];
  rows = 10;
  totalRecords = 0;

  showRFQDetailsModal = false;
  selectedRFQ: IBuyerRequestForQuote | null = null;
  cols: dataTableColumn[] = [
    {
      field: 'id',
      header: 'ID',
      sortableColumn: true,
      filterableColumn: false,
    },
    {
      field: 'seller.company.name',
      header: 'Company',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'initial_product.name',
      header: 'Product',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'initial_quantity',
      header: 'Quantity',
      sortableColumn: true,
      filterableColumn: false,
    },
    {
      field: 'status',
      header: 'Status',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'select',
      options: ['Pending', 'In Progress', 'Seen', 'Quoted'],
    },
    {
      field: 'date',
      header: 'Date Created',
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

  ngOnInit() {
    this.loadRFQs({
      params: {
        page: 1,
        per_page: this.rows,
      },
    });
  }

  loadRFQs(requestOptions: RequestOptions) {
    this.loading = true;
    this.quotesService.getBuyerRFQs(requestOptions).subscribe({
      next: (response: ApiResponse<IBuyerRequestForQuote[]>) => {
        this.rfqResponse = response;
        this.rfqData = response.data || [];
        this.totalRecords = (response as { meta?: { total?: number } }).meta?.total || 0;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load quote requests',
          life: 5000,
        });
        this.loading = false;
      },
    });
  }
  createNewRFQ() {}
  viewRFQ(rfq: IBuyerRequestForQuote) {
    this.selectedRFQ = rfq;
    this.showRFQDetailsModal = true;
  }

  viewQuotes(): void {}

  closeRFQDetailsModal() {
    this.showRFQDetailsModal = false;
    this.selectedRFQ = null;
  }

  formatCurrency(amount: string | number | undefined, currency: string): string {
    if (amount === undefined || amount === null) {
      return 'N/A';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(numAmount);
  }
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/placeholder-image.jpg';
    }
  }

  /**
   * Retrieves the main product image from the product data
   * Uses main_image first, then falls back to first image in images array
   */
  getMainImage(product: IBuyerProduct): string {
    if (product.main_image?.url) {
      return product.main_image.url;
    } else if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return 'assets/placeholder-image.jpg';
  }

  /**
   * Gets the thumbnail URL for the main product image
   */
  getThumbnailImage(product: IBuyerProduct): string {
    if (product.main_image?.thumbnail_url) {
      return product.main_image.thumbnail_url;
    } else if (product.images && product.images.length > 0 && product.images[0].thumbnail_url) {
      return product.images[0].thumbnail_url;
    }
    return this.getMainImage(product);
  }

  acceptQuote(quote: { id: string | number; status?: string }) {
    if (!quote?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid quote ID',
        life: 5000,
      });
      return;
    }

    const quoteId = typeof quote.id === 'string' ? parseInt(quote.id, 10) : quote.id;
    this.quotesService.acceptQuote(quoteId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quote accepted successfully',
          life: 5000,
        });
        if (this.selectedRFQ?.quotes) {
          const quoteIndex = this.selectedRFQ.quotes.findIndex(q => q.id === quote.id);
          if (quoteIndex !== -1) {
            this.selectedRFQ.quotes[quoteIndex].status = 'accepted';
          }
        }

        this.loadRFQs({
          params: {
            page: Math.floor(this.first / this.rows) + 1,
            per_page: this.rows,
          },
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not accept quote. Please try again.',
          life: 5000,
        });
      },
    });
  }

  rejectQuote(quote: { id: string | number; status?: string }) {
    if (!quote?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid quote ID',
        life: 5000,
      });
      return;
    }

    const quoteId = typeof quote.id === 'string' ? parseInt(quote.id, 10) : quote.id;
    this.quotesService.rejectQuote(quoteId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quote rejected successfully',
          life: 5000,
        });

        if (this.selectedRFQ?.quotes) {
          const quoteIndex = this.selectedRFQ.quotes.findIndex(q => q.id === quote.id);
          if (quoteIndex !== -1) {
            this.selectedRFQ.quotes[quoteIndex].status = 'rejected';
          }
        }
        this.loadRFQs({
          params: {
            page: Math.floor(this.first / this.rows) + 1,
            per_page: this.rows,
          },
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not reject quote. Please try again.',
          life: 5000,
        });
      },
    });
  }

  /**
   * Determines if a quote can be accepted based on its current status
   * Only quotes with 'pending' or 'submitted' status can be accepted
   */
  canAcceptQuote(quote: { status?: string }): boolean {
    return quote?.status ? ['pending', 'submitted'].includes(quote.status.toLowerCase()) : false;
  }

  /**
   * Determines if a quote can be rejected based on its current status
   * Quotes with 'pending', 'submitted', or 'accepted' status can be rejected
   */
  canRejectQuote(quote: { status?: string }): boolean {
    return quote?.status
      ? ['pending', 'submitted', 'accepted'].includes(quote.status.toLowerCase())
      : false;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    return StatusUtils.getStatusSeverity(status);
  }

  getStatusColor(status: string): string {
    return StatusUtils.getStatusColor(status);
  }

  getStatusTextColor(status: string): string {
    return StatusUtils.getStatusTextColor(status);
  }

  getPendingCount(): number {
    return this.rfqData.filter(rfq => rfq.status?.toLowerCase() === 'pending').length;
  }

  getInProgressCount(): number {
    return this.rfqData.filter(rfq => rfq.status?.toLowerCase() === 'in progress').length;
  }

  getQuotedCount(): number {
    return this.rfqData.filter(rfq => rfq.status?.toLowerCase() === 'quoted').length;
  }

  getSellerStatus(status: string | undefined): string {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Attempts to get the most recent date from various possible date fields in order of preference:
   * updated_at > created_at > date
   */
  getQuoteUpdatedDate(quote: { updated_at?: string; created_at?: string; date?: string }): string {
    if (quote.updated_at && quote.updated_at !== null && quote.updated_at !== '') {
      return quote.updated_at;
    } else if (quote.created_at && quote.created_at !== null && quote.created_at !== '') {
      return quote.created_at;
    } else if (quote.date && quote.date !== null && quote.date !== '') {
      return quote.date;
    }
    return '';
  }

  /**
   * Formats address object or string into a readable comma-separated string
   * Handles both string and object address formats
   */
  formatAddress(
    address:
      | string
      | { street?: string; city?: string; state?: string; country?: string; postal_code?: string }
      | null
      | undefined
  ): string {
    if (!address) {
      return 'N/A';
    }

    if (typeof address === 'string') {
      return address;
    }

    const addressParts = [];
    if (address.street) addressParts.push(address.street);
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.country) addressParts.push(address.country);
    if (address.postal_code) addressParts.push(address.postal_code);

    return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
  }

  /**
   * Formats company address specifically for the updated IBuyerCompany interface
   */
  formatCompanyAddress(company: IBuyerCompany): string {
    if (!company.address) {
      return 'N/A';
    }
    return this.formatAddress(company.address);
  }

  /**
   * Safely gets company phone number
   */
  getCompanyPhone(company: IBuyerCompany): string {
    return company.company_phone || 'N/A';
  }

  /**
   * Safely gets company tax ID
   */
  getCompanyTaxId(company: IBuyerCompany): string {
    return company.tax_id || 'N/A';
  }

  /**
   * Formats boolean values for display
   */
  formatBoolean(value: boolean | undefined): string {
    return value ? 'Yes' : 'No';
  }

  /**
   * Gets the company email or falls back to user email
   */
  getContactEmail(seller: IBuyerUser): string {
    return seller.company.email || seller.email || 'N/A';
  }
}

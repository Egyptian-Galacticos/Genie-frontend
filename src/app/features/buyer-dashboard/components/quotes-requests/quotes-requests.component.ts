import { Component, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dataTableColumn, IRequestForQuote } from '../../../shared/utils/interfaces';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { DashboardInfoCardComponent } from '../../../shared/dashboard-info-card/dashboard-info-card.component';
import { RequestOptions, ApiResponse } from '../../../../core/interfaces/api.interface';
import { SortMeta, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { StatusUtils } from '../../../shared/utils/status-utils';
import { QuotesService } from '../../../shared/services/quotes.service';
import { RfqDetailsDialogComponent } from '../../../shared/rfq-details-dialog/rfq-details-dialog.component';

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
    RfqDetailsDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './quotes-requests.component.html',
  styleUrl: './quotes-requests.component.css',
})
export class BuyerQuotesRequestsComponent implements OnInit {
  @ViewChild('customBodyTemplate', { static: true }) customBodyTemplate!: TemplateRef<unknown>;
  private quotesService = inject(QuotesService);
  private messageService = inject(MessageService);
  rfqResponse: ApiResponse<IRequestForQuote[]> | null = null;
  rfqData: IRequestForQuote[] = [];
  loading = false;
  first = 0;
  multiSortMeta: SortMeta[] = [{ field: 'date', order: -1 }];
  rows = 10;
  totalRecords = 0;

  showRFQDetailsModal = false;
  selectedRFQ: IRequestForQuote | null = null;
  rfqDetailsDialogVisible = false;
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
      next: (response: ApiResponse<IRequestForQuote[]>) => {
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
  viewRFQ(rfq: IRequestForQuote) {
    this.selectedRFQ = rfq;
    this.rfqDetailsDialogVisible = true;
  }

  closeRFQDetailsDialog() {
    this.rfqDetailsDialogVisible = false;
    this.selectedRFQ = null;
  }

  // Handle RFQ dialog actions
  onRfqChat(rfq: IRequestForQuote) {
    console.log('Opening chat for RFQ:', rfq.id);
    // Implement chat functionality
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
    if (target && !target.dataset['errorHandled']) {
      target.dataset['errorHandled'] = 'true';
      target.src = 'assets/placeholder-image.jpg';
    }
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
      | { street?: string; city?: string; state?: string; country?: string; zip_code?: string }
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
    if (address.zip_code) addressParts.push(address.zip_code);

    return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
  }
}

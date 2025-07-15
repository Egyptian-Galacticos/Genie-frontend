import { Component, OnInit, inject, TemplateRef, ViewChild, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dataTableColumn, IQuote, IQuoteItem } from '../../../shared/utils/interfaces';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { DashboardInfoCardComponent } from './../../../shared/dashboard-info-card/dashboard-info-card.component';
import { RequestOptions, PaginatedResponse } from '../../../../core/interfaces/api.interface';
import { SortMeta, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { StatusUtils } from '../../../shared/utils/status-utils';
import { QuotesService } from '../../../shared/services/quotes.service';
import { QuoteDetailsDialogComponent } from '../../../shared/quote-details-dialog/quote-details-dialog.component';
import { Router } from '@angular/router';
import { ChatService } from '../../../chat/services/chat.service';
import { ContractDialogComponent } from '../../../shared/contract-dialog/contract-dialog.component';

@Component({
  selector: 'app-buyer-quotes-responses',
  imports: [
    CommonModule,
    DataTableComponent,
    DashboardInfoCardComponent,
    ToastModule,
    ButtonModule,
    BadgeModule,
    DialogModule,
    TableModule,
    QuoteDetailsDialogComponent,
    ContractDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './quotes-responses.component.html',
  styleUrl: './quotes-responses.component.css',
})
export class BuyerQuotesResponsesComponent implements OnInit {
  @ViewChild('customBodyTemplate', { static: true }) customBodyTemplate!: TemplateRef<unknown>;

  private readonly quotesService = inject(QuotesService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  quotesData: IQuote[] = [];
  loading = false;
  selectedStatus = 'all';
  multiSortMeta: SortMeta[] = [];
  totalRecords = 0;

  quoteDetailsVisible = model<boolean>(false);
  selectedQuote: IQuote | null = null;

  cols: dataTableColumn[] = [
    {
      field: 'id',
      header: 'ID',
      sortableColumn: true,
      filterableColumn: false,
    },
    {
      field: 'seller.full_name',
      header: 'Seller',
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

  ngOnInit() {
    this.multiSortMeta = [{ field: 'created_at', order: -1 }];

    const initialRequestOptions: RequestOptions = {
      params: {
        page: 1,
        size: 10,
        sort: 'created_at',
        order: 'desc',
      },
    };
    this.loadQuotesData(initialRequestOptions);
  }

  loadQuotesData(requestOptions: RequestOptions) {
    this.loading = true;

    this.quotesService.getBuyerQuotes(requestOptions).subscribe({
      next: (response: PaginatedResponse<IQuote>) => {
        this.quotesData = response.data || [];
        this.totalRecords = response.meta?.total || 0;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load quote responses. Please try again.',
          life: 5000,
        });
        this.quotesData = [];
        this.totalRecords = 0;
        this.loading = false;
      },
    });
  }

  getPendingCount(): number {
    return this.quotesData.filter(
      quote => quote.status?.toLowerCase() === 'pending' || quote.status?.toLowerCase() === 'sent'
    ).length;
  }

  getAcceptedCount(): number {
    return this.quotesData.filter(quote => quote.status?.toLowerCase() === 'accepted').length;
  }

  getRejectedCount(): number {
    return this.quotesData.filter(quote => quote.status?.toLowerCase() === 'rejected').length;
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
  }

  calculateTotal(items: IQuoteItem[]): number {
    if (!items?.length) return 0;
    return items.reduce((total, item) => {
      const unitPrice = parseFloat(item.unit_price?.toString() || '0');
      const quantity = item.quantity || 0;
      const totalPrice = parseFloat(item.total_price?.toString() || '0');
      return total + (totalPrice || unitPrice * quantity);
    }, 0);
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

  viewQuoteDetails(quote: IQuote) {
    this.selectedQuote = {
      ...quote,
      total_amount:
        quote.total_amount ||
        (quote.total_price ? parseFloat(quote.total_price.toString()) : 0) ||
        this.calculateQuoteTotal(quote.items || []),
    };
    console.log('Viewing quote details:', this.selectedQuote);
    this.quoteDetailsVisible.set(true);
  }

  calculateQuoteTotal(items: IQuoteItem[]): number {
    if (!items?.length) return 0;
    return items.reduce((total, item) => {
      const unitPrice = parseFloat(item.unit_price?.toString() || '0');
      const quantity = item.quantity || 0;
      const subtotal =
        parseFloat(item.subtotal?.toString() || '0') ||
        parseFloat(item.total_price?.toString() || '0') ||
        unitPrice * quantity;
      return total + subtotal;
    }, 0);
  }

  acceptQuote(quote: IQuote) {
    this.quotesService.acceptQuote(quote.id).subscribe({
      next: () => {
        const index = this.quotesData.findIndex(q => q.id === quote.id);
        if (index !== -1) {
          this.quotesData[index].status = 'accepted';
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Quote Accepted',
          detail: `Quote #${quote.id} has been accepted successfully`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to accept quote. Please try again.',
          life: 5000,
        });
      },
    });
  }

  rejectQuote(quote: IQuote) {
    this.quotesService.rejectQuote(quote.id).subscribe({
      next: () => {
        const index = this.quotesData.findIndex(q => q.id === quote.id);
        if (index !== -1) {
          this.quotesData[index].status = 'rejected';
        }

        this.messageService.add({
          severity: 'warn',
          summary: 'Quote Rejected',
          detail: `Quote #${quote.id} has been rejected`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reject quote. Please try again.',
          life: 5000,
        });
      },
    });
  }

  hasRFQInformation(rfq: {
    initial_quantity?: number;
    shipping_country?: string;
    status?: string;
    buyer_message?: string | null;
  }): boolean {
    return (
      !!rfq && !!(rfq.initial_quantity || rfq.shipping_country || rfq.status || rfq.buyer_message)
    );
  }

  openChat(quote: IQuote) {
    if (!quote.seller || !quote.seller.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Seller information is missing for this quote.',
        life: 5000,
      });
      return;
    }
    this.chatService.startConversation(quote.seller.id).subscribe({
      next: conversation => {
        this.router.navigate(['/dashboard/buyer/chat'], { queryParams: { id: conversation.id } });
      },
    });
  }
}

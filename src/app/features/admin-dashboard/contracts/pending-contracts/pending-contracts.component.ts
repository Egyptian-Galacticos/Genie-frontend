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
  selector: 'app-pending-contracts',
  templateUrl: './pending-contracts.component.html',
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
export class PendingContractsComponent {
  contractService = inject(ContractService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  quoteService = inject(QuotesService);

  pendingContracts = model<Contract[]>([]);
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

  // Fetch pending contracts from the service
  getPendingContracts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    requestOptions.params = {
      ...requestOptions.params,
      filter_status_0: 'pending_payment_confirmation,verify_shipment_url,delivered',
      filter_status_0_mode: 'in',
    };
    this.loading.set(true);

    this.contractService.getContractsForAdmin(requestOptions).subscribe({
      next: (response: PaginatedResponse<Contract>) => {
        console.log('Fetching pending contracts with options:', requestOptions);
        this.pendingContracts.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('Pending contracts fetched successfully:', this.pendingContracts());
      },
      error: (error: Error) => {
        console.error('Error fetching pending contracts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch pending contracts. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  approvePayment(contractId: number) {
    this.contractService.approveBuyerPayment(contractId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Payment Approved',
          detail: 'The payment has been successfully approved.',
        });
        // Refresh the pending contracts list after approval
        this.getPendingContracts(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error approving contract:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: 'Failed to approve the contract. Please try again later.',
        });
      },
    });
  }
  rejectPayment(contract: Contract): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to reject the contract "${contract.id}"?`,
      header: 'Reject Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contractService.rejectBuyerPayment(contract.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Contract Rejected',
              detail: 'The contract has been successfully rejected.',
            });
            // Refresh the pending contracts list after rejection
            this.getPendingContracts(this.currentRequestOptions);
          },
          error: (error: Error) => {
            console.error('Error rejecting contract:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Rejection Failed',
              detail: 'Failed to reject the contract. Please try again later.',
            });
          },
        });
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  approveShipment(contractId: number) {
    this.contractService.approveShipmentUrl(contractId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Shipment Approved',
          detail: 'The shipment URL has been successfully approved.',
        });
        // Refresh the pending contracts list after approval
        this.getPendingContracts(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error approving shipment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Shipment Approval Failed',
          detail: 'Failed to approve the shipment. Please try again later.',
        });
      },
    });
  }

  rejectShipment(contract: Contract): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to reject the shipment URL for contract "${contract.contract_number}"?`,
      header: 'Reject Shipment Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contractService.rejectShipmentUrl(contract.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Shipment Rejected',
              detail: 'The shipment URL has been rejected and sent back for revision.',
            });
            // Refresh the pending contracts list after rejection
            this.getPendingContracts(this.currentRequestOptions);
          },
          error: (error: Error) => {
            console.error('Error rejecting shipment:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Shipment Rejection Failed',
              detail: 'Failed to reject the shipment. Please try again later.',
            });
          },
        });
      },
      reject: () => {
        // User cancelled - no action needed
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

  submitSellerPayment(contract: Contract, transactionId: string): void {
    if (!transactionId || transactionId.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Transaction Number Required',
        detail: 'Please provide a valid transaction number.',
        life: 5000,
      });
      return;
    }

    // Validate transaction number format (10-25 alphanumeric characters)
    const transactionRegex = /\b[A-Z0-9]{10,25}\b/;
    if (!transactionRegex.test(transactionId.trim())) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Transaction Number',
        detail: 'Transaction number must be 10-25 alphanumeric characters (A-Z, 0-9).',
        life: 5000,
      });
      return;
    }

    this.contractService.addSellerTrxNo(contract.id, transactionId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Payment Submitted',
          detail: `Seller payment for contract #${contract.contract_number} has been submitted successfully`,
          life: 3000,
        });
        this.getPendingContracts(this.currentRequestOptions);
        this.contractModalVisible.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit payment. Please try again.',
          life: 5000,
        });
      },
    });
  }

  onSellerPaymentSubmit(event: { contract: Contract; transactionId: string }): void {
    this.submitSellerPayment(event.contract, event.transactionId);
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status?.toLowerCase()) {
      case 'pending_payment_confirmation':
        return 'warn';
      case 'verify_shipment_url':
        return 'info';
      case 'delivered':
        return 'success';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending_payment_confirmation':
        return 'Payment Verification';
      case 'verify_shipment_url':
        return 'Shipment Verification';
      case 'shipped':
        return 'Shipped';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  }
  cols = [
    { field: 'contract_number', header: 'Contract' },
    { field: 'seller.company.name', header: 'Seller', sortable: true, filterable: true },
    { field: 'buyer.company.name', header: 'Buyer', sortable: true, filterable: true },
    { field: 'quote.id', header: 'Quote', sortable: true, filterable: true },
    { field: 'status', header: 'Status' },
    { field: 'created_at', header: 'Creation Date', sortable: true },
    { field: 'actions', header: 'Actions' },
  ];
}

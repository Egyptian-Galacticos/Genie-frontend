import { ContractService } from '../../../shared/services/contract.service';
import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Contract } from '../../../shared/utils/interfaces';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import { RequestOptions, PaginatedResponse } from '../../../../core/interfaces/api.interface';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeModule } from 'primeng/badge';
import { ContractDetailsDialogComponent } from '../../../shared/contract-details-dialog/contract-details-dialog.component';

@Component({
  selector: 'app-buyer-all-contracts',
  templateUrl: './all-contracts.component.html',
  imports: [
    DataTableComponent,
    ButtonModule,
    DatePipe,
    ToastModule,
    ConfirmDialogModule,
    TitleCasePipe,
    CurrencyPipe,
    BadgeModule,
    ContractDetailsDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class BuyerAllContractsComponent {
  contractService = inject(ContractService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  allContracts = model<Contract[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  // Contract details modal
  contractDetailsVisible = signal<boolean>(false);
  selectedContract = signal<Contract | null>(null);

  // Fetch all contracts from the service
  getAllContracts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);

    this.contractService.getContractsForBuyer(requestOptions).subscribe({
      next: (response: PaginatedResponse<Contract>) => {
        this.allContracts.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('All buyer contracts fetched successfully:', this.allContracts());
      },
      error: (error: Error) => {
        console.error('Error fetching all buyer contracts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch contracts. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  markAsDelivered(contractId: number) {
    this.contractService.markAsDelivered(contractId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contract Delivered',
          detail: 'The contract has been marked as delivered.',
        });
        this.getAllContracts(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error marking contract as delivered:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Delivery Failed',
          detail: 'Failed to mark contract as delivered. Please try again later.',
        });
      },
    });
  }

  submitPayment(contract: Contract, paymentReference: string): void {
    if (!paymentReference || paymentReference.trim() === '') {
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
    if (!transactionRegex.test(paymentReference.trim())) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Transaction Number',
        detail: 'Transaction number must be 10-25 alphanumeric characters (A-Z, 0-9).',
        life: 5000,
      });
      return;
    }

    this.contractService.addBuyerTrxNo(contract.id, paymentReference).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Payment Submitted and will be verified',
          detail: `Payment for contract #${contract.id} has been submitted successfully`,
          life: 3000,
        });
        this.getAllContracts(this.currentRequestOptions);
        this.contractDetailsVisible.set(false);
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

  onPaymentSubmit(event: { contract: Contract; paymentReference: string }): void {
    this.submitPayment(event.contract, event.paymentReference);
  }

  confirmMarkAsDelivered(contract: Contract): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to mark contract "${contract.contract_number}" as delivered?`,
      header: 'Mark as Delivered Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.markAsDelivered(contract.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  canMarkAsDelivered(contract: Contract): boolean {
    return contract.status === 'shipped';
  }

  canMarkAsPendingPayment(contract: Contract): boolean {
    return contract.status === 'pending_payment' || contract.status === 'buyer_payment_rejected';
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'info';
      case 'shipped':
        return 'warn';
      case 'delivered':
        return 'success';
      case 'paid':
        return 'success';
      case 'completed':
        return 'success';
      case 'pending_payment':
        return 'warn';
      case 'buyer_payment_rejected':
        return 'danger';
      case 'pending_approval':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  viewContractDetails(contract: Contract) {
    this.selectedContract.set(contract);
    this.contractDetailsVisible.set(true);
  }

  approveContract(contract: Contract) {
    this.contractService.approveContract(contract.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contract Approved',
          detail: 'The contract has been successfully approved.',
        });
        this.getAllContracts(this.currentRequestOptions);
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

  canApproveContract(contract: Contract): boolean {
    return contract.status === 'pending_approval';
  }

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'contract_number', header: 'Contract Number', sortable: true, filterable: true },
    { field: 'seller.full_name', header: 'Seller', sortable: true, filterable: true },
    { field: 'total_amount', header: 'Amount', sortable: true },
    { field: 'currency', header: 'Currency' },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'contract_date', header: 'Contract Date', sortable: true },
    { field: 'estimated_delivery', header: 'Est. Delivery', sortable: true },
    { field: 'actions', header: 'Actions' },
  ];
}

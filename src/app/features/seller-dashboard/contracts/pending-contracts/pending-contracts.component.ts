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
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ContractDetailsDialogComponent } from '../../../shared/contract-details-dialog/contract-details-dialog.component';

@Component({
  selector: 'app-seller-pending-contracts',
  templateUrl: './pending-contracts.component.html',
  imports: [
    DataTableComponent,
    ButtonModule,
    DatePipe,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    TitleCasePipe,
    CurrencyPipe,
    BadgeModule,
    ContractDetailsDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class SellerPendingContractsComponent {
  contractService = inject(ContractService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  pendingContracts = model<Contract[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  // Shipment modal
  shipmentModalVisible = signal<boolean>(false);
  trackingLink = signal<string>('');
  selectedContractId = signal<number>(0);

  // URL validation
  isTrackingLinkValid = signal<boolean>(true);
  trackingLinkErrorMessage = signal<string>('');

  // Contract details modal
  contractDetailsVisible = signal<boolean>(false);
  selectedContract = signal<Contract | null>(null);

  // Fetch pending contracts from the service
  getPendingContracts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);

    // Filter for seller pending statuses: in_progress, delivered, paid
    requestOptions.params = {
      ...requestOptions.params,
      filter_status_0: 'in_progress,delivered_and_paid,',
      filter_status_0_mode: 'in',
    };

    this.contractService.getContractsForSeller(requestOptions).subscribe({
      next: (response: PaginatedResponse<Contract>) => {
        this.pendingContracts.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('Pending seller contracts fetched successfully:', this.pendingContracts());
      },
      error: (error: Error) => {
        console.error('Error fetching pending seller contracts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch pending contracts. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  showShipmentModal(contractId: number) {
    this.selectedContractId.set(contractId);
    this.trackingLink.set('');
    this.isTrackingLinkValid.set(true);
    this.trackingLinkErrorMessage.set('');
    this.shipmentModalVisible.set(true);
  }

  validateTrackingLink() {
    const link = this.trackingLink().trim();

    if (!link) {
      this.isTrackingLinkValid.set(false);
      this.trackingLinkErrorMessage.set('Tracking link is required');
      return;
    }

    try {
      new URL(link);
      this.isTrackingLinkValid.set(true);
      this.trackingLinkErrorMessage.set('');
    } catch (error) {
      this.isTrackingLinkValid.set(false);
      this.trackingLinkErrorMessage.set(
        'Please enter a valid URL (e.g., https://example.com/tracking/123)'
      );
    }
  }

  markAsShipped() {
    // Validate before submission
    this.validateTrackingLink();

    if (!this.isTrackingLinkValid()) {
      return;
    }

    this.contractService.markAsShipped(this.selectedContractId(), this.trackingLink()).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contract Shipped',
          detail: 'The contract has been marked as shipped.',
        });
        this.shipmentModalVisible.set(false);
        this.getPendingContracts(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error marking contract as shipped:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Shipment Failed',
          detail: 'Failed to mark contract as shipped. Please try again later.',
        });
      },
    });
  }

  markAsCompleted(contractId: number) {
    this.contractService.markAsCompleted(contractId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contract Completed',
          detail: 'The contract has been marked as completed.',
        });
        this.getPendingContracts(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error marking contract as completed:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Completion Failed',
          detail: 'Failed to mark contract as completed. Please try again later.',
        });
      },
    });
  }

  confirmMarkAsCompleted(contract: Contract): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to mark contract "${contract.contract_number}" as completed?`,
      header: 'Mark as Completed Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.markAsCompleted(contract.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  canMarkAsShipped(contract: Contract): boolean {
    return contract.status === 'in_progress';
  }

  canMarkAsCompleted(contract: Contract): boolean {
    return contract.status === 'delivered_and_paid' || contract.status === 'paid';
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'info';
      case 'shipped':
        return 'warn';
      case 'delivered_and_paid':
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

  onShipOrder(event: { contract: Contract; trackingUrl: string }): void {
    this.contractService.markAsShipped(event.contract.id, event.trackingUrl).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Order Shipped',
          detail: `Contract #${event.contract.contract_number} has been marked as shipped successfully`,
          life: 3000,
        });
        this.getPendingContracts(this.currentRequestOptions);
        this.contractDetailsVisible.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to ship order. Please try again.',
          life: 5000,
        });
      },
    });
  }

  onCompleteContract(contract: Contract): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to mark contract #${contract.id} as completed?`,
      header: 'Complete Contract',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.contractService.markAsCompleted(contract.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Contract Completed',
              detail: `Contract #${contract.id} has been marked as completed successfully.`,
              life: 3000,
            });
            this.getPendingContracts(this.currentRequestOptions);
            this.contractDetailsVisible.set(false);
          },
          error: error => {
            console.error('Error completing contract:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to complete contract. Please try again.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'contract_number', header: 'Contract Number', sortable: true, filterable: true },
    { field: 'buyer.full_name', header: 'Buyer', sortable: true, filterable: true },
    { field: 'total_amount', header: 'Amount', sortable: true },
    { field: 'currency', header: 'Currency' },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'contract_date', header: 'Contract Date', sortable: true },
    { field: 'estimated_delivery', header: 'Est. Delivery', sortable: true },
    { field: 'actions', header: 'Actions' },
  ];
}

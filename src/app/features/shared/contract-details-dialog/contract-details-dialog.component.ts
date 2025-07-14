import { Component, input, output, computed, model, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';

import { Contract, IUser, ContractItem } from '../utils/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contract-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    BadgeModule,
    TableModule,
    DividerModule,
    CardModule,
    AccordionModule,
    FieldsetModule,
    TagModule,
    ChipModule,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    TitleCasePipe,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './contract-details-dialog.component.html',
  styleUrls: ['./contract-details-dialog.component.scss'],
})
export class ContractDetailsDialogComponent {
  // Two-way binding for dialog visibility using model()
  visible = model<boolean>(false);

  // Input signals using input() function
  contract = input<Contract | null>(null);
  userType = input<'buyer' | 'seller' | 'admin'>('buyer');
  showActions = input<boolean>(true);
  allowEdit = input<boolean>(false);
  allowCancel = input<boolean>(false);
  allowApprove = input<boolean>(false);

  // Output signals using output() function
  edit = output<Contract>();
  cancelContract = output<Contract>();
  approve = output<Contract>();
  chat = output<Contract>();
  download = output<Contract>();
  paymentSubmit = output<{ contract: Contract; paymentReference: string }>();
  sellerPaymentSubmit = output<{ contract: Contract; transactionId: string }>();
  adminApprovePayment = output<Contract>();
  adminRejectPayment = output<Contract>();
  adminApproveShipment = output<Contract>();
  adminRejectShipment = output<Contract>();
  shipOrder = output<{ contract: Contract; trackingUrl: string }>();
  confirmDelivery = output<Contract>();
  completeContract = output<Contract>();
  dialogClose = output<void>();

  // Computed signals for derived values
  otherParty = computed<IUser | null>(() => {
    const currentContract = this.contract();
    if (!currentContract) return null;

    return this.userType() === 'buyer'
      ? currentContract.seller || null
      : currentContract.buyer || null;
  });

  contractItems = computed<ContractItem[]>(() => {
    const currentContract = this.contract();
    return currentContract?.items || [];
  });

  totalAmount = computed(() => {
    return this.contractItems().reduce((sum, item) => sum + item.total_price, 0);
  });

  statusSeverity = computed(() => {
    const status = this.contract()?.status?.toLowerCase();
    switch (status) {
      case 'pending':
        return 'warn';
      case 'approved':
      case 'active':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      case 'completed':
        return 'info';
      case 'draft':
        return 'secondary';
      default:
        return 'info';
    }
  });

  statusColor = computed(() => {
    const status = this.contract()?.status?.toLowerCase();
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
      case 'active':
        return '#10b981';
      case 'cancelled':
      case 'rejected':
        return '#ef4444';
      case 'completed':
        return '#3b82f6';
      case 'draft':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  });

  termsArray = computed(() => {
    const termsText = this.contract()?.terms_and_conditions;
    if (!termsText) return [];

    // Split by numbered points (1., 2., etc.) or newlines
    return termsText
      .split(/\n/)
      .map(term => term.trim())
      .filter(term => term.length > 0);
  });

  metadataEntries = computed(() => {
    const metadata = this.contract()?.metadata;
    if (!metadata) return [];

    return Object.entries(metadata).map(([key, value]) => ({ key, value }));
  });

  hasShippingAddress = computed(() => {
    const address = this.contract()?.shipping_address;
    return address && (address.street || address.city || address.country);
  });

  hasShippingInfo = computed(() => {
    const contract = this.contract();
    const address = contract?.shipping_address;
    const shipment_url = contract?.shipment_url;
    return (address && (address.street || address.city || address.country)) || shipment_url;
  });

  hasBillingAddress = computed(() => {
    const address = this.contract()?.billing_address;
    return address && (address.street || address.city || address.country);
  });

  addressesAreSame = computed(() => {
    const shipping = this.contract()?.shipping_address;
    const billing = this.contract()?.billing_address;

    if (!shipping || !billing) return false;

    return (
      shipping.street === billing.street &&
      shipping.city === billing.city &&
      shipping.state === billing.state &&
      shipping.country === billing.country &&
      shipping.zip_code === billing.zip_code
    );
  });

  deliveryStatus = computed(() => {
    const estimatedDelivery = this.contract()?.estimated_delivery;
    if (!estimatedDelivery) return null;

    const deliveryDate = new Date(estimatedDelivery);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'overdue',
        days: Math.abs(diffDays),
        text: `${Math.abs(diffDays)} days overdue`,
      };
    } else if (diffDays === 0) {
      return { status: 'today', days: 0, text: 'Due today' };
    } else if (diffDays <= 7) {
      return { status: 'soon', days: diffDays, text: `${diffDays} days remaining` };
    } else {
      return { status: 'future', days: diffDays, text: `${diffDays} days remaining` };
    }
  });

  onVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.dialogClose.emit();
    }
  }

  onEdit(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.edit.emit(currentContract);
    }
  }

  onCancel(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.cancelContract.emit(currentContract);
    }
  }

  onApprove(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.approve.emit(currentContract);
    }
  }

  onChat(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.chat.emit(currentContract);
    }
  }

  onDownload(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.download.emit(currentContract);
    }
  }

  formatAddress(
    address:
      | { street?: string; city?: string; state?: string; country?: string; zip_code?: string }
      | null
      | undefined
  ): string {
    if (!address) return 'Not provided';

    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.zip_code,
    ].filter(part => part && part.trim().length > 0);

    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  }

  getDeliveryStatusSeverity(
    status: string
  ): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'overdue':
        return 'danger';
      case 'today':
        return 'warn';
      case 'soon':
        return 'info';
      default:
        return 'success';
    }
  }
  // Payment reference signal
  paymentReference = signal<string>('');

  // Seller transaction ID signal for admin
  sellerTransactionId = signal<string>('');

  // Shipping URL signal for seller
  shippingUrl = signal<string>('');

  // Transaction number validation regex
  private transactionRegex = /\b[A-Z0-9]{10,25}\b/;

  validateTransactionNumber(transactionNumber: string): boolean {
    return this.transactionRegex.test(transactionNumber.trim());
  }

  isValidTransaction = computed(() => {
    const reference = this.paymentReference();
    return reference.trim() && this.validateTransactionNumber(reference);
  });

  isValidSellerTransaction = computed(() => {
    const transactionId = this.sellerTransactionId();
    return transactionId.trim() && this.validateTransactionNumber(transactionId);
  });

  isValidShippingUrl = computed(() => {
    const url = this.shippingUrl();
    return url.trim() && this.validateUrl(url);
  });

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Check if current user can approve contract
  canApproveContract = computed(() => {
    const contract = this.contract();
    return contract?.status === 'pending_approval' && this.userType() === 'buyer';
  });

  // Check if current user can submit payment
  canSubmitPayment = computed(() => {
    const contract = this.contract();
    return (
      (contract?.status === 'pending_payment' || contract?.status === 'buyer_payment_rejected') &&
      this.userType() === 'buyer'
    );
  });

  // Check if admin can submit seller payment
  canSubmitSellerPayment = computed(() => {
    const contract = this.contract();
    return contract?.status === 'delivered' && this.userType() === 'admin';
  });

  // Check if admin can approve/reject buyer payment
  canApproveRejectPayment = computed(() => {
    const contract = this.contract();
    return contract?.status === 'pending_payment_confirmation' && this.userType() === 'admin';
  });

  // Check if seller can ship the order
  canShipOrder = computed(() => {
    const contract = this.contract();
    return contract?.status === 'in_progress' && this.userType() === 'seller';
  });

  // Check if admin can approve/reject shipment
  canApproveRejectShipment = computed(() => {
    const contract = this.contract();
    return contract?.status === 'verify_shipment_url' && this.userType() === 'admin';
  });

  // Check if buyer can confirm delivery
  canConfirmDelivery = computed(() => {
    const contract = this.contract();
    return contract?.status === 'shipped' && this.userType() === 'buyer';
  });

  // Check if seller can complete the contract
  canCompleteContract = computed(() => {
    const contract = this.contract();
    return (
      (contract?.status === 'delivered_and_paid' || contract?.status === 'paid') &&
      this.userType() === 'seller'
    );
  });

  submitPayment(): void {
    const currentContract = this.contract();
    const reference = this.paymentReference();

    if (!currentContract) return;

    if (!reference.trim()) {
      console.warn('Payment reference is required');
      return;
    }

    if (!this.validateTransactionNumber(reference)) {
      console.warn('Invalid transaction number format. Must be 10-25 alphanumeric characters.');
      return;
    }

    this.paymentSubmit.emit({
      contract: currentContract,
      paymentReference: reference.trim(),
    });

    // Reset the payment reference after submission
    this.paymentReference.set('');
  }

  submitSellerPayment(): void {
    const currentContract = this.contract();
    const transactionId = this.sellerTransactionId();

    if (!currentContract) return;

    if (!transactionId.trim()) {
      console.warn('Seller transaction ID is required');
      return;
    }

    if (!this.validateTransactionNumber(transactionId)) {
      console.warn('Invalid transaction number format. Must be 10-25 alphanumeric characters.');
      return;
    }

    this.sellerPaymentSubmit.emit({
      contract: currentContract,
      transactionId: transactionId.trim(),
    });

    // Reset the seller transaction ID after submission
    this.sellerTransactionId.set('');
  }

  onAdminApprovePayment(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.adminApprovePayment.emit(currentContract);
    }
  }

  onAdminRejectPayment(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.adminRejectPayment.emit(currentContract);
    }
  }

  onShipOrder(): void {
    const currentContract = this.contract();
    const trackingUrl = this.shippingUrl();

    if (!currentContract) return;

    if (!trackingUrl.trim()) {
      console.warn('Shipping URL is required');
      return;
    }

    if (!this.validateUrl(trackingUrl)) {
      console.warn('Invalid URL format');
      return;
    }

    this.shipOrder.emit({
      contract: currentContract,
      trackingUrl: trackingUrl.trim(),
    });

    // Reset the shipping URL after submission
    this.shippingUrl.set('');
  }

  onAdminApproveShipment(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.adminApproveShipment.emit(currentContract);
    }
  }

  onAdminRejectShipment(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.adminRejectShipment.emit(currentContract);
    }
  }

  onConfirmDelivery(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.confirmDelivery.emit(currentContract);
    }
  }

  onCompleteContract(): void {
    const currentContract = this.contract();
    if (currentContract) {
      this.completeContract.emit(currentContract);
    }
  }
}

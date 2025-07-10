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

  submitPayment(): void {
    const currentContract = this.contract();
    const reference = this.paymentReference();

    if (currentContract && reference.trim()) {
      this.paymentSubmit.emit({
        contract: currentContract,
        paymentReference: reference.trim(),
      });

      // Reset the payment reference after submission
      this.paymentReference.set('');
    } else {
      console.warn('Payment reference is required');
    }
  }
}

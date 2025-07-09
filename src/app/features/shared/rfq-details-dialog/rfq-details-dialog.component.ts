import { Component, input, output, computed, model } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { IRequestForQuote, IUser, IProduct } from '../utils/interfaces';
import { StatusUtils } from '../utils/status-utils';

@Component({
  selector: 'app-rfq-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    BadgeModule,
    TableModule,
    DividerModule,
    TagModule,
    DatePipe,
    TitleCasePipe,
    DecimalPipe,
  ],
  templateUrl: './rfq-details-dialog.component.html',
})
export class RfqDetailsDialogComponent {
  // Two-way binding for dialog visibility using model()
  visible = model<boolean>(false);

  // Input signals using input() function
  rfq = input<IRequestForQuote | null>(null);
  userType = input<'buyer' | 'seller'>('buyer'); // Determines which perspective to show
  showActions = input<boolean>(true); // Whether to show action buttons
  allowChat = input<boolean>(true); // Whether to show chat button
  allowQuote = input<boolean>(true); // Whether to show quote button (for sellers)

  // Output signals using output() function
  chat = output<IRequestForQuote>();
  quote = output<IRequestForQuote>();
  markAsSeen = output<IRequestForQuote>();
  reject = output<IRequestForQuote>();
  dialogClose = output<void>();

  // Computed signals for derived values
  otherParty = computed(() => {
    const rfq = this.rfq();
    if (!rfq) return null;

    if (this.userType() === 'buyer') {
      return rfq.seller || null;
    } else {
      return rfq.buyer || null;
    }
  });

  otherPartyLabel = computed(() => {
    return this.userType() === 'buyer' ? 'Seller' : 'Buyer';
  });

  product = computed(() => {
    const rfq = this.rfq();
    return rfq?.initial_product || null;
  });

  quotesCount = computed(() => {
    const rfq = this.rfq();
    return rfq?.quotes?.length || 0;
  });

  canPerformActions = computed(() => {
    const rfq = this.rfq();
    if (!rfq) return false;
    const status = rfq.status?.toLowerCase();
    return status === 'pending' || status === 'seen';
  });

  /**
   * Gets the status severity for PrimeNG badge
   */
  getStatusSeverity(
    status: string
  ): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return StatusUtils.getStatusSeverity(status) as
      | 'info'
      | 'success'
      | 'warn'
      | 'danger'
      | 'secondary'
      | 'contrast';
  }

  /**
   * Gets the status background color
   */
  getStatusColor(status: string): string {
    return StatusUtils.getStatusColor(status);
  }

  /**
   * Gets the status text color
   */
  getStatusTextColor(status: string): string {
    return StatusUtils.getStatusTextColor(status);
  }

  /**
   * Formats currency amount
   */
  formatCurrency(amount: string | number | undefined): string {
    if (amount === undefined || amount === null) {
      return 'N/A';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  }

  /**
   * Formats address object or string into a readable comma-separated string
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

  /**
   * Gets the other party (seller for buyer, buyer for seller) - using computed signal
   */
  getOtherParty(): IUser | null {
    return this.otherParty();
  }

  /**
   * Gets the other party label - using computed signal
   */
  getOtherPartyLabel(): string {
    return this.otherPartyLabel();
  }

  /**
   * Gets the product information - using computed signal
   */
  getProduct(): IProduct | null {
    return this.product();
  }

  /**
   * Gets the quotes count - using computed signal
   */
  getQuotesCount(): number {
    return this.quotesCount();
  }

  /**
   * Checks if actions can be performed based on status - using computed signal
   */
  canPerformActionsOnRfq(): boolean {
    return this.canPerformActions();
  }

  /**
   * Handles dialog visibility change
   */
  onVisibilityChange(visible: boolean) {
    this.visible.set(visible);
    if (!visible) {
      this.dialogClose.emit();
    }
  }

  /**
   * Handles chat action
   */
  openChat() {
    const rfq = this.rfq();
    if (rfq) {
      this.chat.emit(rfq);
    }
  }

  /**
   * Handles quote action (for sellers)
   */
  createQuote() {
    const rfq = this.rfq();
    if (rfq) {
      this.quote.emit(rfq);
    }
  }

  /**
   * Handles mark as seen action (for sellers)
   */
  markRfqAsSeen() {
    const rfq = this.rfq();
    if (rfq) {
      this.markAsSeen.emit(rfq);
    }
  }

  /**
   * Handles reject action (for sellers)
   */
  rejectRfq() {
    const rfq = this.rfq();
    if (rfq) {
      this.reject.emit(rfq);
    }
  }

  /**
   * Closes the dialog
   */
  closeDialog() {
    this.onVisibilityChange(false);
  }

  /**
   * Handles image error
   */
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && !target.dataset['errorHandled']) {
      target.dataset['errorHandled'] = 'true';
      target.src = 'assets/images/placeholder.jpg'; // Fallback image
      target.alt = 'Product image not available';
    }
  }
}

import { Component, input, output, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { IQuote, IUser } from '../utils/interfaces';
import { IBuyerQuote, IBuyerUser, IBuyerQuoteItem } from '../utils/buyer-interfaces';
import { StatusUtils } from '../utils/status-utils';

interface RFQInfo {
  initial_quantity?: number;
  shipping_country?: string;
  buyer_message?: string | null;
  status?: string;
}

interface QuoteWithBuyer {
  buyer?: IUser;
  rfq?: RFQInfo;
}

@Component({
  selector: 'app-quote-details-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, BadgeModule, TableModule],
  templateUrl: './quote-details-dialog.component.html',
})
export class QuoteDetailsDialogComponent {
  // Two-way binding for dialog visibility using model()
  visible = model<boolean>(false);

  // Input signals using input() function
  quote = input<IQuote | IBuyerQuote | null>(null);
  userType = input<'buyer' | 'seller'>('buyer'); // Determines which perspective to show
  showActions = input<boolean>(true); // Whether to show action buttons
  allowAcceptReject = input<boolean>(true); // Whether to show accept/reject buttons
  allowChat = input<boolean>(true); // Whether to show chat button

  // Output signals using output() function
  accept = output<IQuote | IBuyerQuote>();
  reject = output<IQuote | IBuyerQuote>();
  chat = output<IQuote | IBuyerQuote>();
  dialogClose = output<void>();

  // Computed signals for derived values
  otherParty = computed(() => {
    const quote = this.quote();
    if (!quote) return null;

    if (this.userType() === 'buyer') {
      return quote.seller || null;
    } else {
      return (quote as IQuote & QuoteWithBuyer).buyer || null;
    }
  });

  otherPartyLabel = computed(() => {
    return this.userType() === 'buyer' ? 'Seller' : 'Buyer';
  });

  otherPartyMessage = computed(() => {
    const quote = this.quote();
    if (!quote) return 'No message available.';

    if (this.userType() === 'buyer') {
      return quote.seller_message || 'No message from seller.';
    } else {
      // For seller view, show buyer message from RFQ if available
      const rfq = (quote as IQuote & QuoteWithBuyer).rfq;
      return rfq?.buyer_message || 'No message from buyer.';
    }
  });

  quoteItems = computed(() => {
    const quote = this.quote();
    if (!quote) return [];
    const buyerQuote = quote as IBuyerQuote;
    return quote.items || buyerQuote.quote_items || [];
  });

  totalAmount = computed(() => {
    const quote = this.quote();
    if (!quote) return 0;
    const totalPrice = quote.total_price || quote.total_amount || 0;
    return typeof totalPrice === 'string' ? parseFloat(totalPrice) : totalPrice;
  });

  actionsDisabled = computed(() => {
    const quote = this.quote();
    if (!quote) return true;
    const status = quote.status?.toLowerCase();
    return status === 'rejected' || status === 'cancelled' || status === 'accepted';
  });

  rfqId = computed(() => {
    const quote = this.quote();
    if (!quote) return null;
    const buyerQuote = quote as IBuyerQuote;
    return buyerQuote.quote_request_id || null;
  });

  rfqDetails = computed(() => {
    const quote = this.quote();
    if (!quote || this.userType() !== 'buyer') return null;
    const buyerQuote = quote as IBuyerQuote;
    return buyerQuote.rfq || null;
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
   * Checks if RFQ information is available and meaningful
   */
  hasRFQInformation(rfq: RFQInfo | undefined): boolean {
    return !!(
      rfq &&
      (rfq.initial_quantity || rfq.shipping_country || rfq.buyer_message || rfq.status)
    );
  }

  /**
   * Gets the other party (seller for buyer, buyer for seller) - using computed signal
   */
  getOtherParty(): IUser | IBuyerUser | null {
    return this.otherParty();
  }

  /**
   * Gets the other party label - using computed signal
   */
  getOtherPartyLabel(): string {
    return this.otherPartyLabel();
  }

  /**
   * Gets the message from the other party - using computed signal
   */
  getOtherPartyMessage(): string {
    return this.otherPartyMessage();
  }

  /**
   * Gets the quote items - using computed signal
   */
  getQuoteItems(): (
    | IBuyerQuoteItem
    | {
        id: number;
        product_name: string | null;
        product_brand: string | null;
        quantity: number;
        unit_price: number;
        total_price: number;
        notes: string;
      }
  )[] {
    return this.quoteItems();
  }

  /**
   * Gets the total amount - using computed signal
   */
  getTotalAmount(): number {
    return this.totalAmount();
  }

  /**
   * Checks if actions should be disabled based on status - using computed signal
   */
  areActionsDisabled(): boolean {
    return this.actionsDisabled();
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
   * Handles accept quote action
   */
  acceptQuote() {
    const quote = this.quote();
    if (quote) {
      this.accept.emit(quote);
    }
  }

  /**
   * Handles reject quote action
   */
  rejectQuote() {
    const quote = this.quote();
    if (quote) {
      this.reject.emit(quote);
    }
  }

  /**
   * Handles chat action
   */
  openChat() {
    const quote = this.quote();
    if (quote) {
      this.chat.emit(quote);
    }
  }

  /**
   * Closes the dialog
   */
  closeDialog() {
    this.onVisibilityChange(false);
  }

  /**
   * Gets the RFQ ID from different quote properties - using computed signal
   */
  getRfqId(): number | string | null {
    return this.rfqId();
  }

  /**
   * Gets the RFQ details for buyer quotes - using computed signal
   */
  getRfqDetails(): RFQInfo | null {
    return this.rfqDetails();
  }
}

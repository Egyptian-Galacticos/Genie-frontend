import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Product } from '../../../../interfaces/product.interface';

interface RfqFormData {
  quantity: number;
  shipping_country: string;
  shipping_address: string;
  buyer_message: string;
}

interface CountryOption {
  label: string;
  value: string;
}

type RfqFieldChange =
  | { fieldName: 'quantity'; fieldValue: number }
  | { fieldName: 'shipping_country'; fieldValue: string }
  | { fieldName: 'shipping_address'; fieldValue: string }
  | { fieldName: 'buyer_message'; fieldValue: string };

@Component({
  selector: 'app-request-quote-dialog',
  templateUrl: './request-quote-dialog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
  ],
})
export class RequestQuoteDialogComponent {
  visible = input<boolean>(false);
  product = input<Product | null>(null);
  rfqFormData = input<RfqFormData>({
    quantity: 1,
    shipping_country: '',
    shipping_address: '',
    buyer_message: '',
  });
  rfqLoading = input<boolean>(false);
  countries = input<CountryOption[]>([]);

  dialogClosed = output<void>();
  quoteSubmitted = output<void>();
  quoteCancelled = output<void>();
  fieldChange = output<RfqFieldChange>();
  onHide() {
    this.dialogClosed.emit();
  }

  onSubmit() {
    this.quoteSubmitted.emit();
  }

  onCancel() {
    this.quoteCancelled.emit();
  }

  onFieldChange(fieldName: RfqFieldChange['fieldName'], fieldValue: RfqFieldChange['fieldValue']) {
    this.fieldChange.emit({ fieldName, fieldValue } as RfqFieldChange);
  }

  onVisibilityChange(visible: boolean) {
    if (!visible) {
      this.dialogClosed.emit();
    }
  }
}

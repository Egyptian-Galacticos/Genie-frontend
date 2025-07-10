import { Component, input, output, computed, model, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { IQuote, CreateContract, ContractItem, IUser } from '../utils/interfaces';
import { ContractService } from '../services/contract.service';

interface Term {
  id: string;
  content: string;
}

@Component({
  selector: 'app-contract-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    BadgeModule,
    TableModule,
    DividerModule,
    InputTextModule,
    CalendarModule,
    CardModule,
    AccordionModule,
    FieldsetModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './contract-dialog.component.html',
  styleUrls: ['./contract-dialog.component.scss'],
})
export class ContractDialogComponent {
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  private messageService = inject(MessageService);

  // Two-way binding for dialog visibility using model()
  visible = model<boolean>(false);

  // Input signals using input() function
  quote = input<IQuote | null>(null);
  userType = input<'buyer' | 'seller'>('buyer');

  // Output signals using output() function
  contractCreated = output<CreateContract>();
  dialogClose = output<void>();

  // Form and state signals
  contractForm = signal<FormGroup>(this.createContractForm());
  terms = signal<Term[]>([]);
  isSubmitting = signal(false);

  // Computed signals for derived values
  contractItems = computed<ContractItem[]>(() => {
    const currentQuote = this.quote();
    if (!currentQuote?.items) return [];

    return currentQuote.items.map((item, index) => ({
      id: index + 1,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      specifications: item.notes || '',
      product: item.product_id
        ? {
            id: item.product_id,
            name: item.product_name || '',
            brand: item.product_brand || '',
          }
        : undefined,
    })) as ContractItem[];
  });

  totalAmount = computed(() => {
    return this.contractItems().reduce((sum, item) => sum + item.total_price, 0);
  });

  currency = computed(() => {
    return 'USD'; // Default currency, you can modify this based on your business logic
  });

  otherParty = computed<IUser | null>(() => {
    const currentQuote = this.quote();
    if (!currentQuote) return null;

    return this.userType() === 'buyer' ? currentQuote.seller || null : currentQuote.buyer || null;
  });

  validTermsCount = computed(() => {
    return this.terms().filter(term => term.content.trim().length > 0).length;
  });

  hasValidTerms = computed(() => {
    return this.validTermsCount() > 0;
  });

  minDate = new Date(); // For calendar component

  constructor() {
    // Initialize with a default term
    this.addTerm();
  }

  private createContractForm(): FormGroup {
    return this.fb.group({
      estimated_delivery: ['', Validators.required],
      shipping_address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zip_code: ['', Validators.required],
      }),
      billing_address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zip_code: [''],
      }),
      use_shipping_as_billing: [false],
      additional_metadata: this.fb.array([]),
    });
  }

  get additionalMetadataArray(): FormArray {
    return this.contractForm().get('additional_metadata') as FormArray;
  }

  addTerm(): void {
    const newTerm: Term = {
      id: this.generateId(),
      content: '',
    };
    this.terms.update(terms => [...terms, newTerm]);
  }

  removeTerm(termId: string): void {
    this.terms.update(terms => terms.filter(term => term.id !== termId));
  }

  updateTermContent(termId: string, content: string): void {
    this.terms.update(terms =>
      terms.map(term => (term.id === termId ? { ...term, content } : term))
    );
  }

  addMetadataField(): void {
    const metadataGroup = this.fb.group({
      key: ['', [Validators.required, Validators.maxLength(100)]],
      value: ['', [Validators.required, Validators.maxLength(1000)]],
    });
    this.additionalMetadataArray.push(metadataGroup);
  }

  removeMetadataField(index: number): void {
    this.additionalMetadataArray.removeAt(index);
  }

  onUseShippingAsBillingChange(useShipping: boolean): void {
    const form = this.contractForm();
    if (useShipping) {
      const shippingAddress = form.get('shipping_address')?.value;
      form.get('billing_address')?.patchValue(shippingAddress);
    } else {
      form.get('billing_address')?.patchValue({
        street: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
      });
    }
  }

  onVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.dialogClose.emit();
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.contractForm.set(this.createContractForm());
    this.terms.set([]);
    this.addTerm(); // Add default term
    this.isSubmitting.set(false);
  }

  onSubmit(): void {
    const form = this.contractForm();
    const currentTerms = this.terms();
    const currentQuote = this.quote();

    if (!currentQuote) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Quote information is required to create a contract',
      });
      return;
    }

    // Validate form
    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    // Validate terms
    const validTerms = currentTerms.filter(term => term.content.trim().length > 0);
    if (validTerms.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'At least one term and condition must be provided',
      });
      return;
    }

    const termsText = validTerms.map((term, index) => `${index + 1}. ${term.content}`).join('\n');

    if (termsText.length < 50 || termsText.length > 10000) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Terms and conditions must be between 50 and 10000 characters',
      });
      return;
    }

    this.isSubmitting.set(true);

    // Prepare contract data
    const formValue = form.value;
    const metadata: Record<string, string> = {};

    // Add additional metadata
    if (formValue.additional_metadata && Array.isArray(formValue.additional_metadata)) {
      formValue.additional_metadata.forEach((item: { key: string; value: string }) => {
        if (item.key && item.value) {
          metadata[item.key] = item.value;
        }
      });
    }

    const contractData: CreateContract = {
      quote_id: currentQuote.id,
      terms_and_conditions: termsText,
      estimated_delivery: formValue.estimated_delivery
        ? new Date(formValue.estimated_delivery).toISOString()
        : undefined,
      shipping_address: formValue.shipping_address,
      billing_address: formValue.use_shipping_as_billing
        ? formValue.shipping_address
        : formValue.billing_address,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Create contract
    this.contractCreated.emit(contractData);
    this.visible.set(false);
    this.isSubmitting.set(false);

    this.isSubmitting.set(false);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Utility methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contractForm().get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isAddressFieldInvalid(
    addressType: 'shipping_address' | 'billing_address',
    fieldName: string
  ): boolean {
    const field = this.contractForm().get(`${addressType}.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contractForm().get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['maxlength'])
        return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}

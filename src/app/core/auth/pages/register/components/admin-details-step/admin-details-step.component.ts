import { Component, input, output, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AdminFormData } from '../../../../interfaces/register.interface';
import { phoneNumberValidator } from '../../../../validators/phone-number.validator';
import { passwordMatchValidator } from '../../../../validators/password.validator';
import { PhoneInputComponent } from '../phone-input.component';

@Component({
  selector: 'app-admin-details-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    CardModule,
    ButtonModule,
    DividerModule,
    PhoneInputComponent,
  ],
  templateUrl: './admin-details-step.component.html',
})
export class AdminDetailsStepComponent implements OnInit {
  private fb = inject(FormBuilder);

  showSellerFields = input.required<boolean>();
  loading = input(false);
  initialData = input<AdminFormData | null>(null);

  previousStep = output<void>();
  submitForm = output<AdminFormData>();

  adminForm!: FormGroup;

  constructor() {
    this.createForm();

    // Update validators when showSellerFields changes
    effect(() => {
      this.updateSellerFieldValidators(this.showSellerFields());
    });
  }

  ngOnInit() {
    if (this.initialData()) {
      this.adminForm.patchValue(this.initialData()!);
    }
  }

  private createForm() {
    this.adminForm = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
        phone_number: ['', [Validators.required, phoneNumberValidator()]],
        commercialRegistration: [''],
        taxId: [''],
      },
      { validators: passwordMatchValidator() }
    );
  }

  updateSellerFieldValidators(isSellerRole: boolean) {
    const validators = isSellerRole ? [Validators.required] : null;

    const commercialRegControl = this.adminForm.get('commercialRegistration');
    const taxIdControl = this.adminForm.get('taxId');

    commercialRegControl?.setValidators(validators);
    taxIdControl?.setValidators(validators);
    commercialRegControl?.updateValueAndValidity();
    taxIdControl?.updateValueAndValidity();
  }

  onPrevious() {
    this.previousStep.emit();
  }

  onSubmit() {
    if (this.adminForm.valid) {
      this.submitForm.emit(this.adminForm.value as AdminFormData);
    }
  }

  get formValue(): AdminFormData {
    return this.adminForm.value as AdminFormData;
  }

  get isValid(): boolean {
    return this.adminForm.valid;
  }
}

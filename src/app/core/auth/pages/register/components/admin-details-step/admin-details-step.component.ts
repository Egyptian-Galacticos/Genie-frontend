import { Component, input, output, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUploadModule } from 'primeng/fileupload';
import { AdminFormData } from '../../../../interfaces/register.interface';
import { phoneNumberValidator } from '../../../../../../shared/validators/phone-number.validator';
import { passwordMatchValidator } from '../../../../../../shared/validators/password.validator';
import { PhoneInputComponent } from '../../../../../../shared/components/phone-input/phone-input.component';

interface FileWithUrl {
  file: File;
  url: string;
}

@Component({
  selector: 'app-admin-details-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    CardModule,
    ButtonModule,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    FileUploadModule,
    PhoneInputComponent,
  ],
  templateUrl: './admin-details-step.component.html',
})
export class AdminDetailsStepComponent implements OnDestroy {
  private fb = inject(FormBuilder);

  showSellerFields = input.required<boolean>();
  loading = input(false);
  initialData = input<AdminFormData | null>(null);

  previousStep = output<void>();
  submitForm = output<AdminFormData>();

  adminForm!: FormGroup;
  commercialRegistrationImages: File[] = [];
  taxIdImages: File[] = [];
  commercialRegistrationPreviews: FileWithUrl[] = [];
  taxIdPreviews: FileWithUrl[] = [];

  constructor() {
    this.createForm();

    effect(() => {
      if (this.adminForm) {
        this.updateSellerFieldValidators(this.showSellerFields());
      }
    });
  }

  private createForm() {
    this.adminForm = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.minLength(2)]],
        last_name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#.])[A-Za-z\d@$!%*?&\-_#.]{8,}$/
            ),
          ],
        ],
        password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
        phone_number: ['', [Validators.required, phoneNumberValidator()]],
        commercialRegistration: [''],
        taxId: [''],
      },
      { validators: passwordMatchValidator() }
    );
  }

  private updateSellerFieldValidators(isSellerRole: boolean) {
    const validators = isSellerRole ? [Validators.required] : null;

    const commercialRegControl = this.adminForm.get('commercialRegistration');
    const taxIdControl = this.adminForm.get('taxId');

    if (commercialRegControl && taxIdControl) {
      commercialRegControl.setValidators(validators);
      taxIdControl.setValidators(validators);
      commercialRegControl.updateValueAndValidity();
      taxIdControl.updateValueAndValidity();
    }
  }

  validateSellerImages(): boolean {
    if (!this.showSellerFields()) return true;
    const hasCommercialRegImages = this.commercialRegistrationImages.length > 0;
    const hasTaxIdImages = this.taxIdImages.length > 0;
    return hasCommercialRegImages && hasTaxIdImages;
  }

  onCommercialRegistrationUpload(event: { files: File[] }) {
    this.commercialRegistrationPreviews.forEach(fw => URL.revokeObjectURL(fw.url));

    this.commercialRegistrationImages = [...event.files];
    this.commercialRegistrationPreviews = event.files.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }

  onTaxIdUpload(event: { files: File[] }) {
    this.taxIdPreviews.forEach(fw => URL.revokeObjectURL(fw.url));

    this.taxIdImages = [...event.files];
    this.taxIdPreviews = event.files.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }

  removeCommercialRegistrationImage(index: number) {
    if (index >= 0 && index < this.commercialRegistrationPreviews.length) {
      URL.revokeObjectURL(this.commercialRegistrationPreviews[index].url);
      this.commercialRegistrationImages.splice(index, 1);
      this.commercialRegistrationPreviews.splice(index, 1);
    }
  }

  removeTaxIdImage(index: number) {
    if (index >= 0 && index < this.taxIdPreviews.length) {
      URL.revokeObjectURL(this.taxIdPreviews[index].url);
      this.taxIdImages.splice(index, 1);
      this.taxIdPreviews.splice(index, 1);
    }
  }

  ngOnDestroy() {
    this.commercialRegistrationPreviews.forEach(fw => URL.revokeObjectURL(fw.url));
    this.taxIdPreviews.forEach(fw => URL.revokeObjectURL(fw.url));
  }

  onPrevious() {
    this.previousStep.emit();
  }

  onSubmit() {
    if (this.adminForm.valid && this.validateSellerImages()) {
      const formData = { ...this.adminForm.value } as AdminFormData;
      formData.commercialRegistrationImages = this.commercialRegistrationImages;
      formData.taxIdImages = this.taxIdImages;
      this.submitForm.emit(formData);
    }
  }

  get isValid(): boolean {
    return this.adminForm.valid && this.validateSellerImages();
  }
}

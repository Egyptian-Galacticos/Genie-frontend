import { Component, signal, inject, OnInit, viewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../services/profile.service';
import { Company } from '../../interfaces/profile.interface';
import { PhoneInputComponent } from '../../../../shared/components/phone-input/phone-input.component';
import { phoneNumberValidator } from '../../../../shared/validators/phone-number.validator';

import { TooltipModule } from 'primeng/tooltip';
import initializeCountries from '../../../../shared/lib/getAllCountries';

interface CountryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-company-data',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    IftaLabelModule,
    TextareaModule,
    MessageModule,
    TagModule,
    SelectModule,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    FileUploadModule,
    PhoneInputComponent,
    TooltipModule,
  ],
  templateUrl: './company.component.html',
})
export class CompanyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  companyForm!: FormGroup;
  saving = signal(false);
  company = this.profileService.company;
  roles = this.profileService.roles;
  permissions = this.profileService.getUpdatePermissions;
  countries = signal<CountryOption[]>([]);
  logoFile: File | null = null;
  logoPreview = signal<string | null>(null);
  removeExistingLogo = signal(false);
  isDragOver = signal(false);
  fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  constructor() {
    this.countries.set(initializeCountries());
  }

  ngOnInit() {
    this.initializeForm();
    this.populateFormFromProfile();
  }

  private initializeForm() {
    const permissions = this.permissions();

    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        { value: '', disabled: !permissions.canUpdateCompanyEmail },
        [Validators.required, Validators.email],
      ],
      tax_id: [
        { value: '', disabled: !permissions.canUpdateRestrictedCompanyFields },
        permissions.canUpdateRestrictedCompanyFields ? [Validators.required] : [],
      ],
      company_phone: ['', [Validators.required, phoneNumberValidator()]],
      commercial_registration: [
        { value: '', disabled: !permissions.canUpdateRestrictedCompanyFields },
        permissions.canUpdateRestrictedCompanyFields ? [Validators.required] : [],
      ],
      website: [''],
      description: [''],
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zip_code: ['', [Validators.required]],
      }),
    });
  }

  populateFormFromProfile() {
    const currentCompany = this.company();
    if (currentCompany) {
      this.populateForm(currentCompany);
    }
  }

  private populateForm(companyData: Company) {
    if (!companyData) {
      return;
    }

    this.companyForm.patchValue({
      name: companyData.name,
      email: companyData.email,
      tax_id: companyData.tax_id,
      company_phone: companyData.company_phone,
      commercial_registration: companyData.commercial_registration,
      website: companyData.website,
      description: companyData.description,
      address: {
        street: companyData.address.street,
        city: companyData.address.city,
        state: companyData.address.state,
        country: companyData.address.country,
        zip_code: companyData.address.zip_code,
      },
    });

    if (companyData.logo?.url) {
      this.logoPreview.set(companyData.logo.url);
    }
  }

  removeLogo() {
    const companyData = this.company();

    if (companyData?.logo?.url && !this.logoFile) {
      this.removeExistingLogo.set(true);
    }

    this.logoFile = null;
    this.logoPreview.set(null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processSelectedFile(files[0]);
    }
  }

  onDropZoneKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.triggerFileInput();
    }
  }

  onDropZoneKeyup(event: KeyboardEvent) {
    event.preventDefault();
  }

  triggerFileInput() {
    const fileInput = this.fileInputRef();
    if (fileInput) {
      fileInput.nativeElement.click();
    }
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processSelectedFile(file);
    }
    input.value = '';
  }

  changeLogoClick() {
    this.logoFile = null;
    this.logoPreview.set(null);
    this.removeExistingLogo.set(false);
  }

  private processSelectedFile(file: File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid file type',
        detail: 'Only JPG, JPEG, PNG, or SVG files are allowed.',
      });
      return;
    }

    if (file.size > 5242880) {
      this.messageService.add({
        severity: 'error',
        summary: 'File too large',
        detail: 'Logo must be less than 5MB.',
      });
      return;
    }

    this.logoFile = file;
    this.removeExistingLogo.set(false);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.logoPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.companyForm.valid) {
      this.saving.set(true);
      const formData = this.companyForm.getRawValue();

      const payload = this.createFormDataPayload(formData);

      this.profileService.updateCompany(payload).subscribe({
        next: () => this.handleSubmitSuccess(),
        error: () => this.handleSubmitError(),
      });
    }
  }

  private createFormDataPayload(formData: Record<string, unknown>): FormData {
    const payload = new FormData();
    const excludedFields = ['address', 'email', 'tax_id', 'commercial_registration'];

    Object.keys(formData).forEach(key => {
      if (!excludedFields.includes(key) && formData[key] != null) {
        payload.append(key, String(formData[key]));
      }
    });

    if (this.permissions().canUpdateRestrictedCompanyFields) {
      if (formData['tax_id']) {
        payload.append('tax_id', String(formData['tax_id']));
      }
      if (formData['commercial_registration']) {
        payload.append('commercial_registration', String(formData['commercial_registration']));
      }
    }

    if (this.permissions().canUpdateCompanyEmail) {
      payload.append('email', String(formData['email']));
    }
    const address = formData['address'] as Record<string, unknown>;
    if (address) {
      Object.keys(address).forEach(addressKey => {
        if (address[addressKey] != null) {
          payload.append(`address[${addressKey}]`, String(address[addressKey]));
        }
      });
    }

    if (this.logoFile) {
      payload.append('logo', this.logoFile);
    }

    if (this.removeExistingLogo()) {
      payload.append('remove_logo', '1');
    }

    return payload;
  }

  private handleSubmitSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Company data updated successfully',
    });

    this.logoFile = null;
    this.removeExistingLogo.set(false);

    const updatedCompany = this.company();
    if (updatedCompany) {
      this.populateForm(updatedCompany);
    }

    this.saving.set(false);
  }

  private handleSubmitError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update company data',
    });
    this.saving.set(false);
  }

  goToCompanyEmailVerification() {
    this.router.navigate(['/auth/company-send']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.companyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.companyForm.get(fieldName);
    if (!field?.errors) return '';

    const displayName = this.getDisplayName(fieldName);

    if (field.errors['required']) return `${displayName} is required`;
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength']) return `${displayName} is too short`;
    if (field.errors['invalidPhoneNumber']) return 'Please enter a valid phone number';

    return '';
  }

  private getDisplayName(fieldName: string): string {
    const name = fieldName.includes('.') ? fieldName.split('.').pop() : fieldName;
    return name?.replace('_', ' ') || fieldName;
  }

  getSummaryIconClasses(color: string): string {
    const colorMap: Record<string, string> = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-400',
      green: 'bg-gradient-to-br from-green-500 to-green-400',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-400',
      red: 'bg-gradient-to-br from-red-500 to-red-400',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-400',
    };

    return `w-10 h-10 rounded-full flex items-center justify-center ${colorMap[color] || colorMap['blue']}`;
  }

  private readonly roleConfig = {
    buyer: { severity: 'info' as const, icon: 'pi pi-shopping-cart' },
    seller: { severity: 'success' as const, icon: 'pi pi-shop' },
    admin: { severity: 'warning' as const, icon: 'pi pi-cog' },
    default: { severity: 'secondary' as const, icon: 'pi pi-user' },
  };

  emailTooltip = computed(() => {
    const permissions = this.permissions();

    return permissions.isCompanyEmailVerified ? 'Email is verified and cannot be changed.' : '';
  });

  restrictedFieldTooltip = computed(() => {
    const permissions = this.permissions();
    return !permissions.canUpdateRestrictedCompanyFields ? 'This field cannot be modified.' : '';
  });

  getRoleSeverity(
    role: string
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    const config = this.roleConfig[role?.toLowerCase() as keyof typeof this.roleConfig];
    return config?.severity || this.roleConfig.default.severity;
  }

  getRoleIcon(role: string): string {
    const config = this.roleConfig[role?.toLowerCase() as keyof typeof this.roleConfig];
    return config?.icon || this.roleConfig.default.icon;
  }
}

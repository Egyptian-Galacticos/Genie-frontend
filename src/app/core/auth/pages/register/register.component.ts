import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { CompanyInfoStepComponent } from './components/company-info-step/company-info-step.component';
import { AdminDetailsStepComponent } from './components/admin-details-step/admin-details-step.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import {
  UserRole,
  CountryOption,
  UserRoleOption,
  CompanyFormData,
  AdminFormData,
  RegistrationData,
} from '../../interfaces/register.interface';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ToastModule,
    StepsModule,
    ButtonModule,
    CompanyInfoStepComponent,
    AdminDetailsStepComponent,
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly environment = environment;

  currentStep = signal(0);
  loading = signal(false);
  companyData = signal<CompanyFormData | null>(null);
  adminData = signal<AdminFormData | null>(null);

  isStep1 = computed(() => this.currentStep() === 0);
  isStep2 = computed(() => this.currentStep() === 1);
  showSellerFields = computed(() => {
    const company = this.companyData();
    if (!company) return false;
    return company.role === 'seller' || company.role === 'both';
  });

  steps: MenuItem[] = [{ label: 'Company Information' }, { label: 'Administrator Details' }];

  roles: UserRoleOption[] = [
    { label: 'Buyer', value: 'buyer' },
    { label: 'Seller', value: 'seller' },
    { label: 'Both Buyer & Seller', value: 'both' },
  ];

  countries: CountryOption[] = [];

  constructor() {
    countries.registerLocale(enLocale);

    const countryData = countries.getNames('en', { select: 'official' });
    this.countries = Object.entries(countryData)
      .map(([code, name]) => ({ label: name, value: code }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  onCompanyStepNext(companyFormData: CompanyFormData): void {
    this.companyData.set(companyFormData);
    this.currentStep.set(1);
  }

  onAdminStepPrevious(): void {
    this.currentStep.set(0);
  }

  onSubmitRegistration(adminFormData: AdminFormData): void {
    const companyData = this.companyData();

    if (!companyData) {
      this.messageService.add({
        severity: 'error',
        summary: 'Form Error',
        detail: 'Company information is missing. Please go back to step 1.',
      });
      return;
    }

    this.loading.set(true);
    this.adminData.set(adminFormData);

    const roles: UserRole[] =
      companyData.role === 'both' ? ['buyer', 'seller'] : [companyData.role as UserRole];

    const registrationData: RegistrationData = {
      roles: roles,
      user: {
        first_name: adminFormData.first_name,
        last_name: adminFormData.last_name,
        email: adminFormData.email,
        password: adminFormData.password,
        password_confirmation: adminFormData.password_confirmation,
        phone_number: adminFormData.phone_number || null,
      },
      company: {
        name: companyData.name,
        email: companyData.email,
        company_phone: companyData.company_phone,
        address: {
          street: companyData.streetAddress,
          city: companyData.city,
          state: companyData.stateProvince,
          zip_code: companyData.zipPostalCode,
          country: companyData.country,
        },
        ...(this.showSellerFields() && {
          tax_id: adminFormData.taxId,
          commercial_registration: adminFormData.commercialRegistration,
        }),
      },
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/register-success']);
      },
      error: error => {
        this.loading.set(false);
        this.handleRegistrationError(error);
      },
    });
  }

  private handleRegistrationError(error: {
    error?: { errors?: Record<string, unknown>; message?: string };
    message?: string;
  }): void {
    if (error.error && error.error.errors) {
      this.handleValidationErrors(error.error.errors);
    } else if (error.error && error.error.message) {
      this.showErrorToast('Registration Failed', error.error.message);
    } else {
      this.showErrorToast(
        'Registration Failed',
        error.message || 'Registration failed. Please try again.'
      );
    }
  }

  private handleValidationErrors(validationErrors: Record<string, unknown>): void {
    const errorMessages = this.extractErrorMessages(validationErrors);
    const combinedErrors = errorMessages.join('\n• ');
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Errors',
      detail: `• ${combinedErrors}`,
      life: 10000,
    });
  }

  private extractErrorMessages(obj: Record<string, unknown>): string[] {
    const errorMessages: string[] = [];
    Object.values(obj).forEach((value: unknown) => {
      if (Array.isArray(value)) {
        errorMessages.push(...(value as string[]));
      } else if (typeof value === 'object' && value !== null) {
        errorMessages.push(...this.extractErrorMessages(value as Record<string, unknown>));
      }
    });
    return errorMessages;
  }

  private showErrorToast(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 6000,
    });
  }
}

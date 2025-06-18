import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../services/profile.service';
import { SellerUpgradeRequest } from '../../interfaces/profile.interface';

@Component({
  selector: 'app-seller-upgrade',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
    MessageModule,
  ],
  templateUrl: './seller-upgrade.component.html',
})
export class SellerUpgradeComponent {
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  saving = signal(false);

  readonly profile = this.profileService.profile;
  readonly canUpgrade = this.profileService.canUpgradeToSeller;

  sellerForm = new FormGroup({
    tax_id: new FormControl('', [Validators.required]),
    commercial_registration: new FormControl('', [Validators.required]),
    website: new FormControl('', [Validators.pattern(/^https?:\/\/.+\..+/)]),
    description: new FormControl(''),
  });

  /**
   * Check if a field is invalid
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.sellerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.sellerForm.get(fieldName);
    if (!field || !field.errors) return '';
    const errors = field.errors;
    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (errors['pattern'] && fieldName === 'website') {
      return 'Please enter a valid website URL (e.g., https://example.com)';
    }
    return 'Invalid input';
  }

  /**
   * Get field label for error messages
   */
  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      tax_id: 'Tax ID',
      commercial_registration: 'Commercial Registration',
      website: 'Website',
      description: 'Description',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Submit the seller upgrade form
   */
  onSubmit(): void {
    if (this.sellerForm.invalid || this.saving()) {
      this.sellerForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formValue = this.sellerForm.value as SellerUpgradeRequest;

    const sellerData: SellerUpgradeRequest = {
      tax_id: formValue.tax_id!,
      commercial_registration: formValue.commercial_registration!,
    };

    if (formValue.website?.trim()) {
      sellerData.website = formValue.website.trim();
    }

    if (formValue.description?.trim()) {
      sellerData.description = formValue.description.trim();
    }

    this.profileService.upgradeToSeller(sellerData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Your seller upgrade request has been submitted successfully!',
        });
        this.router.navigate(['/profile']);
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to submit seller upgrade request. Please try again.',
        });
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }
}

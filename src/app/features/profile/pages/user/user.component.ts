import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../services/profile.service';
import { User, Profile } from '../../interfaces/profile.interface';
import { PhoneInputComponent } from '../../../../shared/components/phone-input/phone-input.component';
import { phoneNumberValidator } from '../../../../shared/validators/phone-number.validator';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-user-data',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    IftaLabelModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    PanelModule,
    ProgressSpinnerModule,
    PhoneInputComponent,
    SkeletonModule,
    TooltipModule,
  ],
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  userForm!: FormGroup;
  loading = signal(false);
  saving = signal(false);

  user = this.profileService.user;

  permissions = this.profileService.getUpdatePermissions;

  ngOnInit() {
    this.initializeForm();
    this.loadUserData();
  }

  private initializeForm() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        { value: '', disabled: !this.profileService.canUpdateEmail() },
        [Validators.required, Validators.email],
      ],
      phone_number: ['', [Validators.required, phoneNumberValidator()]],
    });
  }

  loadUserData() {
    const currentUser = this.profileService.user();
    if (currentUser) {
      this.populateForm(currentUser);
      return;
    }

    this.loading.set(true);
    this.profileService.loadProfile().subscribe({
      next: (data: Profile) => {
        if (data?.user) {
          this.populateForm(data.user);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user data',
        });
        this.loading.set(false);
      },
    });
  }

  private populateForm(userData: User) {
    if (!userData) {
      return;
    }

    this.userForm.patchValue({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone_number: userData.phone_number,
    });
  }

  getEmailVerificationStatus(): 'verified' | 'pending' | 'unknown' {
    const userData = this.user();
    if (userData?.is_email_verified === true) return 'verified';
    if (userData?.is_email_verified === false) return 'pending';
    return 'unknown';
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.saving.set(true);
      const formData: Record<string, string> = {
        first_name: this.userForm.value.first_name?.trim(),
        last_name: this.userForm.value.last_name?.trim(),
        phone_number: this.userForm.value.phone_number?.trim(),
      };
      if (this.permissions().canUpdateEmail) {
        formData['email'] = this.userForm.value.email?.trim();
      }
      this.profileService.updateUser(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully',
          });
          this.saving.set(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update profile',
          });
          this.saving.set(false);
        },
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName.replace('_', ' ')} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName.replace('_', ' ')} is too short`;
      if (field.errors['invalidPhoneNumber']) return 'Please enter a valid phone number';
    }
    return '';
  }

  getEmailTooltipText(): string {
    const permissions = this.permissions();
    if (permissions.isUserEmailVerified) {
      return 'Email is verified and cannot be changed';
    } else if (!permissions.canUpdateEmail) {
      return 'Email cannot be updated while verification is pending';
    } else {
      return 'Email verification pending - you can update your email until verified';
    }
  }

  goToEmailVerification(): void {
    this.router.navigate(['/auth/email-pending']);
  }
}

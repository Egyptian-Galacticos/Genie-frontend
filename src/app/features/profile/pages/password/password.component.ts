import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../services/profile.service';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('new_password');
  const confirmPassword = control.get('new_password_confirmation');

  if (!newPassword || !confirmPassword) return null;

  return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    FloatLabelModule,
    MessageModule,
  ],
  templateUrl: './password.component.html',
})
export class PasswordComponent {
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);

  saving = signal(false);
  passwordForm = new FormGroup(
    {
      current_password: new FormControl('', [Validators.required]),
      new_password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#.])[A-Za-z\d@$!%*?&\-_#.]{8,}$/
        ),
      ]),
      new_password_confirmation: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  isFormValid = computed(() => this.passwordForm.valid);

  isFieldInvalid = (fieldName: string) => {
    const field = this.passwordForm.get(fieldName);
    const formMismatch =
      fieldName === 'new_password_confirmation' && this.passwordForm.errors?.['passwordMismatch'];
    return !!(field && (field.invalid || formMismatch) && (field.dirty || field.touched));
  };

  getFieldError = (fieldName: string): string => {
    const field = this.passwordForm.get(fieldName);
    const errors = field?.errors;

    if (!errors && fieldName !== 'new_password_confirmation') return '';
    if (
      fieldName === 'new_password_confirmation' &&
      this.passwordForm.errors?.['passwordMismatch']
    ) {
      return 'Passwords do not match';
    }

    if (errors?.['required']) {
      return fieldName === 'new_password_confirmation'
        ? 'Please confirm your password'
        : `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }
    if (errors?.['minlength']) return 'Password must be at least 8 characters long';
    if (errors?.['pattern'])
      return 'Password must contain uppercase, lowercase, number and special character';

    return '';
  };

  onSubmit() {
    if (!this.isFormValid()) return;

    this.saving.set(true);
    const formValues = this.passwordForm.value;
    const payload = {
      current_password: formValues.current_password || '',
      new_password: formValues.new_password || '',
      new_password_confirmation: formValues.new_password_confirmation || '',
    };

    this.profileService.changePassword(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully',
        });
        this.passwordForm.reset();
        this.saving.set(false);
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to change password',
        });
        this.saving.set(false);
      },
    });
  }
}

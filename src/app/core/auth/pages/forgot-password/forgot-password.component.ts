import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly submitted = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.loading()) {
      const email = this.forgotPasswordForm.value.email as string;

      this.loading.set(true);

      this.authService.forgotPassword(email).subscribe({
        next: response => {
          this.loading.set(false);
          this.submitted.set(true);
          this.messageService.add({
            severity: 'success',
            summary: 'Email Sent',
            detail: response.message || 'Password reset link sent to your email',
            life: 5000,
          });
        },
        error: error => {
          this.loading.set(false);
          const errorMsg = error.error?.message || 'Failed to send reset email. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMsg,
            life: 5000,
          });
        },
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}

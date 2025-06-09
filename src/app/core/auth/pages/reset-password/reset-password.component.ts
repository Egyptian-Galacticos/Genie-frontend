import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../validators/password.validator';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  resetToken = signal<string>('');
  email = signal<string>('');
  loading = signal<boolean>(false);
  resetSuccess = signal<boolean>(false);

  resetPasswordForm = this.fb.group(
    {
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
      password_confirmation: ['', Validators.required],
    },
    { validators: passwordMatchValidator() }
  );

  shouldShowForm = computed(() => !this.resetSuccess());

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      if (params['token'] && params['email']) {
        this.resetToken.set(params['token']);
        this.email.set(params['email']);
      } else {
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.showError(
              'Invalid or missing reset token or email. Please request a new reset link.'
            );
          }, 200);
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.resetPasswordForm.valid) return;

    this.loading.set(true);

    const { password, password_confirmation } = this.resetPasswordForm.value;
    const resetData = {
      token: this.resetToken(),
      password: password!,
      password_confirmation: password_confirmation!,
      email: this.email(),
    };

    this.authService.resetPassword(resetData).subscribe({
      next: () => {
        this.loading.set(false);
        this.resetSuccess.set(true);
        this.showSuccess('Password reset successfully');
      },
      error: error => {
        this.loading.set(false);
        const message = error.error?.message || 'Failed to reset password. Please try again.';
        this.showError(message);
      },
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 5000,
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000,
    });
  }
}

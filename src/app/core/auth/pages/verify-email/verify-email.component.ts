import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly verifying = signal<boolean>(false);
  readonly verified = signal<boolean>(false);
  readonly alreadyVerified = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly token = signal<string>('');

  readonly showVerificationStatus = computed(() => !this.verifying() && this.token());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = computed(() => this.authService.user());

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      if (params['token']) {
        this.handleToken(params['token']);
      } else {
        this.handleMissingToken();
      }
    });
  }

  private handleToken(token: string) {
    this.token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      const user = this.currentUser();
      if (user && user.is_email_verified) {
        this.alreadyVerified.set(true);
        this.showSuccess('Your email is already verified! You have full access to your account.');
        return;
      }

      this.verifyEmailAddress(token);
    }
  }

  private handleMissingToken() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.errorMessage.set(
          'No verification token provided. Please check your email for the verification link.'
        );
        this.showError('Invalid verification link. Please check your email for a valid link.');
      }, 200);
    }
  }

  private verifyEmailAddress(token: string): void {
    this.verifying.set(true);
    this.errorMessage.set(null);

    this.authService.verifyEmail(token).subscribe({
      next: response => {
        this.verifying.set(false);
        this.verified.set(true);

        if (this.isAuthenticated()) {
          this.authService.updateEmailVerificationStatus(true);
          this.showSuccess(
            response.message ||
              'Email verified successfully! Your account now has full access to all features.'
          );
        } else {
          this.showSuccess(response.message || 'Email verified successfully');
        }
      },
      error: error => {
        this.verifying.set(false);
        this.verified.set(false);
        const message =
          error.error?.message || 'Email verification failed. The link may be invalid or expired.';
        this.errorMessage.set(message);
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

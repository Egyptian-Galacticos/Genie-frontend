import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-company-email-verification',
  imports: [CommonModule, ButtonModule, CardModule, MessageModule, ProgressSpinnerModule],
  templateUrl: './company-email-verification.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }
    `,
  ],
})
export class CompanyEmailVerificationComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // State signals
  isLoading = signal<boolean>(false);
  isResending = signal<boolean>(false);
  emailSent = signal<boolean>(false);
  alreadyVerified = signal<boolean>(false);
  message = signal<string>('');
  messageType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.sendInitialVerification();
  }

  /**
   * Automatically send verification email when component loads
   */
  private sendInitialVerification(): void {
    this.isLoading.set(true);
    this.message.set('');

    this.authService.sendCompanyEmailVerification().subscribe({
      next: response => {
        this.isLoading.set(false);
        this.emailSent.set(true);
        this.message.set(response.message || 'Company verification email sent successfully!');
        this.messageType.set('success');
      },
      error: error => {
        this.isLoading.set(false);
        const message =
          error.error?.message || 'Failed to send verification email. Please try again.';

        // Check if the error is because company email is already verified
        if (message.includes('already verified') || message.includes('Already verified')) {
          this.alreadyVerified.set(true);
          this.emailSent.set(false);
          this.message.set('Your company email address is already verified.');
        } else {
          this.emailSent.set(false);
          this.message.set(message);
          this.messageType.set('error');
        }
      },
    });
  }

  /**
   * Resend company email verification
   */
  resendVerification(): void {
    this.isResending.set(true);
    this.message.set('');

    this.authService.resendCompanyEmailVerification().subscribe({
      next: response => {
        this.isResending.set(false);
        this.emailSent.set(true);
        this.message.set(response.message || 'Company verification email resent successfully!');
        this.messageType.set('success');
      },
      error: error => {
        this.isResending.set(false);
        const message =
          error.error?.message || 'Failed to resend verification email. Please try again.';

        // Check if the error is because company email is already verified
        if (message.includes('already verified') || message.includes('Already verified')) {
          this.alreadyVerified.set(true);
          this.emailSent.set(false);
          this.message.set('Your company email address is already verified.');
        } else {
          this.message.set(message);
          this.messageType.set('error');
        }
      },
    });
  }

  /**
   * Navigate back to dashboard
   */
  goToProfile(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Sign out user
   */
  signOut(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      },
    });
  }
}

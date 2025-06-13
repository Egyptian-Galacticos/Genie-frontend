import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../services/auth.service';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-verify-company-email',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './verify-company-email.component.html',
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
export class VerifyCompanyEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  verificationSuccess = signal<boolean>(false);
  alreadyVerified = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  hasError = computed(
    () => !this.isLoading() && !this.verificationSuccess() && !this.alreadyVerified()
  );

  ngOnInit() {
    this.verifyCompanyEmail();
  }

  /**
   * Verify company email using token from route params
   */
  private verifyCompanyEmail(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.errorMessage.set('Invalid verification link. No verification token found.');
      return;
    }

    this.isLoading.set(true);

    this.authService.verifyEmail(token).subscribe({
      next: response => {
        this.isLoading.set(false);

        if (response.success) {
          if (
            response.message?.includes('already verified') ||
            response.message?.includes('Already verified')
          ) {
            this.alreadyVerified.set(true);
          } else {
            this.verificationSuccess.set(true);
            this.successMessage.set(response.message || 'Company email verified successfully!');
            const user = this.authService.user();
            if (user) {
              this.authService.updateEmailVerificationStatus(true);
            }
          }
        } else {
          this.errorMessage.set(response.message || 'Company email verification failed.');
        }
      },
      error: error => {
        this.isLoading.set(false);
        const message =
          error.error?.message || 'An error occurred during company email verification.';

        if (message.includes('already verified') || message.includes('Already verified')) {
          this.alreadyVerified.set(true);
        } else {
          this.errorMessage.set(message);
        }
      },
    });
  }

  /**
   * Open email client to contact support
   */
  contactSupport(): void {
    window.location.href =
      'mailto:genienotify3@gmail.com?subject=Company%20Email%20Verification%20Issue';
  }
}

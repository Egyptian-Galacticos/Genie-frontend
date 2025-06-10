import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-verification-pending',
  imports: [CommonModule, RouterLink, ButtonModule, MessageModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './email-verification-pending.component.html',
})
export class EmailVerificationPendingComponent {
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly user = computed(() => this.authService.user());
  readonly resendingEmail = signal<boolean>(false);
  readonly emailSent = signal<boolean>(false);
  readonly isAlreadyVerified = computed(() => {
    const user = this.user();
    return user ? user.is_email_verified : false;
  });

  resendVerificationEmail(): void {
    const user = this.user();
    if (!user || this.resendingEmail()) {
      return;
    }

    this.resendingEmail.set(true);

    this.authService.resendVerificationEmail(user.email).subscribe({
      next: response => {
        this.resendingEmail.set(false);
        this.emailSent.set(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Email Sent',
          detail: response.message || 'Verification email has been sent to your email address.',
          life: 5000,
        });
      },
      error: error => {
        this.resendingEmail.set(false);
        const message =
          error.error?.message || 'Failed to send verification email. Please try again.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 5000,
        });
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-deactivation',
  imports: [CommonModule, RouterLink, ButtonModule, MessageModule, ConfirmDialogModule],
  templateUrl: './deactivation.component.html',
  providers: [ConfirmationService],
})
export class DeactivationComponent {
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  deactivating = signal(false);

  confirmDeactivation() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to deactivate your account? You can reactivate it by logging in again within 30 days. After 30 days, your data will be permanently deleted.',
      header: 'Confirm Account Deactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Deactivate',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deactivateAccount();
      },
    });
  }

  private deactivateAccount() {
    this.deactivating.set(true);
    const userData = this.profileService.user();
    if (!userData?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User ID not found. Please refresh and try again.',
      });
      this.deactivating.set(false);
      return;
    }

    this.profileService.deactivateAccount(userData.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Account Deactivated',
          detail: 'Your account has been successfully deactivated. You will be logged out shortly.',
        });

        this.deactivating.set(false);
        setTimeout(() => {
          this.authService.logout().subscribe({
            next: () => {},
            error: () => {
              this.router.navigate(['/auth/login']);
            },
          });
        }, 2000);
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to deactivate account',
        });
        this.deactivating.set(false);
      },
    });
  }
}

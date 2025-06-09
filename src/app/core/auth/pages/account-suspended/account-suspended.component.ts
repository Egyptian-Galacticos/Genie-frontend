import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-account-suspended',
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  templateUrl: './account-suspended.component.html',
})
export class AccountSuspendedComponent {
  private readonly router = inject(Router);

  readonly suspensionDate = signal<Date>(new Date());

  /**
   * Handle contact support action
   */
  contactSupport(): void {
    const subject = encodeURIComponent('Account Suspension Appeal - Support Request');
    const body = encodeURIComponent(`Dear Support Team,

I am writing to inquire about the suspension of my account. I would like to understand the reason for the suspension and discuss the next steps for resolving this matter.

Account Details:
- Suspension Date: ${this.suspensionDate().toLocaleDateString()}
- User ID: [Your User ID if available]

Please provide me with information on:
1. The specific reason for the account suspension
2. Required steps to resolve this issue
3. Expected timeline for account review

I appreciate your assistance and look forward to your response.

Best regards,
[Your Name]`);

    const mailtoLink = `mailto:${environment.email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_self');
  }

  /**
   * Navigate back to login page
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}

import { Component, inject, signal, effect, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  template: `
    <div class="flex items-center justify-center min-h-screen bg-ground">
      <div class="text-center p-8 bg-card rounded-lg shadow-lg max-w-md border border-default">
        <div class="mb-6">
          <i class="pi pi-spin pi-spinner text-4xl text-primary-500 mb-4 block"></i>
          <h2 class="text-xl font-semibold text-primary mb-2 m-0">Redirecting to Dashboard</h2>
          <p class="text-secondary m-0">
            Please wait while we prepare your personalized dashboard...
          </p>
        </div>

        @if (currentRole()) {
          <div class="text-sm text-muted">
            <p class="m-0">
              Detected role: <span class="font-medium text-primary-600">{{ currentRole() }}</span>
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardRedirectComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  currentRole = signal<string>('');

  constructor() {
    effect(() => {
      this.redirectToAppropriateDashboard();
    });
  }

  private redirectToAppropriateDashboard() {
    const userRoles = this.authService.userRoles();

    // Priority order: admin > seller > buyer
    if (userRoles.includes('admin')) {
      this.currentRole.set('Administrator');
      this.navigateWithDelay('/dashboard/admin');
    } else if (userRoles.includes('seller')) {
      this.currentRole.set('Seller');
      this.navigateWithDelay('/dashboard/seller');
    } else if (userRoles.includes('buyer')) {
      this.currentRole.set('Buyer');
      this.navigateWithDelay('/dashboard/buyer');
    } else {
      this.router.navigate(['/unauthorized'], { skipLocationChange: true });
    }
  }

  private navigateWithDelay(route: string) {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.router.navigate([route]);
        });
      }, 1500);
    });
  }
}

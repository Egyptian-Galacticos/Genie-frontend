import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ProfileService } from './services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    SkeletonModule,
  ],
  templateUrl: './profile.component.html',
  providers: [MessageService],
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private messageService = inject(MessageService);

  profile = this.profileService.profile;
  loading = this.profileService.loading;
  error = this.profileService.error;

  navigationItems = [
    {
      label: 'User Data',
      routerLink: '/profile/user',
      route: '/profile/user',
      icon: 'pi pi-user',
    },
    {
      label: 'Company Data',
      routerLink: '/profile/company',
      route: '/profile/company',
      icon: 'pi pi-building',
    },
    {
      label: 'Password Settings',
      routerLink: '/profile/password',
      route: '/profile/password',
      icon: 'pi pi-key',
    },
    {
      label: 'Account Deactivation',
      routerLink: '/profile/deactivation',
      route: '/profile/deactivation',
      icon: 'pi pi-times-circle',
    },
  ];

  get menuItems() {
    return this.navigationItems;
  }

  ngOnInit() {
    this.profileService.loadProfile().subscribe({
      next: () => {},
      error: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to load profile data: ${err.message}`,
        });
      },
    });
  }

  refreshProfileData() {
    this.profileService.loadProfile().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile data refreshed successfully',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to refresh profile data',
        });
      },
    });
  }
}

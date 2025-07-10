import { ThemeService } from '../../../../core/services/theme.service';
import { Component, inject, computed } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { NgClass, CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { DividerModule } from 'primeng/divider';
import { StyleClassModule } from 'primeng/styleclass';
import { RouterModule } from '@angular/router';
import type { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [
    NgClass,
    CommonModule,
    ButtonModule,
    AvatarModule,
    PopoverModule,
    DividerModule,
    StyleClassModule,
    RouterModule,
  ],
  templateUrl: './dashboard-navbar.component.html',
  // styleUrl: '../../styles/_topbar.scss',
})
export class DashboardNavbarComponent {
  public layoutService = inject(LayoutService);
  public themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  // Auth-related properties
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;

  isBuyer = computed(() => this.authService.hasRole('buyer'));
  isSeller = computed(() => this.authService.hasRole('seller'));
  isAdmin = computed(() => this.authService.hasRole('admin'));

  // Avatar label with debugging
  avatarLabel = computed(() => {
    const currentUser = this.user();
    console.log('User data for avatar:', currentUser);

    if (currentUser?.first_name) {
      return currentUser.first_name[0].toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  });

  userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
    },
    {
      label: 'Buyer Dashboard',
      icon: 'pi pi-shopping-cart',
      routerLink: '/dashboard/buyer',
      visible: this.isBuyer(),
    },
    {
      label: 'Seller Dashboard',
      icon: 'pi pi-briefcase',
      routerLink: '/dashboard/seller',
      visible: this.isSeller(),
    },
    {
      label: 'Admin Dashboard',
      icon: 'pi pi-cog',
      routerLink: '/dashboard/admin',
      visible: this.isAdmin(),
    },
    {
      separator: true,
    },
    {
      label: 'Sign Out',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ]);

  toggleDarkMode() {
    // this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
    this.themeService.setTheme(!this.themeService.isDark());
  }

  logout() {
    this.authService.logout().subscribe();
  }
}

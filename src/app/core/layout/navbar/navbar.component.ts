import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { DividerModule } from 'primeng/divider';
import type { MenuItem } from 'primeng/api';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    DrawerModule,
    MenuModule,
    PopoverModule,
    DividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  drawerVisible = signal(false);
  scrolled = signal(false);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;

  isBuyer = computed(() => this.authService.hasRole('buyer'));
  isSeller = computed(() => this.authService.hasRole('seller'));

  items: MenuItem[] = [
    { label: 'Home', routerLink: '/' },
    { label: 'Products', routerLink: '/products' },
    { label: 'About Us', routerLink: '/about' },
    { label: 'Contact Us', routerLink: '/contact' },
  ];

  userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
    },
    {
      label: 'Buyer Dashboard',
      icon: 'pi pi-shopping-cart',
      routerLink: 'dashboard/buyer',
      visible: this.isBuyer(),
    },
    {
      label: 'Seller Dashboard',
      icon: 'pi pi-briefcase',
      routerLink: 'dashboard/seller',
      visible: this.isSeller(),
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 50);
  }

  handleMobileMenuItemClick(item: MenuItem): void {
    if (item.command) {
      item.command({ item });
    }
    this.drawerVisible.set(false);
  }

  toggleTheme() {
    this.themeService.setTheme(!this.themeService.isDark());
  }

  logout() {
    this.authService.logout().subscribe();
  }
}

import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import type { MenuItem } from 'primeng/api';
import { ThemeService } from '../../services/theme.service';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule, AvatarModule],
  templateUrl: './navbar.component.html',
  animations: [AnimationService.slideInLeft],
})
export class NavbarComponent {
  themeService = inject(ThemeService);

  scrolled = false;
  items: MenuItem[] = [
    { label: 'Home', routerLink: '/' },
    { label: 'Products', routerLink: '/products' },
    { label: 'About', routerLink: '/about' },
    { label: 'Contact Us', routerLink: '/contact' },
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50;
  }

  toggleTheme() {
    this.themeService.setTheme(!this.themeService.isDark());
  }
}

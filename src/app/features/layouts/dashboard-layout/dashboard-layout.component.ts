import { DashboardSidebarComponent } from './../components/dashboard-sidebar/dashboard-sidebar.component';
import {
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DashboardNavbarComponent } from '../components/dashboard-navbar/dashboard-navbar.component';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LayoutService } from '../services/layout.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
@Component({
  selector: 'app-dashboard-layout',
  imports: [DashboardNavbarComponent, DashboardSidebarComponent, NgClass, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [],
})
export class DashboardLayoutComponent {
  @ViewChild(DashboardSidebarComponent, { static: false }) appSidebar!: DashboardSidebarComponent;
  @ViewChild(DashboardNavbarComponent, { static: false }) navbar!: DashboardNavbarComponent;

  public layoutService = inject(LayoutService);
  public readonly renderer = inject(Renderer2);
  public readonly router = inject(Router);
  public readonly destroyRef = inject(DestroyRef);
  platformId = inject(PLATFORM_ID);

  private menuOutsideClickListener: (() => void) | null = null;

  constructor() {
    // Overlay menu open listener
    this.layoutService.overlayOpen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
          if (this.isOutsideClicked(event)) {
            this.hideMenu();
          }
        });
      }

      if (this.layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    // Hide menu on route change
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.hideMenu();
      });
  }
  isOutsideClicked(event: MouseEvent): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const sidebarEl = document.querySelector('.layout-sidebar');
      const topbarEl = document.querySelector('.layout-menu-button');
      const eventTarget = event.target as Node;

      return !(
        sidebarEl?.isSameNode(eventTarget) ||
        sidebarEl?.contains(eventTarget) ||
        topbarEl?.isSameNode(eventTarget) ||
        topbarEl?.contains(eventTarget)
      );
    }
    return false;
  }
  hideMenu(): void {
    this.layoutService.layoutState.update(prev => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }

    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) document.body.classList.add('blocked-scroll');
  }

  unblockBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) document.body.classList.remove('blocked-scroll');
  }

  get containerClass(): Record<string, boolean> {
    const layoutConfig = this.layoutService.layoutConfig();
    const layoutState = this.layoutService.layoutState();

    return {
      'layout-overlay': layoutConfig.menuMode === 'overlay',
      'layout-static': layoutConfig.menuMode === 'static',
      'layout-static-inactive':
        (layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static') || false,
      'layout-overlay-active': layoutState.overlayMenuActive || false,
      'layout-mobile-active': layoutState.staticMenuMobileActive || false,
    };
  }
}

import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private isDarkMode = signal(false);
  private PLATFORM_ID = inject(PLATFORM_ID);
  private mediaQueryList: MediaQueryList | null = null;
  private systemChangeListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      this.initializeTheme();
      this.setupSystemPreferenceListener();
    }
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      this.isDarkMode.set(prefersDark);
    }

    this.applyTheme();
  }

  private setupSystemPreferenceListener(): void {
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    this.systemChangeListener = (e: MediaQueryListEvent) => {
      // Only respond to system changes if user hasn't set an explicit preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        this.isDarkMode.set(e.matches);
        this.applyTheme();
      }
    };
    this.mediaQueryList.addEventListener('change', this.systemChangeListener);
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.applyTheme();
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  /**
   * Reset theme to follow system preference
   * This removes the saved user preference and follows system changes
   */
  resetToSystemPreference(): void {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      localStorage.removeItem('theme');
      if (this.mediaQueryList) {
        this.isDarkMode.set(this.mediaQueryList.matches);
        this.applyTheme();
      }
    }
  }

  /**
   * Check if currently following system preference (no saved theme)
   */
  isFollowingSystemPreference(): boolean {
    if (!isPlatformBrowser(this.PLATFORM_ID)) {
      return true;
    }
    return !localStorage.getItem('theme');
  }

  get isDark() {
    return this.isDarkMode.asReadonly();
  }

  ngOnDestroy(): void {
    if (this.mediaQueryList && this.systemChangeListener) {
      this.mediaQueryList.removeEventListener('change', this.systemChangeListener);
    }
  }

  private applyTheme(): void {
    const htmlElement = document.documentElement;

    if (this.isDarkMode()) {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
    }
  }
}

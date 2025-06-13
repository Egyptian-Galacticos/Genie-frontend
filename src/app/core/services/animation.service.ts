import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  private platformId = inject(PLATFORM_ID);

  // Reusable animation triggers
  static readonly fadeInUp = trigger('fadeInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]);

  static readonly fadeInDown = trigger('fadeInDown', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-30px)' }),
      animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
  ]);

  static readonly staggerFadeIn = trigger('staggerFadeIn', [
    transition(':enter', [
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ],
        { optional: true }
      ),
    ]),
  ]);

  static readonly slideInLeft = trigger('slideInLeft', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-50px)' }),
      animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
    ]),
  ]);

  static readonly scaleIn = trigger('scaleIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.8)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
  ]);

  createScrollObserver(
    elements: NodeListOf<HTMLElement>,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const defaultOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '-10% 0px -10% 0px',
      ...options,
    };

    return new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        const el = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          const delay = this.calculateDelay(el, index);
          el.style.setProperty('--animate-delay', `${delay}s`);
          el.classList.add('animate-in');
        }
      });
    }, defaultOptions);
  }

  private calculateDelay(element: HTMLElement, index: number): number {
    if (element.classList.contains('animate-item')) {
      return index * 0.2;
    }
    if (element.classList.contains('card') || element.classList.contains('feature-card')) {
      return 0.6 + index * 0.1;
    }
    return index * 0.1;
  }

  animateElements(
    container: HTMLElement,
    selectors: string[] = ['.animate-item', '.card', '.feature-card']
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    selectors.forEach(selector => {
      const elements = container.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      const observer = this.createScrollObserver(elements);

      if (observer) {
        elements.forEach(el => observer.observe(el));
      }
    });
  }
}

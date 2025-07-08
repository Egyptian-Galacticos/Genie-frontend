import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  input,
  afterNextRender,
  inject,
} from '@angular/core';

export interface AnimationConfig {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
  immediateAnimation?: boolean;
  immediateCount?: number;
}

@Directive({
  selector: '[appAnimateOnScroll]',
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef<HTMLElement>);
  private intersectionObserver?: IntersectionObserver;

  // Input signals for configuration
  config = input<AnimationConfig>({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 150,
    immediateAnimation: false,
    immediateCount: 0,
  });

  constructor() {
    afterNextRender(() => {
      this.setupAnimation();
    });
  }

  ngOnInit() {
    // Add base animation classes to the host element
    this.elementRef.nativeElement.classList.add('animate-on-scroll-container');
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupAnimation() {
    const animatedElements = this.elementRef.nativeElement.querySelectorAll('.animate-item');
    if (!animatedElements.length) return;

    const currentConfig = this.config();
    const elementsArray = Array.from(animatedElements);

    // Handle immediate animations (for hero sections, etc.)
    if (currentConfig.immediateAnimation && currentConfig.immediateCount) {
      const immediateElements = elementsArray.slice(0, currentConfig.immediateCount);
      immediateElements.forEach((element, index) => {
        setTimeout(
          () => {
            (element as HTMLElement).classList.add('animate-in');
          },
          index * (currentConfig.staggerDelay || 150)
        );
      });
    }

    // Set up intersection observer for remaining elements
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: currentConfig.threshold || 0.1,
        rootMargin: currentConfig.rootMargin || '0px 0px -50px 0px',
      }
    );

    // Observe elements (skip immediate ones if configured)
    const elementsToObserve =
      currentConfig.immediateAnimation && currentConfig.immediateCount
        ? elementsArray.slice(currentConfig.immediateCount)
        : elementsArray;

    elementsToObserve.forEach(element => {
      this.intersectionObserver!.observe(element as Element);
    });
  }
}

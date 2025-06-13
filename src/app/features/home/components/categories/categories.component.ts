import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarouselModule, CarouselResponsiveOptions } from 'primeng/carousel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../../shared/services/category.service';
import { Category } from '../../../../core/interfaces/category.interface';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, CarouselModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit, AfterViewInit, OnDestroy {
  private elementRef = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  categories: Category[] = [];
  loading = true;
  error: string | null = null;
  responsiveOptions: CarouselResponsiveOptions[] = [];

  ngOnInit(): void {
    this.setupResponsiveOptions();
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      this.setupAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupResponsiveOptions(): void {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 8,
        numScroll: 4,
      },
      {
        breakpoint: '1220px',
        numVisible: 6,
        numScroll: 3,
      },
      {
        breakpoint: '1024px',
        numVisible: 5,
        numScroll: 2,
      },
      {
        breakpoint: '768px',
        numVisible: 4,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 3,
        numScroll: 1,
      },
    ];
  }

  private loadCategories(): void {
    this.loading = true;
    this.error = null;

    this.categoryService
      .getTopLevelCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: categories => {
          this.categories = categories.filter(cat => cat.status === 'active');
          this.loading = false;

          setTimeout(() => {
            this.setupAnimations();
          }, 100);
        },
        error: error => {
          console.error('Failed to load categories:', error);
          this.error = 'Failed to load categories. Please try again later.';
          this.loading = false;
        },
      });
  }

  private setupAnimations(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const animateElements = this.elementRef.nativeElement.querySelectorAll(
      '.animate-item'
    ) as NodeListOf<HTMLElement>;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.setProperty('--animate-delay', `${index * 0.1}s`);
            el.classList.add('animate-in');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    animateElements.forEach(el => observer.observe(el));
  }

  /**
   * Get the appropriate icon for a category
   * @param category Category object
   * @returns Icon class string
   */

  getCategoryIcon(category: Category): string {
    // If the API provides a specific icon class, use it
    if (category.icon && category.icon.startsWith('pi ')) {
      return category.icon;
    }

    // If icon_url is provided, you might want to use it as an image
    if (category.icon_url) {
      return 'pi pi-image';
    }

    // Fallback to a default icon based on category name or use the icon field
    return category.icon || 'pi pi-tag';
  }

  /**
   * Retry loading categories
   */
  retryLoading(): void {
    this.loadCategories();
  }
}

import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, CarouselResponsiveOptions } from 'primeng/carousel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../../shared/services/category.service';
import { Category } from '../../../shared/utils/interfaces';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, CarouselModule, ProgressSpinnerModule, MessageModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  animationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 200,
  };

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  responsiveOptions: CarouselResponsiveOptions[] = [];

  ngOnInit(): void {
    this.setupResponsiveOptions();
    this.loadCategories();
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
    this.loading.set(true);
    this.error.set(null);

    this.categoryService
      .getTopLevelCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: categories => {
          const activeCategories = categories.filter(cat => cat.status === 'active');
          this.categories.set(activeCategories);
          this.loading.set(false);
        },
        error: error => {
          console.error('Failed to load categories:', error);
          this.error.set('Failed to load categories. Please try again later.');
          this.loading.set(false);
        },
      });
  }

  /**
   * Get the appropriate icon for a category
   * @param category Category object
   * @returns Icon class string
   */
  getCategoryIcon(category: Category): string {
    if (category.icon && category.icon.startsWith('pi ')) {
      return category.icon;
    }

    if (category.icon_url) {
      return 'pi pi-image';
    }

    return category.icon || 'pi pi-tag';
  }

  /**
   * Retry loading categories
   */
  retryLoading(): void {
    this.loadCategories();
  }
}

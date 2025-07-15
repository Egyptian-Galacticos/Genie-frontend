import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';
import { CategoryService } from '../../../shared/services/category.service';
import { Category } from '../../../shared/utils/interfaces';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonModule, CommonModule, InputTextModule, AnimateOnScrollDirective],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  searchQuery = signal('');
  categories = signal<Category[]>([]);
  loading = signal(true);

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
    }
  }

  onCategoryClick(category: Category): void {
    this.router.navigate(['/products'], { queryParams: { category_id: category.id } });
  }

  heroAnimationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 150,
    immediateAnimation: true,
    immediateCount: 6,
  };

  statsAnimationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 100,
    immediateAnimation: false,
    immediateCount: 0,
  };

  features = signal([
    {
      icon: 'pi pi-shield',
      title: 'Verified Suppliers',
      description: 'All suppliers are thoroughly vetted',
    },
    {
      icon: 'pi pi-globe',
      title: 'Global Network',
      description: 'Connect with suppliers worldwide',
    },
    {
      icon: 'pi pi-star',
      title: 'Quality Products',
      description: 'Premium products guaranteed',
    },
    {
      icon: 'pi pi-headphones',
      title: '24/7 Support',
      description: 'Round-the-clock assistance',
    },
  ]);

  stats = signal([
    { number: '50K+', label: 'Products' },
    { number: '10K+', label: 'Suppliers' },
    { number: '100+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
  ]);

  ngOnInit(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: categories => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error fetching categories:', error);
          this.loading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

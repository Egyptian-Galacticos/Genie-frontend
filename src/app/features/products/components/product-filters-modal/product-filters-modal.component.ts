import { Component, input, output, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { Category, ProductFilters } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-filters-modal',
  templateUrl: './product-filters-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    DividerModule,
    SkeletonModule,
    MessageModule,
  ],
})
export class ProductFiltersModalComponent {
  visible = input<boolean>(false);
  categories = input<Category[]>([]);
  categoriesLoading = input<boolean>(false);
  categoriesError = input<string | null>(null);
  filters = input<ProductFilters>({});

  visibleChange = output<boolean>();
  filtersChange = output<ProductFilters>();
  retryCategories = output<void>();

  tempFilters = signal<ProductFilters>({});

  constructor() {
    effect(() => {
      this.tempFilters.set({ ...this.filters() });
    });
  }

  selectedCategoryId = computed(() => this.tempFilters().category_id);

  expandedCategoryIds = computed(() => {
    const selectedId = this.selectedCategoryId();
    if (!selectedId) return new Set<number>();

    const expanded = new Set<number>();
    const categories = this.categories();

    this.findAncestors(selectedId, categories, expanded);

    return expanded;
  });

  activeFiltersCount = computed(() => {
    const filters = this.tempFilters();
    let count = 0;

    if (filters.category_id !== undefined) count++;
    if (filters.price_min !== undefined) count++;
    if (filters.price_max !== undefined) count++;
    if (filters.is_featured) count++;
    if (filters.sample_available) count++;

    return count;
  });

  private findAncestors(
    categoryId: number,
    categories: Category[],
    expanded: Set<number>
  ): boolean {
    for (const category of categories) {
      if (category.id === categoryId) {
        expanded.add(categoryId);
        return true;
      }

      if (category.children && category.children.length > 0) {
        if (this.findAncestors(categoryId, category.children, expanded)) {
          expanded.add(category.id);
          return true;
        }
      }
    }
    return false;
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.tempFilters.set({ ...this.filters() });
    }
    this.visibleChange.emit(visible);
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryId() === categoryId;
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategoryIds().has(categoryId);
  }

  onCategoryChange(categoryId: number, checked: boolean): void {
    const currentFilters = { ...this.tempFilters() };

    if (checked) {
      currentFilters.category_id = categoryId;
    } else {
      delete currentFilters.category_id;
    }

    this.tempFilters.set(currentFilters);
  }

  onLabelClick(categoryId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'keydown') {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') {
        return;
      }
    }
    const isCurrentlySelected = this.isCategorySelected(categoryId);
    this.onCategoryChange(categoryId, !isCurrentlySelected);
  }

  onPriceMinChange(value: number | null): void {
    const currentFilters = { ...this.tempFilters() };
    currentFilters.price_min = value || undefined;
    this.tempFilters.set(currentFilters);
  }

  onPriceMaxChange(value: number | null): void {
    const currentFilters = { ...this.tempFilters() };
    currentFilters.price_max = value || undefined;
    this.tempFilters.set(currentFilters);
  }

  onFeaturedChange(checked: boolean): void {
    const currentFilters = { ...this.tempFilters() };
    currentFilters.is_featured = checked ? true : undefined;
    this.tempFilters.set(currentFilters);
  }

  onSampleAvailableChange(checked: boolean): void {
    const currentFilters = { ...this.tempFilters() };
    currentFilters.sample_available = checked ? true : undefined;
    this.tempFilters.set(currentFilters);
  }

  clearAllFilters(): void {
    this.tempFilters.set({});
  }

  applyFilters(): void {
    this.filtersChange.emit(this.tempFilters());
    this.visibleChange.emit(false);
  }
}

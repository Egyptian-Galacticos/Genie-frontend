import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Category, ProductFilters } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    InputNumberModule,
    ButtonModule,
    DividerModule,
    ScrollPanelModule,
  ],
})
export class ProductFiltersComponent {
  categories = input<Category[]>([]);
  filters = input<ProductFilters>({});
  filtersChange = output<ProductFilters>();

  selectedCategoryId = computed(() => this.filters().category_id);

  expandedCategoryIds = computed(() => {
    const selectedId = this.selectedCategoryId();
    if (!selectedId) return new Set<number>();

    const expanded = new Set<number>();
    const categories = this.categories();

    this.findAncestors(selectedId, categories, expanded);

    return expanded;
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

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryId() === categoryId;
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategoryIds().has(categoryId);
  }

  onCategoryChange(categoryId: number, checked: boolean): void {
    const currentFilters = { ...this.filters() };

    if (checked) {
      currentFilters.category_id = categoryId;
    } else {
      currentFilters.category_id = undefined;
    }

    this.filtersChange.emit(currentFilters);
  }

  onPriceMinChange(value: number | null): void {
    const currentFilters = { ...this.filters() };
    currentFilters.price_min = value || undefined;
    this.filtersChange.emit(currentFilters);
  }

  onPriceMaxChange(value: number | null): void {
    const currentFilters = { ...this.filters() };
    currentFilters.price_max = value || undefined;
    this.filtersChange.emit(currentFilters);
  }

  onFeaturedChange(checked: boolean): void {
    const currentFilters = { ...this.filters() };
    currentFilters.is_featured = checked ? true : undefined;
    this.filtersChange.emit(currentFilters);
  }

  onSampleAvailableChange(checked: boolean): void {
    const currentFilters = { ...this.filters() };
    currentFilters.sample_available = checked ? true : undefined;
    this.filtersChange.emit(currentFilters);
  }

  clearAllFilters(): void {
    const emptyFilters: ProductFilters = {
      category_id: undefined,
      brand: undefined,
      price_min: undefined,
      price_max: undefined,
      is_featured: undefined,
      sample_available: undefined,
      search: undefined,
    };
    this.filtersChange.emit(emptyFilters);
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ProductSearchComponent } from '../../components/product-search/product-search.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductFiltersModalComponent } from '../../components/product-filters-modal/product-filters-modal.component';
import { ProductSortComponent } from '../../components/product-sort/product-sort.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductPaginationComponent } from '../../components/product-pagination/product-pagination.component';
import { ProductFilters, ProductSort } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import * as ProductsActions from '../../store/products.actions';
import * as ProductsSelectors from '../../store/products.selectors';

interface ProductQueryParams {
  search?: string;
  page?: string;
  category_id?: string;
  brand?: string;
  price_min?: string;
  price_max?: string;
  is_featured?: string;
  sample_available?: string;
  sort_by?: string;
  sort_direction?: string;
}

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
  providers: [MessageService],
  imports: [
    CommonModule,
    ButtonModule,
    PanelModule,
    CardModule,
    SkeletonModule,
    MessageModule,
    DialogModule,
    ToastModule,
    ProductSearchComponent,
    ProductFiltersComponent,
    ProductFiltersModalComponent,
    ProductSortComponent,
    ProductListComponent,
    ProductPaginationComponent,
  ],
})
export class ProductsPageComponent {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  private queryParams = toSignal(this.route.queryParams, { initialValue: {} });

  wishlistLoadingStates = signal<Map<number, boolean>>(new Map());

  isAiSearchMode = signal(false);

  private getQueryParam = <T>(
    key: keyof ProductQueryParams,
    defaultValue: T,
    transform?: (value: string) => T
  ): T => {
    const params = this.queryParams() as ProductQueryParams;
    const value = params[key];
    if (!value) return defaultValue;
    return transform ? transform(value) : (value as T);
  };

  search = computed(() => this.getQueryParam('search', ''));
  page = computed(() => this.getQueryParam('page', 1, v => +v));
  category_id = computed(() => this.getQueryParam('category_id', undefined, v => +v));
  brand = computed(() => this.getQueryParam('brand', undefined));
  price_min = computed(() => this.getQueryParam('price_min', undefined, v => +v));
  price_max = computed(() => this.getQueryParam('price_max', undefined, v => +v));
  is_featured = computed(() =>
    this.getQueryParam('is_featured', undefined, v =>
      v === 'true' ? true : v === 'false' ? false : undefined
    )
  );
  sample_available = computed(() =>
    this.getQueryParam('sample_available', undefined, v =>
      v === 'true' ? true : v === 'false' ? false : undefined
    )
  );
  sort_by = computed(() =>
    this.getQueryParam('sort_by', 'created_at' as 'name' | 'created_at' | 'is_featured')
  );
  sort_direction = computed(() => this.getQueryParam('sort_direction', 'desc' as 'asc' | 'desc'));

  showMobileFilters = signal(false);

  products = toSignal(this.store.select(ProductsSelectors.selectProducts), { initialValue: [] });
  productsLoading = toSignal(this.store.select(ProductsSelectors.selectProductsLoading), {
    initialValue: false,
  });
  productsError = toSignal(this.store.select(ProductsSelectors.selectProductsError), {
    initialValue: null,
  });
  productsMeta = toSignal(this.store.select(ProductsSelectors.selectProductsMeta), {
    initialValue: null,
  });
  categories = toSignal(this.store.select(ProductsSelectors.selectCategories), {
    initialValue: [],
  });
  categoriesLoading = toSignal(this.store.select(ProductsSelectors.selectCategoriesLoading), {
    initialValue: false,
  });
  categoriesError = toSignal(this.store.select(ProductsSelectors.selectCategoriesError), {
    initialValue: null,
  });

  currentFilters = computed<ProductFilters>(() => ({
    category_id: this.category_id(),
    brand: this.brand(),
    price_min: this.price_min(),
    price_max: this.price_max(),
    is_featured: this.is_featured(),
    sample_available: this.sample_available(),
    ...(this.search() && { search: this.search() }),
  }));

  currentSort = computed<ProductSort>(() => ({
    field: this.sort_by(),
    direction: this.sort_direction(),
  }));

  paginationState = computed(() => {
    const meta = this.productsMeta();

    if (meta && meta.total > 0) {
      return {
        currentPage: this.page(),
        pageSize: meta.limit,
        totalItems: meta.total,
        totalPages: meta.totalPages,
        showPagination: meta.total > meta.limit,
      };
    }

    return null;
  });

  constructor() {
    this.store.dispatch(ProductsActions.loadCategories());

    effect(() => {
      if (this.isAiSearchMode()) {
        return;
      }

      this.store.dispatch(
        ProductsActions.loadProducts({
          filters: this.currentFilters(),
          sort: this.currentSort(),
          page: this.page(),
          size: 12,
        })
      );
    });
  }

  onSearchChange(search: string) {
    this.isAiSearchMode.set(false);
    this.updateRoute({ search, page: 1 });
  }

  onAiSearchChange(query: string) {
    if (!query.trim()) {
      this.isAiSearchMode.set(false);
      this.updateRoute({ search: '', page: 1 });
      return;
    }

    this.isAiSearchMode.set(true);

    this.messageService.add({
      severity: 'info',
      summary: '🧠 AI Search Started',
      detail: 'Analyzing your query with artificial intelligence...',
      life: 2000,
      icon: 'pi pi-cog',
      styleClass:
        '!bg-gradient-to-r !from-blue-50 !to-indigo-50 !border-l-4 !border-blue-500 dark:!from-blue-900/20 dark:!to-indigo-900/20 dark:!border-blue-400',
    });

    this.productsService
      .searchProductsWithAI({
        filters: { ...this.currentFilters(), search: query },
        sort: this.currentSort(),
        page: this.page(),
        size: 12,
      })
      .subscribe({
        next: response => {
          this.store.dispatch(
            ProductsActions.loadProductsSuccess({
              products: response.data,
              meta: response.meta,
              page: 1,
            })
          );

          if (response.data.length > 0) {
            this.messageService.add({
              severity: 'success',
              summary: '🤖 AI Search Complete',
              detail: `Found ${response.data.length} products matching your AI query`,
              life: 3000,
              icon: 'pi pi-sparkles',
              styleClass:
                '!bg-gradient-to-r !from-green-50 !to-emerald-50 !border-l-4 !border-green-500 dark:!from-green-900/20 dark:!to-emerald-900/20 dark:!border-green-400',
            });
          }
        },
        error: error => {
          console.error('AI search failed:', error);
          this.store.dispatch(
            ProductsActions.loadProductsFailure({
              error: error.message || 'AI search failed. Please try again.',
            })
          );
          this.messageService.add({
            severity: 'error',
            summary: '🤖 AI Search Error',
            detail:
              'AI search failed. Please try again with a different query or switch to regular search.',
            life: 5000,
            icon: 'pi pi-sparkles',
            styleClass:
              '!bg-gradient-to-r !from-red-50 !to-rose-50 !border-l-4 !border-red-500 dark:!from-red-900/20 dark:!to-rose-900/20 dark:!border-red-400',
          });
        },
      });
  }

  onFiltersChange(filters: ProductFilters) {
    this.updateRoute({ ...filters, page: 1 });
  }

  onSortChange(sort: ProductSort) {
    this.updateRoute({ sort_by: sort.field, sort_direction: sort.direction, page: 1 });
  }

  onPageChange(page: number) {
    this.updateRoute({ page: page });
  }

  onClearFilters() {
    this.updateRoute({
      search: '',
      category_id: undefined,
      brand: undefined,
      price_min: undefined,
      price_max: undefined,
      is_featured: undefined,
      sample_available: undefined,
      page: 1,
    });
    this.showMobileFilters.set(false);
  }

  onRetry() {
    if (this.isAiSearchMode()) {
      const searchTerm = this.search();
      if (searchTerm) {
        this.onAiSearchChange(searchTerm);
      }
    } else {
      this.store.dispatch(
        ProductsActions.loadProducts({
          filters: this.currentFilters(),
          sort: this.currentSort(),
          page: this.page(),
          size: 12,
        })
      );
    }
  }

  onBrandFilter(brand: string) {
    this.updateRoute({ brand, page: 1 });
  }

  onRemoveBrandFilter() {
    this.updateRoute({ brand: undefined, page: 1 });
  }

  onRetryCategories() {
    this.store.dispatch(ProductsActions.loadCategories());
  }

  onWishlistToggle(event: { productId: number; isCurrentlyInWishlist: boolean }) {
    const { productId, isCurrentlyInWishlist } = event;

    if (!this.authService.isAuthenticated()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please log in to add items to your wishlist',
        life: 4000,
        icon: 'pi pi-exclamation-triangle',
      });
      return;
    }

    const currentStates = new Map(this.wishlistLoadingStates());
    currentStates.set(productId, true);
    this.wishlistLoadingStates.set(currentStates);

    if (isCurrentlyInWishlist) {
      this.productsService.removeFromWishlist(productId).subscribe({
        next: response => {
          if (response.success) {
            this.store.dispatch(
              ProductsActions.updateProductWishlistStatus({
                productId,
                isInWishlist: false,
              })
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Removed from Wishlist',
              detail: response.message || 'Product removed from your wishlist successfully',
              life: 3000,
              icon: 'pi pi-heart',
            });
          }
        },
        error: (error: Error) => {
          console.error('Failed to remove from wishlist:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove product from wishlist. Please try again.',
            life: 4000,
            icon: 'pi pi-exclamation-triangle',
          });

          const currentStates = new Map(this.wishlistLoadingStates());
          currentStates.delete(productId);
          this.wishlistLoadingStates.set(currentStates);
        },
        complete: () => {
          const currentStates = new Map(this.wishlistLoadingStates());
          currentStates.delete(productId);
          this.wishlistLoadingStates.set(currentStates);
        },
      });
    } else {
      this.productsService.addToWishlist(productId).subscribe({
        next: response => {
          if (response.success) {
            this.store.dispatch(
              ProductsActions.updateProductWishlistStatus({
                productId,
                isInWishlist: true,
              })
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Added to Wishlist',
              detail: response.message || 'Product added to your wishlist successfully',
              life: 3000,
              icon: 'pi pi-heart-fill',
            });
          }
        },
        error: (error: Error) => {
          console.error('Failed to add to wishlist:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add product to wishlist. Please try again.',
            life: 4000,
            icon: 'pi pi-exclamation-triangle',
          });

          const currentStates = new Map(this.wishlistLoadingStates());
          currentStates.delete(productId);
          this.wishlistLoadingStates.set(currentStates);
        },
        complete: () => {
          const currentStates = new Map(this.wishlistLoadingStates());
          currentStates.delete(productId);
          this.wishlistLoadingStates.set(currentStates);
        },
      });
    }
  }

  private updateRoute(params: Record<string, string | number | boolean | undefined>) {
    const currentParams = { ...this.route.snapshot.queryParams };
    Object.entries(params).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        currentParams[key] = null;
      } else {
        currentParams[key] = value;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
    });
  }
}

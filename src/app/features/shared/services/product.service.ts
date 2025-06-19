import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse, RequestOptions } from '../../../core/interfaces/api.interface';
import { Product } from '../../../core/interfaces/product.interface';

export interface ProductFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  search?: string;
  is_featured?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);

  /**
   * Get all products with optional filters and pagination
   * Used for: Product listings, search results
   */
  getProducts(
    filters?: ProductFilters,
    options?: RequestOptions
  ): Observable<PaginatedResponse<Product>> {
    const params = { ...filters, ...(options?.params || {}) };

    return this.api
      .get<PaginatedResponse<Product>>('products', {
        ...options,
        params,
      })
      .pipe(
        catchError(error => {
          console.error('Get products error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get a single product by ID
   * Used for: Product detail pages, wishlist item details
   */
  getProductById(productId: number): Observable<Product> {
    return this.api.get<{ success: boolean; data: Product }>(`products/${productId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch product details');
      }),
      catchError(error => {
        console.error('Get product by ID error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search products
   * Used for: Search functionality
   */
  searchProducts(
    query: string,
    filters?: ProductFilters,
    options?: RequestOptions
  ): Observable<PaginatedResponse<Product>> {
    const params = {
      search: query,
      ...filters,
      ...(options?.params || {}),
    };

    return this.getProducts(undefined, { ...options, params });
  }

  /**
   * Get featured products
   * Used for: Homepage, recommendations
   */
  getFeaturedProducts(limit = 10, options?: RequestOptions): Observable<Product[]> {
    return this.api
      .get<PaginatedResponse<Product>>('products', {
        ...options,
        params: {
          is_featured: true,
          limit,
          ...(options?.params || {}),
        },
      })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Get featured products error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get products by category
   * Used for: Category pages
   */
  getProductsByCategory(
    categoryId: number,
    options?: RequestOptions
  ): Observable<PaginatedResponse<Product>> {
    return this.getProducts({ category_id: categoryId }, options);
  }
}

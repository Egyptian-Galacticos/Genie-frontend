import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ProductsResponse,
  ProductResponse,
  CategoriesResponse,
  ProductFilters,
  ProductQuery,
  ProductsApiRequest,
  ApiFilter,
  WishlistRequest,
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
  RfqRequest,
  RfqResponse,
} from '../interfaces/product.interface';
import { AuthService } from '../../../core/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  /**
   * Main method to get products with filters
   */
  getProductsWithFilters(query: ProductQuery): Observable<ProductsResponse> {
    const apiRequest = this.buildApiRequest(query);
    return this.apiService.get<ProductsResponse>('products', { params: apiRequest });
  }

  /**
   * Get a single product by slug
   */
  getProduct(slug: string): Observable<ProductResponse> {
    if (this.authService.userRoles().includes('admin')) {
      return this.apiService.get<ProductResponse>(`admin/products/${slug}`);
    }
    return this.apiService.get<ProductResponse>(`products/${slug}`);
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<CategoriesResponse> {
    return this.apiService.get<CategoriesResponse>('categories');
  }

  /**
   * Add product to wishlist
   * Requires authentication - token will be automatically included by auth interceptor
   */
  addToWishlist(productId: number): Observable<AddToWishlistResponse> {
    const body: WishlistRequest = { product_id: productId };
    return this.apiService.post<AddToWishlistResponse>('user/wishlist', body);
  }

  /**
   * Remove product from wishlist
   * Requires authentication - token will be automatically included by auth interceptor
   */
  removeFromWishlist(productId: number): Observable<RemoveFromWishlistResponse> {
    return this.apiService.delete<RemoveFromWishlistResponse>(`user/wishlist/${productId}`);
  }

  /**
   * Create RFQ request
   * Requires authentication - token will be automatically included by auth interceptor
   */
  createRfq(rfqData: RfqRequest): Observable<RfqResponse> {
    return this.apiService.post<RfqResponse>('rfqs', rfqData);
  }

  /**
   * AI-powered product search
   */
  searchProductsWithAI(query: string): Observable<ProductsResponse> {
    return this.apiService.get<ProductsResponse>(
      `products/ai/search?search=${encodeURIComponent(query)}`
    );
  }

  /**
   * Convert frontend query to API request format
   */
  private buildApiRequest(query: ProductQuery): ProductsApiRequest {
    const request: ProductsApiRequest = {
      page: query.page,
      size: query.size,
    };

    if (query.sort) {
      request.sortFields = query.sort.field;
      request.sortOrders = query.sort.direction;
    }

    if (query.filters.search) {
      request['search'] = query.filters.search;
    }

    const filters = this.buildFilters(query.filters);

    const fieldIndexes: Record<string, number> = {};

    filters.forEach(filter => {
      if (fieldIndexes[filter.field] === undefined) {
        fieldIndexes[filter.field] = 0;
      }
      const index = fieldIndexes[filter.field];
      request[`filter_${filter.field}_${index}`] = filter.value;
      request[`filter_${filter.field}_${index}_mode`] = filter.mode;
      fieldIndexes[filter.field]++;
    });

    return request;
  }

  /**
   * Convert ProductFilters to array of ApiFilter objects
   */
  private buildFilters(filters: ProductFilters): ApiFilter[] {
    const apiFilters: ApiFilter[] = [];

    if (filters.category_id !== undefined) {
      apiFilters.push({
        field: 'category.id',
        value: filters.category_id,
        mode: 'equals',
      });
    }

    if (filters.brand) {
      apiFilters.push({
        field: 'brand',
        value: filters.brand,
        mode: 'equals',
      });
    }

    if (filters.price_min !== undefined) {
      apiFilters.push({
        field: 'price',
        value: filters.price_min,
        mode: 'gte',
      });
    }

    if (filters.price_max !== undefined) {
      apiFilters.push({
        field: 'price',
        value: filters.price_max,
        mode: 'lte',
      });
    }

    if (filters.is_featured !== undefined) {
      apiFilters.push({
        field: 'is_featured',
        value: filters.is_featured ? 1 : 0,
        mode: 'equals',
      });
    }

    if (filters.sample_available !== undefined) {
      apiFilters.push({
        field: 'sample_available',
        value: filters.sample_available ? 1 : 0,
        mode: 'equals',
      });
    }

    return apiFilters;
  }
}

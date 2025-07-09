import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../utils/interfaces';
import {
  ApiResponse,
  PaginatedResponse,
  RequestOptions,
} from '../../../core/interfaces/api.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiService = inject(ApiService);

  /**
   * Fetch all categories from the API
   * @returns Observable of categories array
   */
  getCategories(): Observable<Category[]> {
    return this.apiService.get<ApiResponse<Category[]>>('categories').pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching categories:', error);
        // Return empty array on error to prevent app crash
        return of([]);
      })
    );
  }

  /**
   * Get categories filtered by status
   * @param status Category status to filter by
   * @returns Observable of filtered categories
   */
  getCategoriesByStatus(status = 'active'): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories => categories.filter(category => category.status === status))
    );
  }

  /**
   * Get top-level categories (parent_id is null)
   * @returns Observable of top-level categories
   */
  getTopLevelCategories(): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories => categories.filter(category => category.parent_id === null))
    );
  }

  /**
   * Get categories for admin with pagination and filtering
   * @param requestOptions Request options with pagination and filters
   * @returns Observable of paginated categories
   */
  getCategoriesForAdmin(requestOptions: RequestOptions): Observable<PaginatedResponse<Category>> {
    return this.apiService.get<PaginatedResponse<Category>>('admin/categories', requestOptions);
  }

  /**
   * Approve a category
   * @param id Category ID to approve
   * @returns Observable of API response
   */
  approveCategory(id: number): Observable<ApiResponse<Category>> {
    return this.apiService.put<ApiResponse<Category>>(`admin/categories/${id}`, {
      status: 'active',
    });
  }

  /**
   * Delete category for admin
   * @param id Category ID to delete
   * @returns Observable of API response
   */
  deleteCategoryForAdmin(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`admin/categories/${id}`);
  }
}

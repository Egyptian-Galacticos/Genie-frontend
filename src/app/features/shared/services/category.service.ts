import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Category, CategoryResponse } from '../../../core/interfaces/category.interface';

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
    return this.apiService.get<CategoryResponse>('categories').pipe(
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
}

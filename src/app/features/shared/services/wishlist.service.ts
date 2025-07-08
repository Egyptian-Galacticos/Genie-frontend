import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError, of, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Product, WishlistResponse } from '../../../core/interfaces/product.interface';
import { ApiResponse } from '../../../core/interfaces/api.interface';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = inject(ApiService);

  getWishlist(): Observable<Product[]> {
    return this.api.get<WishlistResponse>('user/wishlist').pipe(
      map(res => {
        if (res.success && res.data) {
          return res.data;
        }
        throw new Error(res.message || 'Failed to fetch wishlist');
      }),
      catchError(error => {
        console.error('Wishlist service error:', error);
        return throwError(() => error);
      })
    );
  }
  
  removeFromWishlist(productId: number): Observable<ApiResponse> {
    return this.api.delete<ApiResponse>(`user/wishlist/${productId}`).pipe(
      catchError(error => {
        console.error('Remove from wishlist error:', error);
        return throwError(() => error);
      })
    );
  }

  addToWishlist(productId: number): Observable<ApiResponse> {
    return this.api.post<ApiResponse>('user/wishlist', { product_id: productId }).pipe(
      catchError(error => {
        console.error('Add to wishlist error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if a product is in the wishlist
   * @param productId Product ID to check
   * @returns Observable of boolean
   */
  isProductInWishlist(productId: number): Observable<boolean> {
    return this.getWishlist().pipe(
      map(products => products.some(product => product.id === productId)),
      catchError(() => of(false))
    );
  }

  /**
   * Get wishlist count
   * @returns Observable of number of items in wishlist
   */
  getWishlistCount(): Observable<number> {
    return this.getWishlist().pipe(
      map(products => products.length),
      catchError(() => of(0))
    );
  }

  /**
   * Toggle product in/out of wishlist
   * @param productId Product ID to toggle
   * @returns Observable indicating if product was added (true) or removed (false)
   */
  toggleWishlist(productId: number): Observable<boolean> {
    return this.isProductInWishlist(productId).pipe(
      switchMap(isInWishlist => {
        if (isInWishlist) {
          return this.removeFromWishlist(productId).pipe(map(() => false));
        } else {
          return this.addToWishlist(productId).pipe(map(() => true));
        }
      }),
      catchError(error => {
        console.error('Toggle wishlist error:', error);
        return throwError(() => error);
      })
    );
  }
}

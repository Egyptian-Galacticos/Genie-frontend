import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Product } from '../../../core/interfaces/product.interface';
import { WishlistService } from '../../shared/services/wishlist.service';
import { ProductCardComponent } from '../components/product-card/product-card.component';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.error = 'Please log in to view your wishlist.';
      this.isLoading = false;
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
      return;
    }

    this.loadWishlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWishlist(): void {
    this.isLoading = true;
    this.error = null;

    if (!this.authService.isAuthenticated()) {
      this.handleError(
        new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { message: 'User not authenticated' },
        })
      );
      return;
    }

    this.wishlistService
      .getWishlist()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.products = data;
          this.isLoading = false;
        },
        error: error => {
          console.error('Wishlist loading error:', error);
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    this.isLoading = false;
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error,
    });

    if (
      error.status === 401 ||
      (error.status === 0 && error.message?.includes('refresh token')) ||
      error.message?.includes('No refresh token available')
    ) {
      this.error = 'Your session has expired. Please log in again.';
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }, 2000);
    } else if (error.status === 0) {
      this.error = 'Unable to connect to the server. Please check your connection and try again.';
    } else if (error.status === 403) {
      this.error = 'You do not have permission to access the wishlist.';
    } else {
      this.error = error.error?.message || 'Failed to load wishlist. Please try again later.';
    }
  }

  onRemove(id: number): void {
    this.wishlistService
      .removeFromWishlist(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
        },
        error: (error: HttpErrorResponse) => {
          if (
            error.status === 401 ||
            (error.status === 0 && error.message?.includes('refresh token'))
          ) {
            this.error = 'Your session has expired. Please log in again.';
            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.error = 'Failed to remove item. Please try again.';
          }
        },
      });
  }
}

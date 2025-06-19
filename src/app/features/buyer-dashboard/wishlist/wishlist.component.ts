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
    this.loadWishlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWishlist(): void {
    this.isLoading = true;
    this.error = null;

    this.wishlistService
      .getWishlist()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.products = data;
          this.isLoading = false;
        },
        error: error => {
          this.handleError(error);
        },
      });
  }

  private handleError(error: HttpErrorResponse): void {
    this.isLoading = false;

    if (error.status === 401) {
      this.error = 'Your session has expired. Please log in again.';
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }, 2000);
    } else {
      this.error = 'Failed to load wishlist. Please try again later.';
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
        error: error => {
          this.error = 'Failed to remove item. Please try again.' + error.message;
        },
      });
  }
}

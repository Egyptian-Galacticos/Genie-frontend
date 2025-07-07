import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [CommonModule, ProductCardComponent],
})
export class ProductListComponent {
  products = input.required<Product[]>();
  wishlistLoadingStates = input<Map<number, boolean>>(new Map());
  brandFilterRequested = output<string>();
  wishlistToggleRequested = output<{ productId: number; isCurrentlyInWishlist: boolean }>();

  onBrandFilterRequested(brand: string) {
    this.brandFilterRequested.emit(brand);
  }

  onWishlistToggleRequested(event: { productId: number; isCurrentlyInWishlist: boolean }) {
    this.wishlistToggleRequested.emit(event);
  }

  isWishlistLoading(productId: number): boolean {
    return this.wishlistLoadingStates().get(productId) || false;
  }
}

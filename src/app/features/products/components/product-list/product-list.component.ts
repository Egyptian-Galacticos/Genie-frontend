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
  brandFilterRequested = output<string>();

  onBrandFilterRequested(brand: string) {
    this.brandFilterRequested.emit(brand);
  }
}

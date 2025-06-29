import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../../core/interfaces/product.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() remove = new EventEmitter<number>();

  onRemove() {
    this.remove.emit(this.product.id);
  }
}

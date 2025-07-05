import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ProductSort } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product-sort',
  templateUrl: './product-sort.component.html',
  imports: [SelectModule, FormsModule],
})
export class ProductSortComponent {
  sortValue = input<ProductSort>({ field: 'created_at', direction: 'desc' });
  sortChange = output<ProductSort>();

  sortOptions = [
    { label: 'Newest First', value: 'created_at-desc' },
    { label: 'Oldest First', value: 'created_at-asc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' },
    { label: 'Featured First', value: 'is_featured-desc' },
  ];

  currentSortValue = signal('created_at-desc');

  onSortChange(value: string): void {
    if (!value) return;

    const [field, direction] = value.split('-');

    this.sortChange.emit({
      field: field as ProductSort['field'],
      direction: direction as ProductSort['direction'],
    });
  }
}

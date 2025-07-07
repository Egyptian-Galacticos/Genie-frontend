import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-product-pagination',
  imports: [CommonModule, PaginatorModule],
  templateUrl: './product-pagination.component.html',
})
export class ProductPaginationComponent {
  currentPage = input.required<number>();
  pageSize = input.required<number>();
  totalItems = input.required<number>();

  pageChange = output<number>();

  onPageChange(event: PaginatorState): void {
    const page = (event.page ?? 0) + 1;
    this.pageChange.emit(page);
  }
}

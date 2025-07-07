import { ProductService } from './../../../shared/services/product.service';
import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { IProduct } from '../../../shared/utils/interfaces';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import { RequestOptions } from '../../../../core/interfaces/api.interface';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-pending-products',
  templateUrl: './pending-products.component.html',
  imports: [DataTableComponent, ButtonModule, DatePipe, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
})
export class PendingProductsComponent {
  productService = inject(ProductService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  pendingProducts = model<IProduct[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  // Fetch pending products from the service
  getPendingProducts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);
    requestOptions.params = {
      ...requestOptions.params,
      filter_is_approved_0: '0',
      filter_is_approved_0_mode: 'equals',
    };

    this.productService.getProductsForAdmin(requestOptions).subscribe({
      next: response => {
        this.pendingProducts.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('Pending products fetched successfully:', this.pendingProducts());
      },
      error: error => {
        console.error('Error fetching pending products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch pending products. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  approveProduct(productId: number) {
    this.productService.approveProduct(productId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Product Approved',
          detail: 'The product has been successfully approved.',
        });
        // Refresh the pending products list after approval
        this.getPendingProducts(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error approving product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: 'Failed to approve the product. Please try again later.',
        });
      },
    });
  }

  deleteProduct(productId: number) {
    this.productService.deleteProductForAdmin(productId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Product Rejected',
          detail: 'The product has been successfully rejected and removed.',
        });
        // Refresh the pending products list after rejection
        this.getPendingProducts(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error rejecting product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Rejection Failed',
          detail: 'Failed to reject the product. Please try again later.',
        });
      },
    });
  }

  rejectProduct(product: IProduct): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this product? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProduct(product.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }
  cols = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Product Name', sortable: true, filterable: true },
    { field: 'brand', header: 'Brand', sortable: true, filterable: true },
    { field: 'category.name', header: 'Category', sortable: true, filterable: true },
    { field: 'sku', header: 'SKU' },
    { field: 'seller', header: 'Seller' },
    { field: 'created_at', header: 'Creation Date', sortable: true },
    { field: 'actions', header: 'Actions' },
  ];
}

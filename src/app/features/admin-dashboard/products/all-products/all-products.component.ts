import { DrawerModule } from 'primeng/drawer';
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
import { Store } from '@ngrx/store';
import * as ProductsActions from '../../../products/store/products.actions';
import { ProductDetailComponent } from '../../../products/pages/product-detail/product-detail.component';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  imports: [
    DataTableComponent,
    ButtonModule,
    DatePipe,
    ToastModule,
    ConfirmDialogModule,
    DrawerModule,
    ProductDetailComponent,
    BadgeModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class AllProductsComponent {
  productService = inject(ProductService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  store = inject(Store);

  allProducts = model<IProduct[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;
  viewVisible = signal<boolean>(false);
  beingViewedProduct = model<IProduct | null>(null);

  // Fetch all products from the service
  getAllProducts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);

    this.productService.getProductsForAdmin(requestOptions).subscribe({
      next: response => {
        this.allProducts.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('All products fetched successfully:', this.allProducts());
      },
      error: error => {
        console.error('Error fetching all products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch products. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  deactivateProduct(productId: number) {
    this.productService.disproveProduct(productId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Product Deactivated',
          detail: 'The product has been successfully deactivated.',
        });
        // Refresh the products list after status change
        this.getAllProducts(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error updating product status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Status Update Failed',
          detail: 'Failed to update the product status. Please try again later.',
        });
      },
    });
  }

  deleteProduct(productId: number) {
    this.productService.deleteProductForAdmin(productId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Product Deleted',
          detail: 'The product has been successfully deleted.',
        });
        // Refresh the products list after deletion
        this.getAllProducts(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error deleting product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Deletion Failed',
          detail: 'Failed to delete the product. Please try again later.',
        });
      },
    });
  }

  confirmDeleteProduct(product: IProduct): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
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

  confirmDeactivateProduct(product: IProduct): void {
    const action = product.is_active ? 'deactivate' : 'activate';
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} "${product.name}"?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Confirmation`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deactivateProduct(product.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  viewProductDetails(product: IProduct) {
    this.store.dispatch(ProductsActions.loadProduct({ slug: product.id.toString() }));
    this.viewVisible.set(true);
    this.beingViewedProduct.set(product);
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Product Name', sortable: true, filterable: true },
    { field: 'brand', header: 'Brand', sortable: true, filterable: true },
    { field: 'category.name', header: 'Category', sortable: true, filterable: true },
    { field: 'sku', header: 'SKU' },
    { field: 'seller', header: 'Seller' },
    { field: 'is_active', header: 'Status', sortable: true },
    { field: 'created_at', header: 'Creation Date', sortable: true },
    { field: 'actions', header: 'Actions' },
  ];
}

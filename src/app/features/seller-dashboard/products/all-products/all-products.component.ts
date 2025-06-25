import { RequestOptions } from './../../../../core/interfaces/api.interface';
import { ProductService } from './../../../shared/services/product.service';
import { BadgeModule } from 'primeng/badge';
import { Component, inject, model } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ButtonModule } from 'primeng/button';
import { DashboardInfoCardComponent } from '../../../shared/dashboard-info-card/dashboard-info-card.component';
import { ToastModule } from 'primeng/toast';
import { IProduct } from '../../../shared/utils/interfaces';
import { PaginatedResponse } from '../../../../core/interfaces/api.interface';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-all-products',
  imports: [
    DataTableComponent,
    ButtonModule,
    BadgeModule,
    DashboardInfoCardComponent,
    ToastModule,
    TableModule,
    ToggleSwitchModule,
    FormsModule,
    DrawerModule,
    EditProductComponent,
    ConfirmDialogModule,
  ],
  templateUrl: './all-products.component.html',
  providers: [MessageService, ConfirmationService],
})
export class AllProductsComponent {
  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  private router = inject(Router);

  productsResponse: PaginatedResponse<IProduct> | null = null;
  ProductsLoading = true;
  limit!: number;
  total_records!: number;
  total_pages!: number;
  multiSortMeta: SortMeta[] = [
    { field: 'created_at', order: -1 },
    { field: 'name', order: 1 },
  ];
  currentRequestOptions!: RequestOptions;
  selectedItems = model<IProduct[]>([]);
  updateVisible = false;
  beingUpdatedProduct!: IProduct;
  // table columns definition
  cols = [
    {
      field: 'select',
      header: '',
    },
    {
      field: 'id',
      header: 'ID',
      filterableColumn: false,
    },

    {
      field: 'image',
      header: 'Image',
    },
    {
      field: 'name',
      header: 'Name',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'category.name',
      header: 'Category',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'is_approved',
      header: 'Approved',
      sortableColumn: true,
      filterableColumn: false,
      filterType: 'selectTrueFalse',
      options: ['Approved', 'Not Approved'],
    },
    {
      field: 'is_active',
      header: 'Active',
      sortableColumn: true,
      filterableColumn: false,
      filterType: 'selectTrueFalse',
      options: ['Active', 'Not Active'],
    },
    {
      field: 'is_featured',
      header: 'Featured',
      sortableColumn: true,
      filterableColumn: false,
      filterType: 'selectTrueFalse',
      options: ['Featured', 'Not Featured'],
    },
    { field: 'actions', header: 'Actions', filterableColumn: false, filterType: 'clear' },
  ];

  loadMyyProducts(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    if (requestOptions.params) {
      requestOptions.params['sortFields'] += ',created_at';
      requestOptions.params['sortOrders'] += ',desc';
    }
    this.ProductsLoading = true;
    this.productService.getMyProducts(requestOptions).subscribe({
      next: response => {
        this.productsResponse = response;
        this.total_pages = response.meta.totalPages;
        this.total_records = response.meta.total;
        this.limit = response.meta.limit;
        this.ProductsLoading = false;
      },
      error: error => {
        this.showError(error.message);
        this.ProductsLoading = false;
      },
    });
  }

  updateProductActiveStatus(product: IProduct, isActive: boolean) {
    this.productService.updateProductActiveStatus(product.id, isActive).subscribe({
      next: response => {
        this.showSuccess(response?.message || 'Product active status updated successfully!');
      },
      error: error => {
        this.showError(error.message);
        product.is_active = !product.is_active;
      },
    });
  }
  updateProductFeaturedStatus(product: IProduct, isFeatured: boolean) {
    this.productService.updateProductFeaturedStatus(product.id, isFeatured).subscribe({
      next: response => {
        this.showSuccess(response?.message || 'Product featured status updated successfully!');
      },
      error: error => {
        this.showError(error.message);
        product.is_featured = !product.is_featured;
      },
    });
  }

  openUpdateProductModal(product: IProduct) {
    this.productService.getProduct(product.slug).subscribe({
      next: response => {
        this.beingUpdatedProduct = response.data;
        this.updateVisible = true;
      },
      error: error => {
        this.showError(error.message);
      },
    });
  }
  productUpdated() {
    this.updateVisible = false;
    this.loadMyyProducts(this.currentRequestOptions);
  }
  viewProductDetails(product: IProduct) {
    this.router.navigate([`/products/${product.slug}`]);
  }

  deleteProduct(product: IProduct) {
    this.productService.DeleteProduct(product.id).subscribe({
      next: response => {
        this.showSuccess(response?.message || 'Product deleted successfully!');
        this.loadMyyProducts(this.currentRequestOptions);
      },
      error: error => {
        this.showError(error.message);
      },
    });
  }

  // utility functions
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  confirmDeleteProduct(product: IProduct): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this product? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProduct(product);
        this.showSuccess(`Product ${product.name} deleted successfully!`);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }
}

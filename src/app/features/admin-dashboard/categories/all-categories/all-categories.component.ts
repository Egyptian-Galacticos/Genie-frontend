import { CategoryService } from './../../../shared/services/category.service';
import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Category } from '../../../shared/utils/interfaces';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import {
  RequestOptions,
  PaginatedResponse,
  ApiError,
} from '../../../../core/interfaces/api.interface';
import { ButtonModule } from 'primeng/button';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-all-categories',
  templateUrl: './all-categories.component.html',
  imports: [
    DataTableComponent,
    ButtonModule,
    DatePipe,
    ToastModule,
    ConfirmDialogModule,
    NgClass,
    TitleCasePipe,
  ],
  providers: [MessageService, ConfirmationService],
})
export class AllCategoriesComponent {
  categoryService = inject(CategoryService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  allCategories = model<Category[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  // Fetch all categories from the service
  getAllCategories(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);

    this.categoryService.getCategoriesForAdmin(requestOptions).subscribe({
      next: (response: PaginatedResponse<Category>) => {
        this.allCategories.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('All categories fetched successfully:', this.allCategories());
      },
      error: (error: Error) => {
        console.error('Error fetching all categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch categories. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  deactivateCategory(categoryId: number) {
    this.categoryService.deactivateCategory(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Category Deactivated',
          detail: 'The category has been successfully deactivated.',
        });
        // Refresh the categories list after deactivation
        this.getAllCategories(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error deactivating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Deactivation Failed',
          detail: error.message || 'Failed to deactivate the category. Please try again later.',
        });
      },
    });
  }

  activateCategory(categoryId: number) {
    this.categoryService.activateCategory(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Category Activated',
          detail: 'The category has been successfully activated.',
        });
        // Refresh the categories list after activation
        this.getAllCategories(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error activating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Activation Failed',
          detail: error.message || 'Failed to activate the category. Please try again later.',
        });
      },
    });
  }

  deleteCategory(categoryId: number) {
    this.categoryService.deleteCategoryForAdmin(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Category Deleted',
          detail: 'The category has been successfully deleted.',
        });
        // Refresh the categories list after deletion
        this.getAllCategories(this.currentRequestOptions);
      },
      error: (error: ApiError) => {
        let errorMessage = '';
        if (error.errors) {
          Object.values(error.errors).forEach(value => (errorMessage += value + ' '));
        } else
          errorMessage = error.message || 'Failed to delete the category. Please try again later.';
        console.error('Error deleting category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Deletion Failed',
          detail: errorMessage,
        });
      },
    });
  }

  confirmDeactivateCategory(category: Category): void {
    const action = category.status === 'active' ? 'deactivate' : 'activate';
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} the category "${category.name}"?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Category Confirmation`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (category.status === 'active') {
          this.deactivateCategory(category.id);
        } else {
          this.activateCategory(category.id);
        }
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  confirmDeleteCategory(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
      header: 'Delete Category Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteCategory(category.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  getCategoryStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'danger';
      default:
        return 'info';
    }
  }

  cols = [
    { field: 'id', header: 'ID' },
    {
      field: 'name',
      header: 'Category Name',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'input',
      matchMode: 'contains',
    },
    { field: 'slug', header: 'Slug' },
    {
      field: 'level',
      header: 'Level',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'select',
      options: ['0', '1', '2'],
    },
    { field: 'parent.name', header: 'Parent Category' },
    {
      field: 'status',
      header: 'Status',
      sortableColumn: true,
      filterableColumn: true,
      filterType: 'select',
      options: ['active', 'pending', 'inactive'],
    },
    { field: 'creator.full_name', header: 'Created By' },
    { field: 'created_at', header: 'Creation Date', sortableColumn: true },
    { field: 'actions', header: 'Actions', filterType: 'clear' },
  ];
}

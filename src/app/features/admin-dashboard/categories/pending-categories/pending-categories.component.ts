import { CategoryService } from './../../../shared/services/category.service';
import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Category } from '../../../shared/utils/interfaces';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import { RequestOptions, PaginatedResponse } from '../../../../core/interfaces/api.interface';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-pending-categories',
  templateUrl: './pending-categories.component.html',
  imports: [DataTableComponent, ButtonModule, DatePipe, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
})
export class PendingCategoriesComponent {
  categoryService = inject(CategoryService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  pendingCategories = model<Category[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  // Fetch pending categories from the service
  getPendingCategories(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);
    requestOptions.params = {
      ...requestOptions.params,
      filter_status_0: 'pending',
      filter_status_0_mode: 'equals',
    };

    this.categoryService.getCategoriesForAdmin(requestOptions).subscribe({
      next: (response: PaginatedResponse<Category>) => {
        console.log('Fetching pending categories with options:', requestOptions);
        this.pendingCategories.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('Pending categories fetched successfully:', this.pendingCategories());
      },
      error: (error: Error) => {
        console.error('Error fetching pending categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch pending categories. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  approveCategory(categoryId: number) {
    this.categoryService.approveCategory(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Category Approved',
          detail: 'The category has been successfully approved.',
        });
        // Refresh the pending categories list after approval
        this.getPendingCategories(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error approving category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: 'Failed to approve the category. Please try again later.',
        });
      },
    });
  }

  deleteCategory(categoryId: number) {
    this.categoryService.deleteCategoryForAdmin(categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Category Rejected',
          detail: 'The category has been successfully rejected and removed.',
        });
        // Refresh the pending categories list after rejection
        this.getPendingCategories(this.currentRequestOptions);
      },
      error: (error: Error) => {
        console.error('Error rejecting category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Rejection Failed',
          detail: 'Failed to reject the category. Please try again later.',
        });
      },
    });
  }

  rejectCategory(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteCategory(category.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Category Name', sortable: true, filterable: true },
    { field: 'slug', header: 'Slug', sortable: true, filterable: true },
    { field: 'level', header: 'Level', sortable: true },
    { field: 'parent.name', header: 'Parent Category', sortable: true, filterable: true },
    { field: 'creator.full_name', header: 'Created By' },
    { field: 'created_at', header: 'Creation Date', sortable: true },
    { field: 'actions', header: 'Actions' },
  ];
}

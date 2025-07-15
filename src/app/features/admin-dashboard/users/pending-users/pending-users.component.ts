import { UserService } from './../../../shared/services/user.service';
import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { IUser, MediaResource } from '../../../shared/utils/interfaces';
import { MessageService, SortMeta } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RequestOptions } from '../../../../core/interfaces/api.interface';
import { DocumentGalleryComponent } from './components/document-gallery/document-gallery.component';

@Component({
  selector: 'app-pending-users',
  templateUrl: './pending-users.component.html',
  imports: [DataTableComponent, ButtonModule, DocumentGalleryComponent],
  providers: [MessageService],
})
export class PendingUsersComponent {
  userService = inject(UserService);
  messageService = inject(MessageService);

  pendingUsers = model<IUser[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  taxIdGalleryVisible = signal<boolean>(false);
  commercialRegGalleryVisible = signal<boolean>(false);
  currentTaxIdImages = signal<MediaResource[]>([]);
  currentCommercialRegImages = signal<MediaResource[]>([]);

  // Fetch pending users from the service
  getPendingUsers(requestOptions: RequestOptions) {
    console.log('Fetching pending users with options:', requestOptions);
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);
    requestOptions.params = {
      ...requestOptions.params,
      status: 'pending',
    };

    this.userService.getUsers(requestOptions).subscribe({
      next: response => {
        this.pendingUsers.set(response.data);
        console.log(this.pendingUsers());
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('Pending users fetched successfully:', this.pendingUsers());
      },
      error: error => {
        console.error('Error fetching pending users:', error);
        this.loading.set(false);
      },
    });
  }

  approveUser(userId: number) {
    this.userService.approveUser(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Approved',
          detail: 'The user has been successfully approved.',
        });
        // Refresh the pending users list after approval
        this.getPendingUsers(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error approving user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: 'Failed to approve the user. Please try again later.',
        });
      },
    });
  }

  openTaxIdGallery(images: MediaResource[]) {
    if (images && images.length > 0) {
      console.log('Opening Tax ID gallery with', images.length, 'images:', images);
      this.currentTaxIdImages.set(images);
      this.taxIdGalleryVisible.set(true);
    } else {
      console.log('No Tax ID images available');
    }
  }

  openCommercialRegGallery(images: MediaResource[]) {
    if (images && images.length > 0) {
      console.log('Opening Commercial Registration gallery with', images.length, 'images:', images);
      this.currentCommercialRegImages.set(images);
      this.commercialRegGalleryVisible.set(true);
    } else {
      console.log('No Commercial Registration images available');
    }
  }

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Name' },
    { field: 'company.name', header: 'Company Name', sortable: true, filterable: true },
    { field: 'phone_number', header: 'Phone Number' },
    { field: 'email', header: 'Email' },
    { field: 'tax_id', header: 'Tax ID' },
    { field: 'commercial_registration', header: 'CR' },
    { field: 'actions', header: 'Actions' },
  ];
}

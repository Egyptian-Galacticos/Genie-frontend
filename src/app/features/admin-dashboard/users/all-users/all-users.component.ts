import { UserService } from './../../../shared/services/user.service';
import { Component, inject, model, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { IUser } from '../../../shared/utils/interfaces';
import { ConfirmationService, MessageService, SortMeta } from 'primeng/api';
import { RequestOptions } from '../../../../core/interfaces/api.interface';
import { ButtonModule } from 'primeng/button';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
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
export class AllUsersComponent {
  userService = inject(UserService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  allUsers = model<IUser[]>([]);
  loading = signal<boolean>(true);
  total_records = model<number>(0);
  total_pages = model<number>(0);
  limit = model<number>(10);
  SortMeta = model<SortMeta[]>([{ field: 'created_at', order: -1 }]);
  currentRequestOptions!: RequestOptions;

  // Fetch all users from the service
  getAllUsers(requestOptions: RequestOptions) {
    this.currentRequestOptions = requestOptions;
    this.loading.set(true);

    this.userService.getUsers(requestOptions).subscribe({
      next: response => {
        this.allUsers.set(response.data);
        this.total_pages.set(response.meta.totalPages);
        this.total_records.set(response.meta.total);
        this.limit.set(response.meta.limit);
        this.loading.set(false);
        console.log('All users fetched successfully:', this.allUsers());
      },
      error: error => {
        console.error('Error fetching all users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fetch Failed',
          detail: 'Failed to fetch users. Please try again later.',
        });
        this.loading.set(false);
      },
    });
  }

  deactivateSeller(userId: number) {
    this.userService.deactivateSeller(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Seller Deactivated',
          detail: 'The seller has been successfully deactivated.',
        });
        // Refresh the users list after deactivation
        this.getAllUsers(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error deactivating seller:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Deactivation Failed',
          detail: 'Failed to deactivate the seller. Please try again later.',
        });
      },
    });
  }

  suspendUser(userId: number) {
    this.userService.suspendUser(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Suspended',
          detail: 'The user has been successfully suspended.',
        });
        // Refresh the users list after suspension
        this.getAllUsers(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error suspending user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Suspension Failed',
          detail: 'Failed to suspend the user. Please try again later.',
        });
      },
    });
  }

  activateUser(userId: number) {
    this.userService.activateUser(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Activated',
          detail: 'The user has been successfully activated.',
        });
        // Refresh the users list after activation
        this.getAllUsers(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error activating user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Activation Failed',
          detail: 'Failed to activate the user. Please try again later.',
        });
      },
    });
  }

  activateSeller(userId: number) {
    this.userService.activateSeller(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Seller Activated',
          detail: 'The seller has been successfully activated.',
        });
        // Refresh the users list after seller activation
        this.getAllUsers(this.currentRequestOptions);
      },
      error: error => {
        console.error('Error activating seller:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Seller Activation Failed',
          detail: 'Failed to activate the seller. Please try again later.',
        });
      },
    });
  }

  confirmDeactivateSeller(user: IUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate seller "${user.full_name}"?`,
      header: 'Deactivate Seller Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deactivateSeller(user.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  confirmSuspendUser(user: IUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to suspend user "${user.full_name}"?`,
      header: 'Suspend User Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.suspendUser(user.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  confirmActivateUser(user: IUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to activate user "${user.full_name}"?`,
      header: 'Activate User Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.activateUser(user.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  confirmActivateSeller(user: IUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to activate seller access for "${user.full_name}"?`,
      header: 'Activate Seller Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.activateSeller(user.id);
      },
      reject: () => {
        // User cancelled - no action needed
      },
    });
  }

  getUserStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'danger';
      case 'inactive':
        return 'secondary';
      default:
        return 'info';
    }
  }

  isUserSeller(user: IUser): boolean {
    return user.roles?.includes('seller') || false;
  }

  isPendingBuyerWithSellerAccess(user: IUser): boolean {
    return user.status === 'pending';
  }

  formatUserRoles(roles: string[] | undefined): string {
    if (!roles || roles.length === 0) {
      return 'User';
    }

    // Capitalize each role and join with comma and space
    return roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ');
  }

  cols = [
    { field: 'id', header: 'ID' },
    { field: 'first_name', header: 'Full Name', sortableColumn: true, filterable: true },
    { field: 'email', header: 'Email', sortableColumn: true, filterable: true },
    { field: 'company.name', header: 'Company Name', sortableColumn: false, filterable: false },
    {
      field: 'phone_number',
      header: 'Phone Number',
      sortableColumn: false,
      filterableColumn: false,
      filterType: 'input',
      matchMode: 'contains',
    },
    {
      field: 'roles',
      header: 'Role',
      sortableColumn: false,
      filterableColumn: false,
      filterType: 'select',
      matchMode: 'contains',
      options: ['buyer', 'seller'],
    },
    {
      field: 'status',
      header: 'Status',
      sortableColumn: true,
      filterableColumn: false,
      filterType: 'select',
      options: ['active', 'pending', 'suspended'],
    },
    { field: 'created_at', header: 'Created Date', sortableColumn: true, filterableColumn: true },
    { field: 'actions', header: 'Actions' },
  ];
}

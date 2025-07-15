import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { NotificationService, type Notification } from '../../../services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule,
    PopoverModule,
    AvatarModule,
    DividerModule,
    RippleModule,
    TooltipModule,
    SkeletonModule,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private themeService = inject(ThemeService);

  readonly notifications = this.notificationService.notifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly isInitialized = this.notificationService.isInitialized;
  readonly isLoading = this.notificationService.isLoading;

  readonly hasNotifications = computed(() => this.notifications().length > 0);
  readonly hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  readonly isDark = this.themeService.isDark;

  readonly skeletonItems = [1, 2, 3];

  ngOnInit(): void {
    this.notificationService.initializeNotifications();
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notification: Notification, event: Event): Promise<void> {
    event.stopPropagation();
    await this.notificationService.markNotificationAsRead(notification.id);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.notificationService.markAllNotificationsAsRead();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationService.clearAllNotifications();
  }

  /**
   * Refresh notifications
   */
  async refreshNotifications(): Promise<void> {
    await this.notificationService.refreshNotifications();
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'quote.status.changed':
        return 'pi pi-file-edit';
      case 'contract.status.changed':
        return 'pi pi-file-text';
      case 'rfq.status.changed':
        return 'pi pi-shopping-cart';
      case 'contract.created':
        return 'pi pi-file-plus';
      case 'rfq.created':
        return 'pi pi-plus-circle';
      case 'quote.created':
        return 'pi pi-plus';
      case 'product.status.changed':
        return 'pi pi-tag';
      default:
        return 'pi pi-bell';
    }
  }

  /**
   * Get notification color based on priority
   */
  getNotificationColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Get notification background color based on priority
   */
  getNotificationBgColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  }

  /**
   * Format notification time
   */
  getTimeAgo(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return created.toLocaleDateString();
  }
}

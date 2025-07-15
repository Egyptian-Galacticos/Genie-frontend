import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from './websocket.service';
import { AuthService } from '../core/auth/services/auth.service';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  type:
    | 'contract.status.changed'
    | 'rfq.status.changed'
    | 'quote.status.changed'
    | 'contract.created'
    | 'rfq.created'
    | 'quote.created'
    | 'product.status.changed';
  title: string;
  message: string;
  entity_id: number;
  status: string;
  priority: string;
  read_at: string | null;
  created_at: string;
}

interface RawNotificationData {
  id?: string;
  type: string;
  title: string;
  message: string;
  entity_id: number;
  status: string;
  priority: string;
  read_at?: string | null;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);
  private authService = inject(AuthService);

  private _notifications = signal<Notification[]>([]);
  private _unreadCount = signal<number>(0);
  private _isInitialized = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  /**
   * Initialize notifications for the current user
   * This should be called after WebSocket service is initialized
   */
  async initializeNotifications(): Promise<void> {
    try {
      const currentUser = this.authService.user();
      if (!currentUser) {
        return;
      }

      await this.loadNotifications();

      await this.webSocketService.initialize();

      this.subscribeToUserNotifications();

      this._isInitialized.set(true);
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
      this._isInitialized.set(false);
    }
  }

  /**
   * Load notifications from the API
   */
  async loadNotifications(): Promise<void> {
    try {
      this._isLoading.set(true);

      const response = await this.http.get<{ data: Notification[] }>(this.apiUrl).toPromise();

      if (response?.data) {
        this._notifications.set(response.data);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Update unread count based on current notifications
   */
  private updateUnreadCount(): void {
    const unreadCount = this._notifications().filter(n => !n.read_at).length;
    this._unreadCount.set(unreadCount);
  }

  private subscribeToUserNotifications(): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    const userChannel = `App.Models.User.${currentUser.id}`;

    // Subscribe to Laravel's default broadcast notification event
    // This catches ALL notifications regardless of type
    this.webSocketService.subscribeToChannel(userChannel, {
      'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated': (data: unknown) => {
        this.handleLaravelBroadcastNotification(data);
      },
    });
  }

  private handleLaravelBroadcastNotification(data: unknown): void {
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        this.handleNotification(parsedData);
      } catch (error) {
        console.error('Failed to parse notification data:', error);
        return;
      }
    } else if (typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;

      if (dataObj['data'] && typeof dataObj['data'] === 'string') {
        try {
          const parsedData = JSON.parse(dataObj['data'] as string);
          this.handleNotification(parsedData);
        } catch (error) {
          console.error('Failed to parse notification data from object:', error);
          return;
        }
      } else {
        this.handleNotification(data);
      }
    } else {
      console.warn('Unexpected notification data format:', data);
    }
  }

  private handleNotification(data: unknown): void {
    // Handle both direct notification data and Laravel broadcast format
    let notificationData: RawNotificationData;

    if (typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;

      // Check if it's a Laravel broadcast notification
      if (dataObj['data'] && typeof dataObj['data'] === 'object') {
        const notificationDataObj = dataObj['data'] as Record<string, unknown>;

        notificationData = {
          id: (dataObj['id'] as string) || crypto.randomUUID(),
          type: notificationDataObj['type'] as string,
          title: notificationDataObj['title'] as string,
          message: notificationDataObj['message'] as string,
          entity_id: notificationDataObj['entity_id'] as number,
          status: notificationDataObj['status'] as string,
          priority: notificationDataObj['priority'] as string,
          read_at: (notificationDataObj['read_at'] as string | null) || null,
          created_at: (notificationDataObj['created_at'] as string) || new Date().toISOString(),
        };
      } else {
        // Direct notification data - ensure read_at and created_at are present
        notificationData = {
          id: (dataObj['id'] as string) || crypto.randomUUID(),
          type: dataObj['type'] as string,
          title: dataObj['title'] as string,
          message: dataObj['message'] as string,
          entity_id: dataObj['entity_id'] as number,
          status: dataObj['status'] as string,
          priority: dataObj['priority'] as string,
          read_at: (dataObj['read_at'] as string | null) || null,
          created_at: (dataObj['created_at'] as string) || new Date().toISOString(),
        };
      }
    } else {
      console.warn('Invalid notification data received:', data);
      return;
    }

    if (!this.isValidNotification(notificationData)) {
      console.warn('Invalid notification data structure:', notificationData);
      return;
    }

    this.handleNewNotification(notificationData);
  }

  private isValidNotification(notification: unknown): notification is Notification {
    if (!notification || typeof notification !== 'object') return false;

    const n = notification as Record<string, unknown>;
    return (
      typeof n['type'] === 'string' &&
      typeof n['title'] === 'string' &&
      typeof n['message'] === 'string' &&
      typeof n['entity_id'] === 'number' &&
      typeof n['status'] === 'string' &&
      typeof n['priority'] === 'string' &&
      typeof n['id'] === 'string'
    );
  }

  private handleNewNotification(notification: Notification): void {
    this._notifications.update(notifications => [notification, ...notifications]);

    if (!notification.read_at) {
      this._unreadCount.update(count => count + 1);
    }
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      this._notifications.update(notifications =>
        notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      this.updateUnreadCount();

      await this.http.patch(`${this.apiUrl}/${notificationId}/mark-as-read`, {}).toPromise();
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      await this.loadNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const now = new Date().toISOString();
      this._notifications.update(notifications =>
        notifications.map(notification => ({
          ...notification,
          read_at: notification.read_at || now,
        }))
      );
      this._unreadCount.set(0);

      await this.http.patch(`${this.apiUrl}/mark-all-as-read`, {}).toPromise();
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      await this.loadNotifications();
    }
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  /**
   * Refresh notifications from the API
   */
  async refreshNotifications(): Promise<void> {
    await this.loadNotifications();
  }

  /**
   * Get connection status from WebSocket service
   */
  getConnectionStatus() {
    try {
      return this.webSocketService.getConnectionStatus();
    } catch (error) {
      return {
        status: 'disconnected',
        timestamp: new Date(),
        error: 'WebSocket service not available',
      };
    }
  }

  /**
   * Reinitialize notifications for current user
   * Useful when user logs in/out
   */
  async reinitializeForUser(): Promise<void> {
    this.disconnect();
    await this.initializeNotifications();
  }

  /**
   * Disconnect from all channels
   */
  disconnect(): void {
    this.webSocketService.disconnect();
    this._isInitialized.set(false);
  }
}

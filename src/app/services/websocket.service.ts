import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/services/auth.service';
import type Echo from 'laravel-echo';

interface ConnectionError {
  message?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    Pusher: unknown;
    Echo: unknown;
  }
}

export interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  timestamp: Date;
  error?: string;
}

export interface ChannelEvent<T = unknown> {
  channel: string;
  event: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private isBrowser = isPlatformBrowser(this.platformId);

  private echo: Echo<'reverb'> | null = null;
  private connectionStatus = signal<ConnectionStatus>({
    status: 'disconnected',
    timestamp: new Date(),
  });

  private channelEventSubject = new Subject<ChannelEvent>();

  public connectionStatus$ = this.connectionStatus.asReadonly();
  public channelEvents$ = this.channelEventSubject.asObservable();

  private activeChannels = new Set<string>();
  private channelListeners = new Map<string, Map<string, (data: unknown) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private authChannel: BroadcastChannel | null = null;

  async initialize(): Promise<void> {
    if (!this.isBrowser) return;

    if (this.echo) {
      return;
    }

    try {
      this.connectionStatus.set({
        status: 'connecting',
        timestamp: new Date(),
      });

      const [{ default: Echo }, { default: Pusher }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]);

      window.Pusher = Pusher;

      const token = this.authService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      this.echo = new Echo({
        broadcaster: 'reverb',
        key: environment.reverb.key,
        wsHost: environment.reverb.host,
        wsPort: parseInt(environment.reverb.port, 10),
        wssPort: parseInt(environment.reverb.port, 10),
        forceTLS: false,
        encrypted: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      });

      this.setupConnectionListeners();
      this.setupTokenRefreshListener();
      this.reconnectAttempts = 0;
    } catch (error) {
      this.connectionStatus.set({
        status: 'error',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (this.isAuthError(error)) {
        this.handleAuthError();
      }
    }
  }

  private isAuthError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('401') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('authentication')
      );
    }
    return false;
  }

  private handleAuthError(): void {
    this.authService.refreshToken().subscribe({
      next: () => {
        this.reconnect();
      },
      error: () => {
        this.connectionStatus.set({
          status: 'error',
          timestamp: new Date(),
          error: 'Authentication required',
        });
      },
    });
  }

  private setupTokenRefreshListener(): void {
    if (!this.isBrowser) return;

    this.authChannel = new BroadcastChannel('auth-state');

    this.authChannel.onmessage = event => {
      const { type } = event.data;

      if (type === 'TOKEN_REFRESH') {
        this.reconnect();
      }
    };
  }

  private setupConnectionListeners(): void {
    if (!this.echo) return;

    const connector = this.echo.connector;
    if (!('pusher' in connector) || !connector.pusher?.connection) return;

    const connection = connector.pusher.connection;

    connection.bind('connected', () => {
      this.connectionStatus.set({
        status: 'connected',
        timestamp: new Date(),
      });
      this.reconnectAttempts = 0;
    });

    connection.bind('disconnected', () => {
      this.connectionStatus.set({
        status: 'disconnected',
        timestamp: new Date(),
      });
    });

    connection.bind('error', (error: unknown) => {
      const connectionError = error as ConnectionError;

      this.connectionStatus.set({
        status: 'error',
        timestamp: new Date(),
        error: connectionError.message || 'Connection error',
      });

      if (this.isAuthError(connectionError)) {
        this.handleAuthError();
      } else {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  subscribeToChannel(channelName: string, events: Record<string, (data: unknown) => void>): void {
    if (!this.echo) return;

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName);
      this.channelListeners.set(channelName, new Map());

      const channel = this.echo.private(channelName);

      Object.entries(events).forEach(([eventName, handler]) => {
        const fullEventName = eventName.startsWith('.') ? eventName : `.${eventName}`;

        channel.listen(fullEventName, (data: unknown) => {
          this.channelListeners.get(channelName)?.set(eventName, handler);

          const channelEvent: ChannelEvent = {
            channel: channelName,
            event: eventName,
            data,
          };

          this.channelEventSubject.next(channelEvent);

          handler(data);
        });
      });
    }
  }

  unsubscribeFromChannel(channelName: string): void {
    if (!this.echo) return;

    if (this.activeChannels.has(channelName)) {
      this.activeChannels.delete(channelName);
      this.channelListeners.delete(channelName);
      this.echo.leave(channelName);
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus();
  }

  isConnected(): boolean {
    return this.connectionStatus().status === 'connected';
  }

  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.initialize(), 1000);
  }

  disconnect(): void {
    if (this.echo) {
      this.activeChannels.forEach(channelName => {
        this.echo!.leave(channelName);
      });

      this.activeChannels.clear();
      this.channelListeners.clear();
      this.echo.disconnect();
      this.echo = null;
    }

    if (this.authChannel) {
      this.authChannel.close();
      this.authChannel = null;
    }

    this.connectionStatus.set({
      status: 'disconnected',
      timestamp: new Date(),
    });
  }
}

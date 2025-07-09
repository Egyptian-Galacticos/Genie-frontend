import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/services/auth.service';
import type Echo from 'laravel-echo';

// Event interfaces
export interface PresenceUser {
  id: number;
  name?: string;
  [key: string]: unknown;
}

export interface MessageSentEvent {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  type: string;
  sent_at: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    full_name?: string; // Optional, as it might be constructed on frontend
    email?: string; // Optional, if not always sent
  };
}

export interface MessageReadEvent {
  message_id: number;
  read_by_user_id: number;
  read_at: string;
}

export interface TypingEvent {
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface ConversationCreatedEvent {
  conversation: {
    id: number;
    participants: Array<{
      id: number;
      full_name: string;
      email: string;
    }>;
    created_at: string;
  };
}

export interface ProcessedMessageReadEvent {
  messageId: number;
  conversationId: number;
  userId: number;
}

// ProcessedNewMessageEvent now directly extends MessageSentEvent
export type ProcessedNewMessageEvent = MessageSentEvent;

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

export interface TypingUser {
  id: number;
  full_name: string;
  conversation_id: number;
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

  // Subjects for real-time events
  private typingUsersSubject = new BehaviorSubject<TypingUser[]>([]);
  private newMessageSubject = new Subject<ProcessedNewMessageEvent>();
  private messageReadSubject = new Subject<ProcessedMessageReadEvent>();
  private conversationCreatedSubject = new Subject<ConversationCreatedEvent>();
  private onlineUsersSubject = new BehaviorSubject<number[]>([]);

  // Public observables
  public connectionStatus$ = this.connectionStatus.asReadonly();
  public typingUsers$ = this.typingUsersSubject.asObservable();
  public newMessage$ = this.newMessageSubject.asObservable();
  public messageRead$ = this.messageReadSubject.asObservable();
  public conversationCreated$ = this.conversationCreatedSubject.asObservable();
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  private activeChannels = new Set<string>();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  async initialize(): Promise<void> {
    if (!this.isBrowser || this.echo) return;

    try {
      this.connectionStatus.set({
        status: 'connecting',
        timestamp: new Date(),
      });

      // Dynamic imports
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
      this.subscribeToUserNotifications();
      this.subscribeToPresenceChannel();
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      this.connectionStatus.set({
        status: 'error',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private setupConnectionListeners(): void {
    if (!this.echo) return;

    // Access the connector safely - check if it's a Pusher connector
    const connector = this.echo.connector;
    if (!('pusher' in connector) || !connector.pusher?.connection) return;

    const connection = connector.pusher.connection;

    connection.bind('connected', () => {
      console.log('WebSocket connected');
      this.connectionStatus.set({
        status: 'connected',
        timestamp: new Date(),
      });
    });

    connection.bind('disconnected', () => {
      console.log('WebSocket disconnected');
      this.connectionStatus.set({
        status: 'disconnected',
        timestamp: new Date(),
      });
    });

    connection.bind('error', (error: unknown) => {
      const connectionError = error as ConnectionError;
      console.error('WebSocket error:', connectionError);
      this.connectionStatus.set({
        status: 'error',
        timestamp: new Date(),
        error: connectionError.message || 'Connection error',
      });
    });
  }

  private subscribeToUserNotifications(): void {
    const currentUser = this.authService.user();
    if (!currentUser || !this.echo) return;

    const channelName = `user.${currentUser.id}.notifications`;

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName);

      const channel = this.echo.private(channelName);

      channel.listen('.conversation.created', (event: unknown) => {
        const conversationEvent = event as ConversationCreatedEvent;
        console.log('New conversation created:', conversationEvent);
        this.conversationCreatedSubject.next(conversationEvent);
      });
    }
  }

  private subscribeToPresenceChannel(): void {
    if (!this.echo) return;

    const channelName = 'online-users';

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName);

      const presenceChannel = this.echo.join(channelName);

      presenceChannel.here((users: PresenceUser[]) => {
        const onlineUserIds = users.map(u => u.id);
        this.onlineUsersSubject.next(onlineUserIds);
      });

      presenceChannel.joining((user: PresenceUser) => {
        const currentOnlineUsers = this.onlineUsersSubject.getValue();
        if (!currentOnlineUsers.includes(user.id)) {
          this.onlineUsersSubject.next([...currentOnlineUsers, user.id]);
        }
      });

      presenceChannel.leaving((user: PresenceUser) => {
        const currentOnlineUsers = this.onlineUsersSubject.getValue();
        this.onlineUsersSubject.next(currentOnlineUsers.filter(id => id !== user.id));
      });
    }
  }

  subscribeToConversation(conversationId: number): void {
    if (!this.echo) return;

    const channelName = `conversation.${conversationId}`;

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName);

      const channel = this.echo.private(channelName);

      // Listen for new messages
      channel.listen('.message.sent', (event: unknown) => {
        const messageEvent = event as MessageSentEvent;
        const currentUser = this.authService.user();

        // ✅ Prevent duplication for the sender
        if (messageEvent.sender_id === currentUser?.id) {
          return;
        }
        console.log('New message received:', messageEvent);
        this.newMessageSubject.next(messageEvent);
      });

      // Listen for read status updates
      channel.listen('.message.read', (event: unknown) => {
        const readEvent = event as MessageReadEvent;
        console.log('Message read:', readEvent);
        this.messageReadSubject.next({
          messageId: readEvent.message_id,
          conversationId,
          userId: readEvent.read_by_user_id,
        });
      });

      // Listen for typing indicators
      channel.listen('.user.typing', (event: unknown) => {
        const typingEvent = event as TypingEvent;
        console.log('User typing:', typingEvent);
        this.handleTypingEvent(typingEvent, conversationId);
      });
    }
  }

  unsubscribeFromConversation(conversationId: number): void {
    if (!this.echo) return;

    const channelName = `conversation.${conversationId}`;

    if (this.activeChannels.has(channelName)) {
      this.activeChannels.delete(channelName);
      this.echo.leave(channelName);
    }
  }

  private handleTypingEvent(event: TypingEvent, conversationId: number): void {
    const userId = event.user_id;
    const userName = event.user_name;
    const isTyping = event.is_typing;
    const timeoutKey = `${conversationId}_${userId}`;

    // Clear existing timeout
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey));
      this.typingTimeouts.delete(timeoutKey);
    }

    const currentTypingUsers = this.typingUsersSubject.getValue();

    if (isTyping) {
      // Add user to typing list
      const existingIndex = currentTypingUsers.findIndex(
        u => u.id === userId && u.conversation_id === conversationId
      );

      if (existingIndex === -1) {
        this.typingUsersSubject.next([
          ...currentTypingUsers,
          {
            id: userId,
            full_name: userName,
            conversation_id: conversationId,
          },
        ]);
      }

      // Auto-clear after 5 seconds
      this.typingTimeouts.set(
        timeoutKey,
        setTimeout(() => {
          this.removeTypingUser(userId, conversationId);
        }, 5000)
      );
    } else {
      this.removeTypingUser(userId, conversationId);
    }
  }

  private removeTypingUser(userId: number, conversationId: number): void {
    const currentTypingUsers = this.typingUsersSubject.getValue();
    this.typingUsersSubject.next(
      currentTypingUsers.filter(u => !(u.id === userId && u.conversation_id === conversationId))
    );
  }

  getTypingUsersForConversation(conversationId: number): TypingUser[] {
    return this.typingUsersSubject
      .getValue()
      .filter(user => user.conversation_id === conversationId);
  }

  sendTypingIndicator(conversationId: number): void {
    if (!this.isBrowser) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    fetch(`${environment.apiUrl}/chat/conversations/${conversationId}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_typing: true }),
    }).catch(() => {
      // Silent error handling
    });
  }

  sendStopTypingIndicator(conversationId: number): void {
    if (!this.isBrowser) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    fetch(`${environment.apiUrl}/chat/conversations/${conversationId}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_typing: false }),
    }).catch(() => {
      // Silent error handling
    });
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsersSubject.getValue().includes(userId);
  }

  disconnect(): void {
    if (this.echo) {
      // Leave all channels
      this.activeChannels.forEach(channelName => {
        this.echo!.leave(channelName);
      });

      this.activeChannels.clear();
      this.echo.disconnect();
      this.echo = null;
    }

    // Clear all timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();

    this.connectionStatus.set({
      status: 'disconnected',
      timestamp: new Date(),
    });
  }

  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.initialize(), 1000);
  }
}

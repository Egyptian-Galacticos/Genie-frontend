import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { type Observable, tap, map, catchError, of, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  WebSocketService,
  ProcessedNewMessageEvent,
  ProcessedMessageReadEvent,
} from '../../../services/websocket.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import type {
  Conversation,
  Message,
  ConversationResponse,
  MessageResponse,
  ConversationListParams,
  ApiResponse,
} from '../../../core/interfaces/conversation.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);
  private authService = inject(AuthService);

  private baseUrl = `${environment.apiUrl}/chat`;

  private _conversations = signal<Conversation[]>([]);
  private _messages = signal<Map<number, Message[]>>(new Map());
  private _loading = signal<boolean>(false);
  private _unreadCount = signal<number>(0);

  readonly conversations = this._conversations.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();

  constructor() {
    this.initializeWebSocket();
    this.subscribeToWebSocketEvents();
  }

  private async initializeWebSocket(): Promise<void> {
    await this.webSocketService.initialize();
  }

  private subscribeToWebSocketEvents(): void {
    this.webSocketService.newMessage$.subscribe((messageEvent: ProcessedNewMessageEvent) => {
      if (messageEvent) {
        this.handleNewMessage(messageEvent);
      }
    });

    this.webSocketService.messageRead$.subscribe((readEvent: ProcessedMessageReadEvent) => {
      if (readEvent) {
        this.handleMessageRead(readEvent);
      }
    });

    this.webSocketService.conversationCreated$.subscribe(() => {
      this.handleNewConversation();
    });
  }

  private handleNewMessage(messageEvent: ProcessedNewMessageEvent): void {
    const message: Message = {
      id: messageEvent.message.id,
      conversation_id: messageEvent.conversationId,
      content: messageEvent.message.content,
      type: 'text', // Default to text, could be enhanced based on messageEvent structure
      sent_at: messageEvent.message.created_at,
      created_at: messageEvent.message.created_at,
      updated_at: messageEvent.message.updated_at,
      is_read: false,
      sender_id: messageEvent.message.user_id,
      sender: {
        id: messageEvent.user.id,
        first_name: '', // This data might not be available from websocket event
        last_name: '', // This data might not be available from websocket event
        full_name: messageEvent.user.full_name,
        email: messageEvent.user.email,
        phone_number: null,
        is_email_verified: false,
        status: 'active',
        last_login_at: null,
        roles: [],
        company: null,
        created_at: '',
        updated_at: '',
      },
    };

    this._messages.update(messagesMap => {
      const currentMessages = messagesMap.get(messageEvent.conversationId) || [];
      const newMap = new Map(messagesMap);

      const existingIndex = currentMessages.findIndex(m => m.id === message.id);
      if (existingIndex === -1) {
        const updatedMessages = [...currentMessages, message].sort(
          (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        );
        newMap.set(messageEvent.conversationId, updatedMessages);
      }

      return newMap;
    });

    this._conversations.update(conversations =>
      conversations.map(conv => {
        if (conv.id === messageEvent.conversationId) {
          return {
            ...conv,
            last_message: message,
            last_activity_at: message.sent_at,
          };
        }
        return conv;
      })
    );

    const currentUser = this.authService.user();
    if (currentUser && messageEvent.message.user_id !== currentUser.id) {
      this._unreadCount.update(count => count + 1);
    }
  }

  private handleMessageRead(readEvent: ProcessedMessageReadEvent): void {
    this._messages.update(messagesMap => {
      const newMap = new Map(messagesMap);
      const messages = newMap.get(readEvent.conversationId);

      if (messages) {
        const updatedMessages = messages.map(msg =>
          msg.id === readEvent.messageId ? { ...msg, is_read: true } : msg
        );
        newMap.set(readEvent.conversationId, updatedMessages);
      }

      return newMap;
    });
  }

  private handleNewConversation(): void {
    this.loadConversations().subscribe();
  }

  loadConversations(params?: ConversationListParams): Observable<Conversation[]> {
    this._loading.set(true);

    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.is_active !== undefined)
      httpParams = httpParams.set('is_active', params.is_active.toString());

    return this.http
      .get<ConversationResponse>(`${this.baseUrl}/conversations`, { params: httpParams })
      .pipe(
        map(response => {
          if (response.success) {
            this._conversations.set(response.data);
            return response.data;
          }
          return [];
        }),
        finalize(() => this._loading.set(false)),
        catchError(error => {
          console.error('Error loading conversations:', error);
          this._loading.set(false);
          return of([]);
        })
      );
  }

  startConversation(userId: number, title?: string): Observable<Conversation> {
    const payload = {
      user_id: userId,
      type: 'direct' as const,
      title: title || undefined,
    };

    return this.http.post<ApiResponse<Conversation>>(`${this.baseUrl}/conversations`, payload).pipe(
      map(response => {
        if (response.success) {
          const newConversation = response.data;
          this._conversations.update(conversations => [newConversation, ...conversations]);
          return newConversation;
        }
        throw new Error(response.message || 'Failed to create conversation');
      })
    );
  }

  loadMessages(conversationId: number, page = 1, per_page = 50): Observable<Message[]> {
    this._loading.set(true);

    this.webSocketService.subscribeToConversation(conversationId);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', per_page.toString());

    return this.http
      .get<MessageResponse>(`${this.baseUrl}/conversations/${conversationId}/messages`, { params })
      .pipe(
        map(response => {
          if (response.success) {
            const messages = response.data.sort(
              (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
            );

            this._messages.update(messagesMap => {
              const newMap = new Map(messagesMap);
              newMap.set(conversationId, messages);
              return newMap;
            });

            return messages;
          }
          return [];
        }),
        finalize(() => this._loading.set(false)),
        catchError(error => {
          console.error('Error loading messages:', error);
          this._loading.set(false);
          return of([]);
        })
      );
  }

  sendMessage(conversationId: number, content: string, type = 'text'): Observable<Message> {
    const payload = { content, type };

    return this.http
      .post<
        ApiResponse<Message>
      >(`${this.baseUrl}/conversations/${conversationId}/messages`, payload)
      .pipe(
        map(response => {
          if (response.success) {
            const newMessage = response.data;

            this._messages.update(messagesMap => {
              const currentMessages = messagesMap.get(conversationId) || [];
              const newMap = new Map(messagesMap);
              const updatedMessages = [...currentMessages, newMessage].sort(
                (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
              );
              newMap.set(conversationId, updatedMessages);
              return newMap;
            });

            this._conversations.update(conversations =>
              conversations.map(conv => {
                if (conv.id === conversationId) {
                  return {
                    ...conv,
                    last_message: newMessage,
                    last_activity_at: newMessage.sent_at,
                  };
                }
                return conv;
              })
            );

            return newMessage;
          }
          throw new Error(response.message || 'Failed to send message');
        })
      );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.baseUrl}/unread-count`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._unreadCount.set(response.data.count);
        }
      }),
      map(response => (response.success ? response.data : { count: 0 })),
      catchError(() => of({ count: 0 }))
    );
  }

  searchConversations(query: string): Observable<Conversation[]> {
    const params = new HttpParams().set('query', query);

    return this.http
      .get<ConversationResponse>(`${this.baseUrl}/conversations/search`, { params })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error searching conversations:', error);
          return of([]);
        })
      );
  }

  markConversationAsRead(conversationId: number): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(`${this.baseUrl}/conversations/${conversationId}/read`, {})
      .pipe(
        tap(() => {
          this._conversations.update(conversations =>
            conversations.map(conv => {
              if (conv.id === conversationId) {
                return { ...conv, unread_count: 0 };
              }
              return conv;
            })
          );
        }),
        map(() => void 0),
        catchError(error => {
          console.error('Error marking conversation as read:', error);
          return of(void 0);
        })
      );
  }

  sendTypingIndicator(conversationId: number): void {
    this.webSocketService.sendTypingIndicator(conversationId);
  }

  sendStopTypingIndicator(conversationId: number): void {
    this.webSocketService.sendStopTypingIndicator(conversationId);
  }

  getTypingUsersForConversation(conversationId: number) {
    return this.webSocketService.getTypingUsersForConversation(conversationId);
  }

  getMessagesForConversation(conversationId: number): Message[] {
    return this._messages().get(conversationId) || [];
  }

  leaveConversation(conversationId: number): void {
    this.webSocketService.unsubscribeFromConversation(conversationId);
  }

  isUserOnline(userId: number): boolean {
    return this.webSocketService.isUserOnline(userId);
  }

  disconnect(): void {
    this.webSocketService.disconnect();
  }
}

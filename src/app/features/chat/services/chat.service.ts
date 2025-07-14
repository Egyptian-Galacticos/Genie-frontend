import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';
import { WebSocketService } from '../../../services/websocket.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import {
  Conversation,
  Message,
  ConversationListParams,
  ConversationResponse,
  User,
  ApiResponse,
  StartConversationRequest,
  MessageResponse,
} from '../../../core/interfaces/conversation.interface';

export interface MessageSentEvent {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  type: string;
  sent_at: string;
  created_at: string;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    logo: string | null;
  };
  attachments?: {
    id: number;
    name: string;
    file_name: string;
    url: string;
    size: number;
    mime_type: string;
    thumbnail_url?: string;
  }[];
  is_read?: boolean;
}

export interface MessageReadEvent {
  message_id: number;
  read_by_user_id: number;
  read_at: string;
  conversation_id: number;
}

export interface ConversationCreatedEvent {
  id: number;
  type: string;
  title: string | null;
  seller: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    logo: string | null;
  };
  buyer: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    logo: string | null;
  };
  created_at: string;
}

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
  private _isSubscribed = signal<boolean>(false);
  private activeConversationId: number | null = null;

  setActiveConversationId(conversationId: number | null) {
    this.activeConversationId = conversationId;
  }

  private newMessageSubject = new Subject<Message>();

  readonly conversations = this._conversations.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly newMessage$ = this.newMessageSubject.asObservable();

  readonly isConnected = computed(() => this.webSocketService.isConnected());
  readonly currentUser = computed(() => this.authService.user());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const isConnected = this.isConnected();
      const isSubscribed = this._isSubscribed();

      if (user && isConnected && !isSubscribed) {
        this.subscribeToChatChannel();
        this._isSubscribed.set(true);
      } else if ((!user || !isConnected) && isSubscribed) {
        this.unsubscribeFromChatChannel();
        this._isSubscribed.set(false);
      }
    });
  }

  private subscribeToChatChannel(): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    this.webSocketService.subscribeToChannel(`chat.${currentUser.id}`, {
      'conversation.created': (data: unknown) => {
        const conversationEvent = data as ConversationCreatedEvent;
        this.handleNewConversation(conversationEvent);
      },
    });
  }

  private handleNewMessage(messageEvent: MessageSentEvent): void {
    const currentUser = this.currentUser();

    if (messageEvent.sender_id === currentUser?.id) {
      return;
    }

    const message: Message = {
      ...messageEvent,
      type: messageEvent.type as Message['type'],
      is_read: messageEvent.is_read || false,
    };

    this._messages.update(messagesMap => {
      const currentMessages = messagesMap.get(messageEvent.conversation_id) || [];
      const newMap = new Map(messagesMap);

      const existingIndex = currentMessages.findIndex(m => m.id === message.id);
      if (existingIndex === -1) {
        const updatedMessages = [...currentMessages, message];
        newMap.set(messageEvent.conversation_id, updatedMessages);

        this.emitNewMessageEvent(message);
      }

      return newMap;
    });

    this._conversations.update(conversations =>
      conversations.map(conv => {
        if (conv.id === messageEvent.conversation_id) {
          // If the conversation is NOT currently open, increment unread_count
          if (this.activeConversationId !== conv.id) {
            return {
              ...conv,
              last_message: message,
              last_activity_at: message.sent_at,
              unread_count: (conv.unread_count || 0) + 1,
            };
          } else {
            // If open, don't increment unread_count
            return {
              ...conv,
              last_message: message,
              last_activity_at: message.sent_at,
            };
          }
        }
        return conv;
      })
    );
  }

  private handleMessageRead(readEvent: MessageReadEvent): void {
    // Find the conversation ID from the message
    const allMessages = this._messages();
    let conversationId: number | null = null;

    for (const [convId, messages] of allMessages.entries()) {
      if (messages.some(msg => msg.id === readEvent.message_id)) {
        conversationId = convId;
        break;
      }
    }

    if (conversationId) {
      this._messages.update(messagesMap => {
        const newMap = new Map(messagesMap);
        const messages = newMap.get(conversationId!);

        if (messages) {
          const updatedMessages = messages.map(msg =>
            msg.id === readEvent.message_id ? { ...msg, is_read: true } : msg
          );
          newMap.set(conversationId!, updatedMessages);
        }

        return newMap;
      });
    }
  }

  private handleNewConversation(conversationEvent: ConversationCreatedEvent): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    // Create conversation object from event
    const newConversation: Conversation = {
      id: conversationEvent.id,
      type: conversationEvent.type as 'direct',
      title: conversationEvent.title,
      is_active: true,
      last_activity_at: conversationEvent.created_at,
      created_at: conversationEvent.created_at,
      updated_at: conversationEvent.created_at,
      seller: this.transformEventUserToUser(conversationEvent.seller),
      buyer: this.transformEventUserToUser(conversationEvent.buyer),
      last_message: null,
      other_participant: this.getOtherParticipantFromEvent(conversationEvent),
      unread_count: 0,
    };

    // Add to conversations list
    this._conversations.update(conversations => {
      // Check if conversation already exists
      const exists = conversations.some(conv => conv.id === newConversation.id);
      if (!exists) {
        return [newConversation, ...conversations];
      }
      return conversations;
    });

    // Subscribe to the new conversation's channel
    this.subscribeToConversation(newConversation.id);
  }

  private transformEventUserToUser(eventUser: ConversationCreatedEvent['seller']): User {
    return {
      id: eventUser.id,
      first_name: eventUser.first_name,
      last_name: eventUser.last_name,
      full_name: eventUser.full_name,
      email: '', // Not provided in event
      company_name: '', // Not provided in event
    };
  }

  private getOtherParticipantFromEvent(event: ConversationCreatedEvent): User | null {
    const currentUser = this.authService.user();
    if (!currentUser) return null;

    // Determine if current user is seller or buyer
    if (event.seller.id === currentUser.id) {
      return this.transformEventUserToUser(event.buyer);
    } else if (event.buyer.id === currentUser.id) {
      return this.transformEventUserToUser(event.seller);
    }
    return null;
  }

  private emitNewMessageEvent(message: Message): void {
    this.newMessageSubject.next(message);
  }

  loadConversations(params?: ConversationListParams): Observable<Conversation[]> {
    this._loading.set(true);

    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.size) httpParams = httpParams.set('size', params.size.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.is_active !== undefined)
      httpParams = httpParams.set('is_active', params.is_active.toString());

    return this.http
      .get<ConversationResponse>(`${this.baseUrl}/conversations`, { params: httpParams })
      .pipe(
        map(response => {
          if (response.success) {
            const conversations = response.data;

            this._conversations.set(conversations);

            conversations.forEach(conversation => {
              this.subscribeToConversation(conversation.id);
            });

            return conversations;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error loading conversations:', error);
          return of([]);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  private getOtherParticipant(conversation: Conversation): User | null {
    const currentUser = this.authService.user();
    if (!currentUser) return null;

    // Determine if current user is seller or buyer
    if (conversation.seller.id === currentUser.id) {
      return conversation.buyer;
    } else if (conversation.buyer.id === currentUser.id) {
      return conversation.seller;
    }
    return null;
  }

  startConversation(userId: number, title?: string): Observable<Conversation> {
    const request: StartConversationRequest = {
      user_id: userId,
      type: 'direct',
      title: title,
    };

    return this.http.post<ApiResponse<Conversation>>(`${this.baseUrl}/conversations`, request).pipe(
      map(response => {
        if (response.success) {
          const conversation = {
            ...response.data,
            other_participant: this.getOtherParticipant(response.data),
            unread_count: 0,
          };

          // Add to conversations list
          this._conversations.update(conversations => [conversation, ...conversations]);
          return conversation;
        }
        throw new Error(response.message || 'Failed to start conversation');
      }),
      catchError(error => {
        console.error('Error starting conversation:', error);
        throw error;
      })
    );
  }

  loadMessages(conversationId: number, page = 1, size = 50): Observable<Message[]> {
    const httpParams = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http
      .get<MessageResponse>(`${this.baseUrl}/conversations/${conversationId}/messages`, {
        params: httpParams,
      })
      .pipe(
        map(response => {
          if (response.success) {
            const messages = response.data;
            this._messages.update(messagesMap => {
              const newMap = new Map(messagesMap);
              newMap.set(conversationId, messages);
              return newMap;
            });
            return messages;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error loading messages:', error);
          return of([]);
        })
      );
  }

  private subscribeToConversation(conversationId: number): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    this.webSocketService.subscribeToChannel(`conversation.${conversationId}`, {
      'message.sent': (data: unknown) => {
        const messageEvent = data as MessageSentEvent;
        this.handleNewMessage(messageEvent);
      },
      'message.read': (data: unknown) => {
        const readEvent = data as MessageReadEvent;
        this.handleMessageRead(readEvent);
      },
    });
  }

  sendMessage(
    conversationId: number,
    content: string,
    type = 'text',
    files?: File[]
  ): Observable<Message> {
    const formData = new FormData();

    // Only append content if it has a value
    if (content && content.trim()) {
      formData.append('content', content);
    }
    formData.append('type', type);

    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`attachments[${index}][file]`, file);
        formData.append(`attachments[${index}][file_name]`, file.name);
      });
    }

    return this.http
      .post<
        ApiResponse<Message>
      >(`${this.baseUrl}/conversations/${conversationId}/messages`, formData)
      .pipe(
        map(response => {
          if (response.success) {
            const message = response.data;

            // Add message to local state
            this._messages.update(messagesMap => {
              const newMap = new Map(messagesMap);
              const currentMessages = newMap.get(conversationId) || [];
              const updatedMessages = [...currentMessages, message].sort(
                (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
              );
              newMap.set(conversationId, updatedMessages);
              return newMap;
            });

            // Update conversation's last message
            this._conversations.update(conversations =>
              conversations.map(conv => {
                if (conv.id === conversationId) {
                  return {
                    ...conv,
                    last_message: message,
                    last_activity_at: message.sent_at,
                  };
                }
                return conv;
              })
            );

            return message;
          }
          throw new Error(response.message || 'Failed to send message');
        }),
        catchError(error => {
          console.error('Error sending message:', error);
          throw error;
        })
      );
  }

  searchConversations(query: string): Observable<Conversation[]> {
    const params = new HttpParams().set('query', query).set('size', '15');

    return this.http
      .get<ConversationResponse>(`${this.baseUrl}/conversations/search`, { params })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data.map(conv => ({
              ...conv,
              other_participant: this.getOtherParticipant(conv),
              unread_count: 0,
            }));
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
    return this.http.patch<void>(`${this.baseUrl}/conversations/${conversationId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        this._messages.update(messagesMap => {
          const newMap = new Map(messagesMap);
          const messages = newMap.get(conversationId);
          if (messages) {
            const updatedMessages = messages.map(msg => ({ ...msg, is_read: true }));
            newMap.set(conversationId, updatedMessages);
          }
          return newMap;
        });
        // Set unread_count to 0 for this conversation
        this._conversations.update(conversations =>
          conversations.map(conv =>
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          )
        );
      }),
      catchError(error => {
        console.error('Error marking conversation as read:', error);
        throw error;
      })
    );
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/messages/${messageId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        this._messages.update(messagesMap => {
          const newMap = new Map(messagesMap);
          for (const [convId, messages] of newMap.entries()) {
            const updatedMessages = messages.map(msg =>
              msg.id === messageId ? { ...msg, is_read: true } : msg
            );
            newMap.set(convId, updatedMessages);
          }
          return newMap;
        });
      }),
      catchError(error => {
        console.error('Error marking message as read:', error);
        throw error;
      })
    );
  }

  getMessagesForConversation(conversationId: number): Message[] {
    return this._messages().get(conversationId) || [];
  }

  private unsubscribeFromChatChannel(): void {
    const currentUser = this.authService.user();
    if (currentUser) {
      this.webSocketService.unsubscribeFromChannel(`chat.${currentUser.id}`);
    }
  }

  private unsubscribeFromConversation(conversationId: number): void {
    this.webSocketService.unsubscribeFromChannel(`conversation.${conversationId}`);
  }

  leaveConversation(conversationId: number): void {
    // Unsubscribe from conversation channel
    this.unsubscribeFromConversation(conversationId);

    // Remove from local state
    this._conversations.update(conversations =>
      conversations.filter(conv => conv.id !== conversationId)
    );
    this._messages.update(messagesMap => {
      const newMap = new Map(messagesMap);
      newMap.delete(conversationId);
      return newMap;
    });
  }

  disconnect(): void {
    // Unsubscribe from all conversation channels
    this._conversations().forEach(conversation => {
      this.unsubscribeFromConversation(conversation.id);
    });

    // Unsubscribe from chat channel
    this.unsubscribeFromChatChannel();

    this.webSocketService.disconnect();
  }

  logout(): void {
    // Unsubscribe from all channels
    this.disconnect();

    // Clear all state
    this._conversations.set([]);
    this._messages.set(new Map());
    this._loading.set(false);
  }
}

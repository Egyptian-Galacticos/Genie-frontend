import { Injectable, inject, PLATFORM_ID, signal } from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { BehaviorSubject, Subject } from "rxjs"
import { environment } from "../../environments/environment"
import { AuthService } from "../core/auth/services/auth.service"

declare global {
  interface Window {
    Pusher: any
    Echo: any
  }
}

export interface ConnectionStatus {
  status: "connected" | "connecting" | "disconnected" | "error"
  timestamp: Date
  error?: string
}

export interface TypingUser {
  id: number
  full_name: string
  conversation_id: number
}

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private platformId = inject(PLATFORM_ID)
  private authService = inject(AuthService)
  private isBrowser = isPlatformBrowser(this.platformId)

  private echo: any = null
  private connectionStatus = signal<ConnectionStatus>({
    status: "disconnected",
    timestamp: new Date(),
  })

  // Subjects for real-time events
  private typingUsersSubject = new BehaviorSubject<TypingUser[]>([])
  private newMessageSubject = new Subject<any>()
  private messageReadSubject = new Subject<any>()
  private conversationCreatedSubject = new Subject<any>()
  private onlineUsersSubject = new BehaviorSubject<number[]>([])

  // Public observables
  public connectionStatus$ = this.connectionStatus.asReadonly()
  public typingUsers$ = this.typingUsersSubject.asObservable()
  public newMessage$ = this.newMessageSubject.asObservable()
  public messageRead$ = this.messageReadSubject.asObservable()
  public conversationCreated$ = this.conversationCreatedSubject.asObservable()
  public onlineUsers$ = this.onlineUsersSubject.asObservable()

  private activeChannels = new Set<string>()
  private typingTimeouts = new Map<string, any>()

  async initialize(): Promise<void> {
    if (!this.isBrowser || this.echo) return

    try {
      this.connectionStatus.set({
        status: "connecting",
        timestamp: new Date(),
      })

      // Dynamic imports
      const [{ default: Echo }, { default: Pusher }] = await Promise.all([import("laravel-echo"), import("pusher-js")])

      window.Pusher = Pusher

      const token = this.authService.getAccessToken()
      if (!token) {
        throw new Error("No authentication token available")
      }

      this.echo = new Echo({
        broadcaster: "reverb",
        key: environment.reverb.key,
        wsHost: environment.reverb.host,
        wsPort: environment.reverb.port,
        wssPort: environment.reverb.port,
        forceTLS: false,
        encrypted: false,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
      })

      this.setupConnectionListeners()
      this.subscribeToUserNotifications()
      this.subscribeToPresenceChannel()
    } catch (error) {
      console.error("WebSocket initialization failed:", error)
      this.connectionStatus.set({
        status: "error",
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  private setupConnectionListeners(): void {
    if (!this.echo) return

    const connection = this.echo.connector.pusher.connection

    connection.bind("connected", () => {
      console.log("WebSocket connected")
      this.connectionStatus.set({
        status: "connected",
        timestamp: new Date(),
      })
    })

    connection.bind("disconnected", () => {
      console.log("WebSocket disconnected")
      this.connectionStatus.set({
        status: "disconnected",
        timestamp: new Date(),
      })
    })

    connection.bind("error", (error: any) => {
      console.error("WebSocket error:", error)
      this.connectionStatus.set({
        status: "error",
        timestamp: new Date(),
        error: error.message || "Connection error",
      })
    })
  }

  private subscribeToUserNotifications(): void {
    const currentUser = this.authService.user()
    if (!currentUser) return

    const channelName = `user.${currentUser.id}.notifications`

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName)

      const channel = this.echo.private(channelName)

      channel.listen(".conversation.created", (event: any) => {
        console.log("New conversation created:", event)
        this.conversationCreatedSubject.next(event)
      })
    }
  }

  private subscribeToPresenceChannel(): void {
    const channelName = "online-users"

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName)

      const presenceChannel = this.echo.join(channelName)

      presenceChannel.here((users: any[]) => {
        const onlineUserIds = users.map((u) => u.id)
        this.onlineUsersSubject.next(onlineUserIds)
      })

      presenceChannel.joining((user: any) => {
        const currentOnlineUsers = this.onlineUsersSubject.getValue()
        if (!currentOnlineUsers.includes(user.id)) {
          this.onlineUsersSubject.next([...currentOnlineUsers, user.id])
        }
      })

      presenceChannel.leaving((user: any) => {
        const currentOnlineUsers = this.onlineUsersSubject.getValue()
        this.onlineUsersSubject.next(currentOnlineUsers.filter((id) => id !== user.id))
      })
    }
  }

  subscribeToConversation(conversationId: number): void {
    if (!this.echo) return

    const channelName = `conversation.${conversationId}`

    if (!this.activeChannels.has(channelName)) {
      this.activeChannels.add(channelName)

      const channel = this.echo.private(channelName)

      // Listen for new messages
      channel.listen(".message.sent", (event: any) => {
        console.log("New message received:", event)
        this.newMessageSubject.next({
          ...event,
          conversationId,
        })
      })

      // Listen for read status updates
      channel.listen(".message.read", (event: any) => {
        console.log("Message read:", event)
        this.messageReadSubject.next({
          messageId: event.message_id,
          conversationId,
          userId: event.read_by_user_id,
        })
      })

      // Listen for typing indicators
      channel.listen(".user.typing", (event: any) => {
        console.log("User typing:", event)
        this.handleTypingEvent(event, conversationId)
      })
    }
  }

  unsubscribeFromConversation(conversationId: number): void {
    if (!this.echo) return

    const channelName = `conversation.${conversationId}`

    if (this.activeChannels.has(channelName)) {
      this.activeChannels.delete(channelName)
      this.echo.leave(channelName)
    }
  }

  private handleTypingEvent(event: any, conversationId: number): void {
    const userId = event.user_id
    const userName = event.user_name
    const isTyping = event.is_typing
    const timeoutKey = `${conversationId}_${userId}`

    // Clear existing timeout
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey))
      this.typingTimeouts.delete(timeoutKey)
    }

    const currentTypingUsers = this.typingUsersSubject.getValue()

    if (isTyping) {
      // Add user to typing list
      const existingIndex = currentTypingUsers.findIndex((u) => u.id === userId && u.conversation_id === conversationId)

      if (existingIndex === -1) {
        this.typingUsersSubject.next([
          ...currentTypingUsers,
          {
            id: userId,
            full_name: userName,
            conversation_id: conversationId,
          },
        ])
      }

      // Auto-clear after 5 seconds
      this.typingTimeouts.set(
        timeoutKey,
        setTimeout(() => {
          this.removeTypingUser(userId, conversationId)
        }, 5000),
      )
    } else {
      this.removeTypingUser(userId, conversationId)
    }
  }

  private removeTypingUser(userId: number, conversationId: number): void {
    const currentTypingUsers = this.typingUsersSubject.getValue()
    this.typingUsersSubject.next(
      currentTypingUsers.filter((u) => !(u.id === userId && u.conversation_id === conversationId)),
    )
  }

  getTypingUsersForConversation(conversationId: number): TypingUser[] {
    return this.typingUsersSubject.getValue().filter((user) => user.conversation_id === conversationId)
  }

  sendTypingIndicator(conversationId: number): void {
    if (!this.isBrowser) return

    const token = this.authService.getAccessToken()
    if (!token) return

    fetch(`${environment.apiUrl}/chat/conversations/${conversationId}/typing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_typing: true }),
    }).catch(() => {
      // Silent error handling
    })
  }

  sendStopTypingIndicator(conversationId: number): void {
    if (!this.isBrowser) return

    const token = this.authService.getAccessToken()
    if (!token) return

    fetch(`${environment.apiUrl}/chat/conversations/${conversationId}/typing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_typing: false }),
    }).catch(() => {
      // Silent error handling
    })
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsersSubject.getValue().includes(userId)
  }

  disconnect(): void {
    if (this.echo) {
      // Leave all channels
      this.activeChannels.forEach((channelName) => {
        this.echo.leave(channelName)
      })

      this.activeChannels.clear()
      this.echo.disconnect()
      this.echo = null
    }

    // Clear all timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.typingTimeouts.clear()

    this.connectionStatus.set({
      status: "disconnected",
      timestamp: new Date(),
    })
  }

  reconnect(): void {
    this.disconnect()
    setTimeout(() => this.initialize(), 1000)
  }
}

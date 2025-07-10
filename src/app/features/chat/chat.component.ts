import { Contract, CreateContract } from './../shared/utils/interfaces';
import { QuotesService } from './../shared/services/quotes.service';
import { Conversation } from './../../core/interfaces/conversation.interface';
import {
  Component,
  type OnInit,
  signal,
  computed,
  inject,
  type OnDestroy,
  ViewChild,
  type ElementRef,
  type AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import type { Message } from '../../core/interfaces/conversation.interface';
import { ChatService } from './services/chat.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IQuote, IRequestForQuote } from '../shared/utils/interfaces';
import { RfqDetailsDialogComponent } from '../shared/rfq-details-dialog/rfq-details-dialog.component';
import { QuoteDetailsDialogComponent } from '../shared/quote-details-dialog/quote-details-dialog.component';
import { ContractDialogComponent } from '../shared/contract-dialog/contract-dialog.component';
import { ContractService } from '../shared/services/contract.service';
import { ContractDetailsDialogComponent } from '../shared/contract-details-dialog/contract-details-dialog.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ScrollPanelModule,
    AvatarModule,
    BadgeModule,
    CardModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    FormsModule,
    RfqDetailsDialogComponent,
    QuoteDetailsDialogComponent,
    ContractDialogComponent,
    ContractDetailsDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;
  private typingTimer?: ReturnType<typeof setTimeout>;
  dashboardType = signal<'seller' | 'buyer'>('buyer');

  selectedConversation = signal<Conversation | null>(null);
  newMessage = signal<string>('');
  searchQuery = signal<string>('');
  sendingMessage = signal<boolean>(false);
  quickEmojis = ['👍', '❤️', '😊', '😂', '😮', '😢', '🔥', '👏'];

  get newMessageValue(): string {
    return this.newMessage();
  }

  set newMessageValue(value: string) {
    this.newMessage.set(value);
  }

  get searchQueryValue(): string {
    return this.searchQuery();
  }

  set searchQueryValue(value: string) {
    this.searchQuery.set(value);
  }

  conversations = this.chatService.conversations;
  loading = this.chatService.loading;
  unreadCount = this.chatService.unreadCount;

  isConversationSelected = computed(() => this.selectedConversation() !== null);
  otherParticipant = computed(() => this.selectedConversation()?.other_participant || null);

  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const conversations = this.conversations();

    if (!query) return conversations;

    return conversations.filter(
      conv =>
        conv.other_participant?.full_name?.toLowerCase().includes(query) ||
        conv.other_participant?.company_name?.toLowerCase().includes(query) ||
        conv.last_message?.content?.toLowerCase().includes(query)
    );
  });

  currentUser = computed(() => this.authService.user());

  safeMessages = computed(() => {
    const conversation = this.selectedConversation();
    if (!conversation) return [];

    const messages = this.chatService.getMessagesForConversation(conversation.id);
    return Array.isArray(messages) ? messages : [];
  });

  currentConversationTypingUsers = computed(() => {
    const conversation = this.selectedConversation();
    return conversation ? this.chatService.getTypingUsersForConversation(conversation.id) : [];
  });

  getConversationsArray(): Conversation[] {
    return Array.isArray(this.conversations()) ? this.conversations() : [];
  }

  getUnreadConversationsCount(): number {
    return this.conversations().filter(c => c.unread_count > 0).length;
  }

  trackMessage(message: Message, index: number): string {
    return `${message.id}_${message.sent_at}_${index}`;
  }

  trackConversation(conversation: Conversation, index: number): string {
    return `${conversation.id}_${conversation.last_activity_at}_${index}`;
  }

  ngOnInit() {
    this.loadConversations();
    this.loadUnreadCount();
    this.route.queryParams.subscribe(params => {
      const conversationId = params['id'];
      if (conversationId) {
        const conversation = this.conversations().find(c => c.id === Number(conversationId));
        if (conversation) {
          this.selectConversation(conversation);
        }
      }
    });
    this.router.url.includes('seller')
      ? this.dashboardType.set('seller')
      : this.dashboardType.set('buyer');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // this.chatService.disconnect();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadConversations() {
    this.chatService
      .loadConversations({ per_page: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load conversations',
          });
        },
      });
  }

  loadUnreadCount() {
    this.chatService.getUnreadCount().pipe(takeUntil(this.destroy$)).subscribe();
  }

  loadMessages(conversationId: number) {
    this.chatService
      .loadMessages(conversationId, 1, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.shouldScrollToBottom = true;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load messages',
          });
        },
      });
  }

  sendMessage() {
    const messageText = this.newMessage().trim();
    const conversation = this.selectedConversation();

    if (!messageText || this.sendingMessage() || !conversation) return;

    this.sendingMessage.set(true);
    this.newMessage.set('');

    this.chatService
      .sendMessage(conversation.id, messageText)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.sendingMessage.set(false))
      )
      .subscribe({
        next: () => {
          this.shouldScrollToBottom = true;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to send message',
            detail: 'Please try again',
          });
        },
      });
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  }

  getMessageTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  isOwnMessage(message: Message): boolean {
    const currentUser = this.currentUser();
    if (!currentUser || !message) return false;

    return Number(message.sender_id) === Number(currentUser.id);
  }

  searchConversations() {
    const query = this.searchQuery().trim();

    if (!query) {
      this.loadConversations();
      return;
    }

    this.chatService
      .searchConversations(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Search Error',
            detail: 'Failed to search conversations',
          });
        },
      });
  }

  startNewConversation() {
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Start new conversation feature will be available soon',
    });
  }

  markConversationAsRead(conversationId: number) {
    this.chatService
      .markConversationAsRead(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onMessageInputChange(): void {
    const conversation = this.selectedConversation();
    if (!conversation) return;

    this.chatService.sendTypingIndicator(conversation.id);

    if (this.typingTimer) clearTimeout(this.typingTimer);

    this.typingTimer = setTimeout(() => {
      this.chatService.sendStopTypingIndicator(conversation.id);
    }, 1000);
  }

  onMessageInputBlur(): void {
    const conversation = this.selectedConversation();
    if (!conversation) return;

    this.chatService.sendStopTypingIndicator(conversation.id);

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = undefined;
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  getTypingIndicatorText(): string {
    const typingUsers = this.currentConversationTypingUsers();
    if (typingUsers.length === 0) return '';

    if (typingUsers.length === 1) {
      return `${typingUsers[0].full_name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].full_name} and ${typingUsers[1].full_name} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  }

  toggleAttachmentMenu(): void {
    console.log('Toggle attachment menu');
  }

  autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    const maxHeight = 120;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';
  }

  toggleEmojiPicker(): void {
    console.log('Toggle emoji picker');
  }

  openFileSelector(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,application/pdf,.doc,.docx';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        this.handleFileUpload(files);
      }
    };
    input.click();
  }

  addQuickEmoji(emoji: string): void {
    const currentMessage = this.newMessage();
    this.newMessage.set(currentMessage + emoji);
  }

  private handleFileUpload(files: FileList): void {
    console.log('Files selected:', files);
    this.messageService.add({
      severity: 'info',
      summary: 'File Upload',
      detail: `${files.length} file(s) selected. Upload functionality coming soon!`,
    });
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation.set(conversation);
    this.loadMessages(conversation.id);

    if (conversation.unread_count > 0) {
      this.markConversationAsRead(conversation.id);
    }
  }

  // handle messages of different types
  beingViewedQuote!: IQuote | null;
  beingViewedRFQ!: IRequestForQuote | null;
  quotesService = inject(QuotesService);
  quoteModalVisible = signal<boolean>(false);
  rfqModalVisible = signal<boolean>(false);
  createContractVisible = signal<boolean>(false);
  contractService = inject(ContractService);
  beingViewedContract!: Contract | null;
  contractModalVisible = signal<boolean>(false);

  viewQuote(message: Message): void {
    const match = message.content.match(/Quote\s+#(\d+)\s+for\s+RFQ\s+#(\d+)/);
    if (match) {
      const quoteId = parseInt(match[1], 10);
      this.quotesService.getQuoteById(quoteId).subscribe({
        next: response => {
          this.beingViewedQuote = response.data;
          this.quoteModalVisible.set(true);
        },
        error: () => {
          console.error('Failed to load quote details');
        },
      });
    }
  }
  viewRFQ(message: Message): void {
    const match = message.content.match(/Quote\s+#(\d+)\s+for\s+RFQ\s+#(\d+)/);
    if (match) {
      const rfqId = parseInt(match[2], 10);
      this.quotesService.getRFQById(rfqId).subscribe({
        next: response => {
          this.beingViewedRFQ = response.data;
          this.rfqModalVisible.set(true);
        },
      });
    }
  }
  closeRfqModal(): void {
    this.rfqModalVisible.set(false);
    this.beingViewedRFQ = null;
  }
  closeQuoteModal(): void {
    this.quoteModalVisible.set(false);
    this.beingViewedQuote = null;
  }
  acceptQuote(quote: IQuote) {
    this.quotesService.acceptQuote(quote.id).subscribe({
      next: () => {
        if (this.beingViewedQuote && this.beingViewedQuote.id === quote.id) {
          this.beingViewedQuote.status = 'accepted';
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Quote Accepted',
          detail: `Quote #${quote.id} has been accepted successfully`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to accept quote. Please try again.',
          life: 5000,
        });
      },
    });
  }

  rejectQuote(quote: IQuote) {
    this.quotesService.rejectQuote(quote.id).subscribe({
      next: () => {
        if (this.beingViewedQuote && this.beingViewedQuote.id === quote.id) {
          this.beingViewedQuote.status = 'rejected';
        }
        this.messageService.add({
          severity: 'warn',
          summary: 'Quote Rejected',
          detail: `Quote #${quote.id} has been rejected`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reject quote. Please try again.',
          life: 5000,
        });
      },
    });
  }

  createContract(quote: IQuote) {
    console.log('Creating contract for quote:', quote);
    this.quoteModalVisible.set(false);
    this.beingViewedQuote = quote;
    this.createContractVisible.set(true);
  }
  closeCreateContractModal(): void {
    this.createContractVisible.set(false);
    this.beingViewedQuote = null;
  }
  contractCreated(contractData: CreateContract): void {
    this.createContractVisible.set(false);
    this.contractService.createContract(contractData).subscribe({
      next: response => {
        const conversationId = this.selectedConversation()?.id || 0;
        if (conversationId === 0) {
          return;
        }
        this.chatService
          .sendMessage(
            conversationId,
            `Contract #${response.data.id} has been created successfully`,
            'contract'
          )
          .subscribe();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create contract. Please try again.',
          life: 5000,
        });
      },
    });
  }
  viewContract(message: Message): void {
    const match = message.content.match(/Contract\s+#(\d+)/);
    if (match) {
      const contractId = parseInt(match[1], 10);
      this.contractService.getContract(contractId).subscribe({
        next: response => {
          this.beingViewedContract = response.data;
          this.contractModalVisible.set(true);
        },
        error: () => {
          console.error('Failed to load contract details');
        },
      });
    }
  }
  closeContractModal(): void {
    this.contractModalVisible.set(false);
    this.beingViewedContract = null;
  }
  approveContract(contract: Contract): void {
    this.contractService.approveContract(contract.id).subscribe({
      next: response => {
        this.beingViewedContract = response.data;
        this.messageService.add({
          severity: 'success',
          summary: 'Contract Approved',
          detail: `Contract #${contract.id} has been approved successfully`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve contract. Please try again.',
          life: 5000,
        });
      },
    });
  }
}

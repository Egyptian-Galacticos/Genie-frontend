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
import { ProgressBarModule } from 'primeng/progressbar';
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
    ProgressBarModule,
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
  private isUserViewingChat = signal<boolean>(false);
  private lastReadMessageId = signal<number | null>(null);
  private attemptedReadMessages = new Set<number>();
  private lastMarkReadTime = 0;

  dashboardType = signal<'seller' | 'buyer'>('buyer');

  selectedConversation = signal<Conversation | null>(null);
  newMessage = signal<string>('');
  searchQuery = signal<string>('');
  sendingMessage = signal<boolean>(false);
  selectedFiles = signal<File[]>([]);

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
    const safeMessages = Array.isArray(messages) ? messages : [];

    // Auto-mark messages as read when user is viewing the chat
    if (this.isUserViewingChat() && safeMessages.length > 0) {
      this.markUnreadMessagesAsRead(safeMessages);
    }

    return safeMessages;
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

    // Listen for new messages to handle auto-scroll and read events
    this.chatService.newMessage$.pipe(takeUntil(this.destroy$)).subscribe(message => {
      this.handleNewMessage(message);
    });

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
    this.chatService.setActiveConversationId(null); // Clear active conversation on destroy
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
      .loadConversations({ size: 50 })
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
    const files = this.selectedFiles();

    if ((!messageText && files.length === 0) || this.sendingMessage() || !conversation) return;

    this.sendingMessage.set(true);
    this.newMessage.set('');

    // Determine message type based on content and files
    let messageType: 'text' | 'file' = 'text';
    if (files.length > 0 && !messageText) {
      messageType = 'file';
    } else if (files.length > 0 && messageText) {
      messageType = 'text'; // Mixed content, treat as text with attachments
    }

    // Always send content, even if empty string for file-only messages
    const content = messageText || '';

    this.chatService
      .sendMessage(conversation.id, content, messageType, files)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.sendingMessage.set(false))
      )
      .subscribe({
        next: () => {
          this.selectedFiles.set([]);
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
      .subscribe({
        next: () => {
          // Clear attempted messages since all messages in conversation are now read
          this.attemptedReadMessages.clear();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark conversation as read',
          });
        },
      });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private markUnreadMessagesAsRead(messages: Message[]): void {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    // Debounce: don't mark as read more frequently than every 2 seconds
    const now = Date.now();
    if (now - this.lastMarkReadTime < 2000) {
      return;
    }
    this.lastMarkReadTime = now;

    // Find unread messages from other users
    const unreadMessages = messages.filter(
      message => !message.is_read && message.sender_id !== currentUser.id
    );

    // Mark each unread message as read
    unreadMessages.forEach(message => {
      if (!this.attemptedReadMessages.has(message.id)) {
        this.chatService.markMessageAsRead(message.id).subscribe({
          next: () => {
            this.lastReadMessageId.set(message.id);
            this.attemptedReadMessages.add(message.id);
          },
          error: error => {
            console.error('Error marking message as read:', error);
            // If we get a 500 error, it might mean the message is already read
            // Add it to attempted set to prevent retries
            if (error.status === 500) {
              this.attemptedReadMessages.add(message.id);
            }
          },
        });
      }
    });
  }

  // Auto-scroll when new messages arrive
  private handleNewMessage(message: Message): void {
    const conversation = this.selectedConversation();
    if (conversation && message.conversation_id === conversation.id) {
      // Auto-scroll to bottom for new messages
      this.shouldScrollToBottom = true;

      // Auto-mark as read if user is viewing the chat
      if (
        this.isUserViewingChat() &&
        !this.isOwnMessage(message) &&
        !this.attemptedReadMessages.has(message.id)
      ) {
        this.chatService.markMessageAsRead(message.id).subscribe({
          next: () => {
            this.attemptedReadMessages.add(message.id);
          },
          error: error => {
            console.error('Error marking new message as read:', error);
            // Don't add to attempted set on error to allow retry
          },
        });
      }
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

  openFileSelector(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        this.handleFileUpload(files);
      }
    };
    input.click();
  }

  private handleFileUpload(files: FileList): void {
    const fileArray = Array.from(files);

    // Validate files
    const validFiles: File[] = [];
    fileArray.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'File Upload Error',
          detail: validation.error,
        });
      }
    });

    // Add valid files to selected files
    if (validFiles.length > 0) {
      this.selectedFiles.update(currentFiles => [...currentFiles, ...validFiles]);
    }
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    const maxFileSize = 10 * 1024 * 1024; // 10MB (matching backend)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(maxFileSize)}`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please upload images, PDFs, or Office documents.',
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeSelectedFile(file: File): void {
    this.selectedFiles.update(files => files.filter(f => f !== file));
  }

  getFileIcon(file: File): string {
    const type = file.type;
    if (type.startsWith('image/')) return 'pi pi-image';
    if (type === 'application/pdf') return 'pi pi-file-pdf';
    if (type.includes('word')) return 'pi pi-file-word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'pi pi-file-excel';
    if (type.includes('powerpoint') || type.includes('presentation'))
      return 'pi pi-file-powerpoint';
    return 'pi pi-file';
  }

  getFileIconForAttachment(attachment: { type?: string; mime_type?: string }): string {
    const type = attachment.type || attachment.mime_type || '';
    if (type.startsWith('image/')) return 'pi pi-image';
    if (type === 'application/pdf') return 'pi pi-file-pdf';
    if (type.includes('word')) return 'pi pi-file-word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'pi pi-file-excel';
    if (type.includes('powerpoint') || type.includes('presentation'))
      return 'pi pi-file-powerpoint';
    return 'pi pi-file';
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation.set(conversation);
    this.loadMessages(conversation.id);
    this.chatService.setActiveConversationId(conversation.id); // Track active conversation
    // Mark conversation as read when selected
    if (conversation.unread_count > 0) {
      this.markConversationAsRead(conversation.id);
    }

    // Set user as viewing the chat
    this.isUserViewingChat.set(true);
    this.lastReadMessageId.set(null);
    this.attemptedReadMessages.clear(); // Clear attempted messages when switching conversations
    this.lastMarkReadTime = 0; // Reset debounce timer when switching conversations
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
  paymentSubmit(contract: Contract, paymentReference: string): void {
    if (!paymentReference || paymentReference.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Transaction Number Required',
        detail: 'Please provide a valid transaction number.',
        life: 5000,
      });
      return;
    }

    // Validate transaction number format (10-25 alphanumeric characters)
    const transactionRegex = /\b[A-Z0-9]{10,25}\b/;
    if (!transactionRegex.test(paymentReference.trim())) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Transaction Number',
        detail: 'Transaction number must be 10-25 alphanumeric characters (A-Z, 0-9).',
        life: 5000,
      });
      return;
    }

    this.contractService.addBuyerTrxNo(contract.id, paymentReference).subscribe({
      next: response => {
        this.beingViewedContract = response.data;
        this.messageService.add({
          severity: 'success',
          summary: 'Payment Submitted and will be verified',
          detail: `Payment for contract #${contract.id} has been submitted successfully`,
          life: 3000,
        });
        this.contractModalVisible.set(false);
        this.beingViewedContract = null;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit payment. Please try again.',
          life: 5000,
        });
      },
    });
  }

  // Handle scroll events to mark messages as read when they become visible
  onMessagesScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;

    // If user is near bottom, mark all messages as read
    if (isNearBottom && this.isUserViewingChat()) {
      const messages = this.safeMessages();
      this.markUnreadMessagesAsRead(messages);
    }
  }

  // Handle when user leaves the chat view
  onChatBlur(): void {
    this.isUserViewingChat.set(false);
  }

  // Handle when user focuses on the chat view
  onChatFocus(): void {
    this.isUserViewingChat.set(true);
  }
}

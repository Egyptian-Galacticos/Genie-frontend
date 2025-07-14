export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  company_name: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  type: 'text' | 'image' | 'file' | 'quote' | 'rfq' | 'contract';
  sent_at: string;
  created_at: string;
  is_read: boolean;
  sender_id: number;
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
}

export interface Conversation {
  id: number;
  type: 'direct';
  title: string | null;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  seller: User;
  buyer: User;
  last_message: Message | null;
  other_participant: User | null;
  unread_count: number;
}

export interface ConversationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ConversationMeta;
}

export interface ConversationResponse extends ApiResponse<Conversation[]> {}
export interface MessageResponse extends ApiResponse<Message[]> {}

export interface ConversationListParams {
  page?: number;
  size?: number;
  type?: 'direct';
  is_active?: boolean;
}

// Backend specific interfaces
export interface StartConversationRequest {
  user_id: number;
  type?: 'direct';
  title?: string;
}

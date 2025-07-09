import { IUser } from '../../features/shared/utils/interfaces';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  company_name: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  sent_at: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  sender_id: number;
  sender: IUser;
  is_from_current_user?: boolean;
  time_ago?: string;
}

export interface Conversation {
  id: number;
  type: 'direct' | 'group';
  title: string;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  seller: User;
  buyer: User;
  last_message: Message | null;
  other_participant: User;
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
  per_page?: number;
  type?: 'direct' | 'group';
  is_active?: boolean;
}

export interface SendMessageRequest {
  conversation_id: number;
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  attachments?: File[] | string[];
}

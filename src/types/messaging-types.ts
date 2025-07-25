// Messaging system için TypeScript type definitions
// Supabase şemasına göre tanımlandı

export interface Conversation {
  id: number; // bigint from Supabase
  title: string | null;
  creator_id: string; // uuid
  listing_id: number | null; // bigint, nullable
  last_message_at: string | null; // timestamp with time zone
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

export interface ConversationParticipant {
  id: string; // uuid
  conversation_id: number; // bigint
  user_id: string; // uuid
  last_read_at: string | null; // timestamp with time zone
  is_active: boolean;
  joined_at: string; // timestamp with time zone
}

export interface Message {
  id: number; // bigint
  conversation_id: number; // bigint
  sender_id: string; // uuid
  content: string;
  message_type: string; // character varying(50)
  is_read: boolean;
  metadata: Record<string, unknown> | null; // jsonb
  created_at: string; // timestamp with time zone
}

// Extended types with joins
export interface ExtendedMessage extends Message {
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ExtendedConversation extends Conversation {
  participants?: Array<{
    user_id: string;
    profiles?: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
}

export interface ConversationWithParticipant {
  conversation_id: number;
  conversations: Conversation | null;
}

// Service interfaces
export interface ConversationServiceInterface {
  findConversationBetweenUsers(
    user1Id: string, 
    user2Id: string
  ): Promise<Conversation | null>;
  
  createConversation(
    title: string, 
    creatorId: string, 
    listingId?: number | null
  ): Promise<Conversation>;
  
  addParticipant(
    conversationId: number, 
    userId: string
  ): Promise<ConversationParticipant>;
  
  getUserConversations(userId: string): Promise<ExtendedConversation[]>;
}

export interface MessageServiceInterface {
  sendMessage(
    conversationId: number, 
    senderId: string, 
    content: string
  ): Promise<Message>;
  
  getMessages(
    conversationId: number, 
    limit?: number
  ): Promise<ExtendedMessage[]>;
  
  markAsRead(messageId: number, userId: string): Promise<Message | null>;
  
  getUnreadCount(conversationId: number, userId: string): Promise<number>;
}

// UseMessaging hook return type
export interface UseMessagingReturn {
  conversations: Conversation[];
  messages: ExtendedMessage[];
  loading: boolean;
  error: string | null;
  sendOrStartConversationAndMessage: (
    recipientId: string, 
    content: string, 
    listingId?: number | null
  ) => Promise<{
    success: boolean;
    conversation: Conversation;
    message: Message;
  }>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  clearError: () => void;
  setError: (error: string | null) => void;
}

import { supabase } from '../lib/supabase';
import type { 
  Message, 
  ExtendedMessage, 
  MessageServiceInterface 
} from '../types/messaging-types.ts';

export const messageService: MessageServiceInterface = {
  /**
   * Konuşmaya mesaj gönderir
   */
  async sendMessage(conversationId: number, senderId: string, content: string): Promise<Message> {
    try {
      console.log('📤 Sending message:', { conversationId, senderId, contentLength: content?.length });
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent:', data.id);
      return data;
    } catch (error) {
      console.error('❌ sendMessage error:', error);
      throw error;
    }
  },

  /**
   * Konuşmanın mesajlarını getirir
   */
  async getMessages(conversationId: number, limit: number = 50): Promise<ExtendedMessage[]> {
    try {
      console.log('📥 Getting messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          content,
          sender_id,
          message_type,
          is_read,
          created_at,
          metadata,
          profiles:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting messages:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} messages`);
      return (data as unknown) as ExtendedMessage[];
    } catch (error) {
      console.error('❌ getMessages error:', error);
      throw error;
    }
  },

  /**
   * Mesajı okundu olarak işaretler
   */
  async markAsRead(messageId: number, userId: string): Promise<Message | null> {
    try {
      console.log('👁️ Marking message as read:', { messageId, userId });
      
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .neq('sender_id', userId) // Sadece başkasının mesajlarını okundu işaretle
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking message as read:', error);
        throw error;
      }

      console.log('✅ Message marked as read');
      return data;
    } catch (error) {
      console.error('❌ markAsRead error:', error);
      throw error;
    }
  },

  /**
   * Konuşmadaki okunmamış mesaj sayısını getirir
   */
  async getUnreadCount(conversationId: number, userId: string): Promise<number> {
    try {
      console.log('🔢 Getting unread count:', { conversationId, userId });
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        console.error('❌ Error getting unread count:', error);
        throw error;
      }

      console.log(`✅ Unread count: ${count || 0}`);
      return count || 0;
    } catch (error) {
      console.error('❌ getUnreadCount error:', error);
      throw error;
    }
  }
};

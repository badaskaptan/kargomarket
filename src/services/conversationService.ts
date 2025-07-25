import { supabase } from '../lib/supabase';
import type { 
  Conversation, 
  ConversationParticipant, 
  ConversationServiceInterface,
  ConversationWithParticipant,
  ExtendedConversation 
} from '../types/messaging-types.ts';

export const conversationService: ConversationServiceInterface = {
  /**
   * İki kullanıcı arasında mevcut konuşma bulur
   */
  async findConversationBetweenUsers(user1Id: string, user2Id: string): Promise<Conversation | null> {
    try {
      console.log('🔍 Looking for conversation between:', { user1Id, user2Id });
      
      // İki kullanıcının da katıldığı konuşmaları bul
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            id,
            title,
            last_message_at,
            created_at,
            creator_id,
            listing_id,
            updated_at
          )
        `)
        .eq('user_id', user1Id) as { data: ConversationWithParticipant[] | null, error: Error | null };

      if (error) {
        console.error('❌ Error finding conversations for user1:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No conversations found for user1');
        return null;
      }

      // Her konuşma için user2'nin de katılımcı olup olmadığını kontrol et
      for (const item of data) {
        const conversationId = item.conversation_id;
        
        const { data: user2Participant, error: user2Error } = await supabase
          .from('conversation_participants')
          .select('id')
          .eq('conversation_id', conversationId)
          .eq('user_id', user2Id)
          .eq('is_active', true)
          .single();

        if (user2Error && user2Error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('❌ Error checking user2 participation:', user2Error);
          continue;
        }

        if (user2Participant) {
          console.log('✅ Found existing conversation:', conversationId);
          return item.conversations as Conversation;
        }
      }

      console.log('ℹ️ No existing conversation found between users');
      return null;
    } catch (error) {
      console.error('❌ findConversationBetweenUsers error:', error);
      throw error;
    }
  },

  /**
   * Yeni konuşma oluşturur
   */
  async createConversation(title: string, creatorId: string, listingId: number | null = null): Promise<Conversation> {
    try {
      console.log('📝 Creating conversation:', { title, creatorId, listingId });
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          creator_id: creatorId,
          listing_id: listingId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating conversation:', error);
        throw error;
      }

      console.log('✅ Conversation created:', data.id);
      return data;
    } catch (error) {
      console.error('❌ createConversation error:', error);
      throw error;
    }
  },

  /**
   * Konuşmaya katılımcı ekler
   */
  async addParticipant(conversationId: number, userId: string): Promise<ConversationParticipant> {
    try {
      console.log('👥 Adding participant:', { conversationId, userId });
      
      const { data, error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding participant:', error);
        throw error;
      }

      console.log('✅ Participant added:', data.id);
      return data;
    } catch (error) {
      console.error('❌ addParticipant error:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının tüm konuşmalarını getirir (participants dahil)
   */
  async getUserConversations(userId: string): Promise<ExtendedConversation[]> {
    try {
      console.log('📋 Getting conversations for user:', userId);
      
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            id,
            title,
            last_message_at,
            created_at,
            creator_id,
            listing_id,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('conversations(last_message_at)', { ascending: false }) as { data: ConversationWithParticipant[] | null, error: Error | null };

      if (error) {
        console.error('❌ Error getting conversations:', error);
        throw error;
      }

      // Her konuşma için participants bilgisini de al
      const conversations = data?.map(item => item.conversations).filter((conv): conv is Conversation => conv !== null) || [];
      
      const extendedConversations: ExtendedConversation[] = [];
      for (const conversation of conversations) {
        const { data: participantsData, error: participantsError } = await supabase
          .from('conversation_participants')
          .select(`
            user_id,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('conversation_id', conversation.id)
          .eq('is_active', true);

        if (participantsError) {
          console.error('❌ Error getting participants:', participantsError);
          continue;
        }

        extendedConversations.push({
          ...conversation,
          participants: (participantsData as unknown) as ExtendedConversation['participants']
        });
      }

      console.log(`✅ Found ${extendedConversations.length} conversations with participants`);
      return extendedConversations;
    } catch (error) {
      console.error('❌ getUserConversations error:', error);
      throw error;
    }
  }
};

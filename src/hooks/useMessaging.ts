import { useState, useCallback, useEffect } from 'react';
import { conversationService } from '../services/conversationService.ts';
import { messageService } from '../services/messageService.ts';
import type { Conversation, ExtendedMessage } from '../types/messaging-types.ts';

export function useMessaging(currentUserId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ⚠️ CRITICAL: Bu fonksiyon ismi ListingsPage.tsx'in beklediği isim!
   * Değiştirmeyin: sendOrStartConversationAndMessage
   */
  const sendOrStartConversationAndMessage = useCallback(async (recipientId: string, content: string, listingId: number | null = null) => {
    if (!currentUserId) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    if (!recipientId) {
      throw new Error('Alıcı ID gerekli');
    }

    if (!content || content.trim() === '') {
      throw new Error('Mesaj içeriği boş olamaz');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting conversation and message process:', {
        currentUserId,
        recipientId,
        listingId,
        contentLength: content.length
      });

      // 1. Mevcut konuşmayı bul
      let conversation = await conversationService.findConversationBetweenUsers(currentUserId, recipientId);

      // 2. Konuşma yoksa yeni oluştur
      if (!conversation) {
        console.log('📝 Creating new conversation...');
        
        // Başlık oluştur
        const title = listingId ? `İlan Konuşması #${listingId}` : 'Genel Konuşma';
        
        // Konuşma oluştur
        conversation = await conversationService.createConversation(title, currentUserId, listingId);
        
        // Katılımcıları ekle
        await conversationService.addParticipant(conversation.id, currentUserId);
        await conversationService.addParticipant(conversation.id, recipientId);
        
        console.log('✅ New conversation created with participants');
      } else {
        console.log('✅ Using existing conversation:', conversation.id);
      }

      // 3. Mesaj gönder
      console.log('📤 Sending message...');
      const message = await messageService.sendMessage(conversation.id, currentUserId, content);
      
      console.log('🎉 Message sent successfully!');
      
      // 4. State'i güncelle (isteğe bağlı)
      setMessages(prev => [...prev, message]);
      
      return {
        success: true,
        conversation,
        message
      };

    } catch (err) {
      console.error('❌ Error in sendOrStartConversationAndMessage:', err);
      const errorMessage = err instanceof Error ? err.message : 'Mesaj gönderilemedi';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Kullanıcının konuşmalarını getirir
   */
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const userConversations = await conversationService.getUserConversations(currentUserId);
      setConversations(userConversations);
    } catch (err) {
      console.error('❌ Error loading conversations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Konuşmalar yüklenemedi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Belirli bir konuşmanın mesajlarını getirir
   */
  const loadMessages = useCallback(async (conversationId: number) => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const conversationMessages = await messageService.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Mesajlar yüklenemedi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Hata mesajını temizler
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load conversations when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId, loadConversations]);

  return {
    // State
    conversations,
    messages,
    loading,
    error,
    
    // Actions
    sendOrStartConversationAndMessage, // ⚠️ ListingsPage'in beklediği exact isim!
    loadConversations,
    loadMessages,
    clearError,
    setError
  };
}

// Named export for dynamic import
export { useMessaging as default };



import { useState, useCallback, useEffect } from 'react';
import { conversationService } from '../services/conversationService.ts';
import { messageService } from '../services/messageService.ts';
import type { ExtendedConversation, ExtendedMessage } from '../types/messaging-types.ts';

export function useMessaging(currentUserId: string | null) {
  // Konuşmayı silme fonksiyonu
  const deleteConversation = useCallback(async (conversationId: number) => {
    try {
      const { error } = await conversationService.deleteConversation(conversationId);
      if (error) throw error;
      setConversations(prev => prev.filter((c: ExtendedConversation) => c.id !== conversationId));
      return true;
    } catch {
      setError('Konuşma silinemedi');
      return false;
    }
  }, []);
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // Mesaj silme fonksiyonu
  const deleteMessage = useCallback(async (messageId: number) => {
    if (!currentUserId) return false;
    try {
      const result = await messageService.deleteMessage(messageId, currentUserId);
      if (result) {
        setMessages((prev: ExtendedMessage[]) => prev.filter((m: ExtendedMessage) => m.id !== messageId));
      }
      return result;
    } catch {
      setError('Mesaj silinemedi');
      return false;
    }
  }, [currentUserId]);



  // Kullanıcının konuşmalarını getirir
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const userConversations = await conversationService.getUserConversations(currentUserId);
      setConversations(userConversations);
    } catch {
      setError('Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);



  // Mesaj gönderme ve konuşma başlatma
  const sendOrStartConversationAndMessage = useCallback(async (
    recipientId: string,
    content: string,
    listingId: number | null = null,
    imageUrls?: string[],
    documentUrls?: string[]
  ) => {
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
      let conversation = await conversationService.findConversationBetweenUsers(currentUserId, recipientId);
      let isNewConversation = false;
      if (!conversation) {
        const title = listingId ? `İlan Konuşması #${listingId}` : 'Genel Konuşma';
        conversation = await conversationService.createConversation(title, currentUserId, listingId);
        await conversationService.addParticipant(conversation.id, currentUserId);
        await conversationService.addParticipant(conversation.id, recipientId);
        isNewConversation = true;
      }
      const message = await messageService.sendMessage(
        conversation.id,
        currentUserId,
        content,
        imageUrls,
        documentUrls
      );
      setMessages(prev => [...prev, message]);
      if (isNewConversation) {
        await loadConversations();
      }
      return {
        success: true,
        conversation,
        message
      };
    } catch (err) {
      setError('Mesaj gönderilemedi');
      throw err;
    } finally {

      setLoading(false);
    }
  }, [currentUserId, loadConversations]);

  // Belirli bir konuşmanın mesajlarını getirir
  const loadMessages = useCallback(async (conversationId: number) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const conversationMessages = await messageService.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch {
      setError('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Hata mesajını temizler
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId, loadConversations]);

  return {
    conversations,
    messages,
    loading,
    error,
    sendOrStartConversationAndMessage,
    loadConversations,
    loadMessages,
    clearError,
    setError,
    deleteMessage,
    deleteConversation
  };
}

export { useMessaging as default };

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useMessaging } from '../../hooks/useMessaging.ts';
import { MessageFileService } from '../../services/messageFileService';
import type { ExtendedConversation } from '../../types/messaging-types.ts';
import { 
  MessageCircle, 
  Send, 
  User, 
  Search, 
  Plus, 
  Clock, 
  Check, 
  CheckCheck,
  Smile,
  Paperclip,
  Image,
  X,
  File,
  Download
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessagesSection: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    loading, 
    error, 
    loadConversations, 
    loadMessages, 
    sendOrStartConversationAndMessage,
    clearError 
  } = useMessaging(user?.id || null);

  const [selectedConversation, setSelectedConversation] = useState<ExtendedConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id, loadConversations]);

  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id, loadMessages]);

  // Emoji picker dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !(event.target as Element).closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedConversation || !user?.id) return;

    try {
      setUploadingFiles(true);
      
      const imageUrls: string[] = [];
      const documentUrls: string[] = [];
      
      // Dosya varsa önce upload et
      if (selectedFiles.length > 0) {
        console.log('Files to upload:', selectedFiles.map(f => f.name));
        
        const uploadPromises = selectedFiles.map(async (file) => {
          const result = await MessageFileService.uploadFile(file, user.id);
          
          if (result.success && result.url) {
            if (MessageFileService.isImageFile(file)) {
              imageUrls.push(result.url);
            } else {
              documentUrls.push(result.url);
            }
          } else {
            console.error('File upload failed:', result.error);
            throw new Error(result.error || 'Dosya yüklenemedi');
          }
        });
        
        await Promise.all(uploadPromises);
      }

      // Mesajı URL'ler ile birlikte gönder  
      const messageContent = newMessage.trim() || (selectedFiles.length > 0 ? '📎 Dosya gönderildi' : '');
      
      await sendOrStartConversationAndMessage(
        selectedConversation.creator_id === user.id 
          ? selectedConversation.participants?.[0]?.user_id || ''
          : selectedConversation.creator_id,
        messageContent,
        null, // listingId
        imageUrls.length > 0 ? imageUrls : undefined,
        documentUrls.length > 0 ? documentUrls : undefined
      );
      
      setNewMessage('');
      setSelectedFiles([]);
      setShowEmojiPicker(false);
      
      // Mesajları yeniden yükle
      if (selectedConversation.id) {
        loadMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Mesaj gönderilirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openImageSelector = () => {
    imageInputRef.current?.click();
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredConversations = conversations.filter((conv: ExtendedConversation) => 
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants?.some((p: { user_id: string; profiles?: { full_name: string | null } }) => 
      p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Mesajlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex">
      {/* Sol Panel - Konuşma Listesi */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Mesajlar
            </h2>
            <button
              onClick={() => {/* TODO: Yeni konuşma modalı */}}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Yeni Konuşma"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Konuşma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Konuşma Listesi */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-700 mt-1"
              >
                Temizle
              </button>
            </div>
          )}

          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                {searchTerm ? 'Arama kriterine uygun konuşma bulunamadı' : 'Henüz mesajınız yok'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => {
                const otherParticipant = conversation.participants?.find(
                  (p: { user_id: string; profiles?: { full_name: string | null } }) => p.user_id !== user?.id
                );
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant?.profiles?.full_name || 'Kullanıcı'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.title || 'Başlık yok'}
                        </p>
                        {conversation.last_message_at && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-400">
                              {formatMessageTime(conversation.last_message_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Panel - Mesaj Detayı */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {selectedConversation.participants?.find((p: { user_id: string; profiles?: { full_name: string | null } }) => p.user_id !== user?.id)?.profiles?.full_name || 'Kullanıcı'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Henüz mesaj yok. İlk mesajı gönder!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMyMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMyMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Resim Ekleri */}
                        {message.image_urls && message.image_urls.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.image_urls.map((imageUrl: string, index: number) => (
                              <div key={`img-${index}`} className="relative">
                                <img 
                                  src={imageUrl} 
                                  alt={`Attachment ${index + 1}`}
                                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Dosya Ekleri */}
                        {message.document_urls && message.document_urls.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.document_urls.map((docUrl: string, index: number) => {
                              const fileName = docUrl.split('/').pop() || `Document ${index + 1}`;
                              return (
                                <div key={`doc-${index}`} className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded text-xs">
                                  <File className="h-3 w-3" />
                                  <span className="flex-1 truncate">{fileName}</span>
                                  <Download 
                                    className="h-3 w-3 cursor-pointer hover:opacity-70" 
                                    onClick={() => window.open(docUrl, '_blank')}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          isMyMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {isMyMessage && (
                            <div className="flex">
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mesaj Gönderme */}
            <div className="p-4 border-t border-gray-200">
              {/* Seçili Dosyalar Önizleme */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center bg-white p-2 rounded border text-xs">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-4 w-4 mr-1 text-blue-500" />
                        ) : (
                          <File className="h-4 w-4 mr-1 text-gray-500" />
                        )}
                        <span className="max-w-[100px] truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                          title="Dosyayı Kaldır"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2">
                {/* Dosya ve Resim Butonları */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    title="Emoji Ekle"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    onClick={openImageSelector}
                    className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded transition-colors"
                    title="Resim Ekle"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <button
                    onClick={openFileSelector}
                    className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded transition-colors"
                    title="Dosya Ekle"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                </div>

                {/* Mesaj Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Mesajınızı yazın..."
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 right-0 z-50 emoji-picker-container">
                      <EmojiPicker
                        onEmojiClick={handleEmojiSelect}
                        width={300}
                        height={400}
                      />
                    </div>
                  )}
                </div>

                {/* Gönder Butonu */}
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || loading || uploadingFiles}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  title="Mesaj Gönder"
                >
                  {uploadingFiles ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Gizli Dosya Input'ları */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="*/*"
                aria-label="Dosya seç"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept="image/*"
                aria-label="Resim seç"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mesajlaşmaya Başla</h3>
              <p className="text-sm">
                Sol taraftan bir konuşma seçin veya yeni bir konuşma başlatın
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesSection;

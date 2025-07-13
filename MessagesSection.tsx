import React, { useState, useRef } from 'react';
import { Search, Send, Paperclip, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessagesSection: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState('mehmet-kaya');
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversations = [
    {
      id: 'mehmet-kaya',
      name: 'Mehmet Kaya',
      lastMessage: 'İstanbul-Ankara Tekstil Yükü için teklif...',
      time: '14:32',
      unread: true
    },
    {
      id: 'ali-demir',
      name: 'Ali Demir',
      lastMessage: 'Merhaba, Ankara-Konya Gıda Taşıma için...',
      time: 'Dün',
      unread: false
    },
    {
      id: 'ayse-yilmaz',
      name: 'Ayşe Yılmaz',
      lastMessage: 'Teklifimi kabul ettiğiniz için teşekkür ederim...',
      time: '14.06',
      unread: false
    },
    {
      id: 'hakan-sahin',
      name: 'Hakan Şahin',
      lastMessage: 'Teklifim neden reddedildi acaba?',
      time: '12.06',
      unread: false
    }
  ];

  const messages = {
    'mehmet-kaya': [
      {
        id: 1,
        sender: 'other',
        text: 'Merhaba, İstanbul-Ankara Tekstil Yükü ilanınız için teklif vermek istiyorum.',
        time: '14:32'
      },
      {
        id: 2,
        sender: 'me',
        text: 'Merhaba, teklifinizi bekliyorum.',
        time: '14:35'
      },
      {
        id: 3,
        sender: 'other',
        text: '₺4.500 teklif ediyorum. 18 Haziran\'da yükü alabilirim.',
        time: '14:40'
      },
      {
        id: 4,
        sender: 'me',
        text: 'Teklifinizi değerlendiriyorum. Araç tipi nedir?',
        time: '14:42'
      },
      {
        id: 5,
        sender: 'other',
        text: '10 tonluk tenteli kamyonum var. Tüm evraklar tam.',
        time: '14:45'
      }
    ],
    'ali-demir': [
      {
        id: 1,
        sender: 'other',
        text: 'Merhaba, Ankara-Konya Gıda Taşıma ilanınız için teklif vermek istiyorum.',
        time: 'Dün, 09:30'
      },
      {
        id: 2,
        sender: 'me',
        text: 'Merhaba Ali Bey, buyurun teklifinizi dinliyorum.',
        time: 'Dün, 09:35'
      }
    ]
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Add message logic here
      setMessageText('');
    }
  };

  const handleSelectEmoji = (emojiData: { emoji: string }) => {
    setMessageText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mesajlar</h2>
        
        <div className="flex flex-col h-[calc(100vh-16rem)]">
          <div className="flex flex-1 border border-gray-200 rounded-lg overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="İsme göre ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-primary-50 border-l-4 border-primary-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {getInitials(conversation.name)}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-medium ${conversation.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {conversation.name}
                          </h3>
                          <p className={`text-sm truncate max-w-48 ${conversation.unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                        {conversation.unread && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center bg-white">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">
                    {getInitials(conversations.find(c => c.id === selectedConversation)?.name || '')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversations.find(c => c.id === selectedConversation)?.name}
                  </h3>
                  <p className="text-xs text-gray-500">Son görülme: Bugün 15:45</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 custom-scrollbar">
                <div className="space-y-4">
                  {messages[selectedConversation as keyof typeof messages]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                          message.sender === 'me'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <span
                          className={`text-xs block mt-1 ${
                            message.sender === 'me' ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 relative">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Emoji Ekle"
                      onClick={() => setShowEmojiPicker((v) => !v)}
                      tabIndex={0}
                    >
                      <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 z-50">
                        <EmojiPicker onEmojiClick={handleSelectEmoji} />
                      </div>
                    )}
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Dosya Ekle"
                      onClick={handleAttachClick}
                      tabIndex={0}
                    >
                      <Paperclip size={20} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="Dosya Ekle"
                      title="Dosya Ekle"
                    />
                    <input
                      type="text"
                      placeholder="Mesajınızı yazın..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    />
                    {attachedFile && (
                      <span className="ml-2 text-xs text-gray-500 truncate max-w-[100px]">{attachedFile.name}</span>
                    )}
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                    title="Gönder"
                  >
                    <span>Gönder</span>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;
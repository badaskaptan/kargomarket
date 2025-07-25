import React, { useState } from 'react';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useMessaging } from '../../hooks/useMessaging';

const MessagingTest = () => {
  const { user } = useAuth();
  const { sendOrStartConversationAndMessage, conversations, loading, error } = useMessaging(user?.id);
  
  const [recipientId, setRecipientId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [listingId, setListingId] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Lütfen giriş yapın');
      return;
    }

    if (!recipientId || !messageText) {
      alert('Alıcı ID ve mesaj gerekli');
      return;
    }

    try {
      const result = await sendOrStartConversationAndMessage(
        recipientId, 
        messageText, 
        listingId || null
      );
      
      console.log('✅ Mesaj gönderildi:', result);
      alert('Mesaj başarıyla gönderildi!');
      
      // Formu temizle
      setMessageText('');
      setRecipientId('');
      setListingId('');
      
    } catch (err) {
      console.error('❌ Mesaj gönderme hatası:', err);
      alert('Mesaj gönderilemedi: ' + (err?.message || err));
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mesajlaşma Test</h2>
        <p className="text-red-600">Mesajlaşmayı test etmek için lütfen giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mesajlaşma Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Mevcut Kullanıcı: <span className="font-semibold">{user.email}</span>
        </p>
        <p className="text-sm text-gray-600">
          Kullanıcı ID: <span className="font-semibold text-xs">{user.id}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Hata:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="space-y-4">
        <div>
          <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700 mb-1">
            Alıcı User ID (UUID)
          </label>
          <input
            type="text"
            id="recipientId"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="Alıcının user ID'si..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="listingId" className="block text-sm font-medium text-gray-700 mb-1">
            İlan ID (İsteğe Bağlı)
          </label>
          <input
            type="text"
            id="listingId"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="İlan ID (boş bırakılabilir)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 mb-1">
            Mesaj
          </label>
          <textarea
            id="messageText"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Mesajınızı yazın..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
        </button>
      </form>

      {conversations && conversations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Konuşmalarım ({conversations.length})</h3>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-2 bg-gray-50 rounded border">
                <p className="text-sm font-medium">{conv.title}</p>
                <p className="text-xs text-gray-600">
                  Son mesaj: {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString('tr-TR') : 'Henüz mesaj yok'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingTest;

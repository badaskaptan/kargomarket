import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { ExtendedListing } from '../../types/database-types';
import { useMessaging } from '../../hooks/useMessaging';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ExtendedListing;
  currentUserId: string | null;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, target, currentUserId }) => {
  const [messageText, setMessageText] = useState('');
  const { sendOrStartConversationAndMessage } = useMessaging(currentUserId);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (!target) return;
    setLoading(true);
    try {
      const receiverId = target.user_id || target.id;
      await sendOrStartConversationAndMessage(receiverId, messageText, target.id ? Number(target.id) : null);
      setMessageText('');
      onClose();
    } catch (err: unknown) {
      let errorMsg = 'Mesaj gönderilemedi.';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        errorMsg += ' ' + (err as { message: string }).message;
      } else {
        errorMsg += ' ' + String(err);
      }
      alert(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Kapat" aria-label="Kapat">
          <X size={24} />
        </button>
        <h3 className="text-lg font-bold mb-4">Mesaj Gönder</h3>
        <div className="mb-2 text-sm font-semibold uppercase text-gray-500">
          Alıcı: <span className="text-primary-600 font-bold underline cursor-pointer">{target?.owner_name || ''}</span>
        </div>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Alıcı</label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 font-semibold text-gray-900"
              value={target?.owner_name || ''}
              disabled
              readOnly
              title="Alıcı"
              aria-label="Alıcı"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mesajınız</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              rows={3}
              required
              title="Mesajınız"
              placeholder="Mesajınızı yazın..."
              aria-label="Mesajınız"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors transform hover:scale-105 flex items-center justify-center gap-2">
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;

import { useEffect, useState } from 'react';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService';

export function useUnreadMessagesCount(userId: string | null) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function fetchUnread() {
      setLoading(true);
      try {
        // Tüm konuşmaları al
        const conversations = await conversationService.getUserConversations(userId as string);
        let total = 0;
        for (const conv of conversations) {
          const unread = await messageService.getUnreadCount(conv.id, userId as string);
          total += unread;
        }
        if (isMounted) setCount(total);
      } catch {
        if (isMounted) setCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUnread();
    return () => { isMounted = false; };
  }, [userId]);

  return { count, loading };
}

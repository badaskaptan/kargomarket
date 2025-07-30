import { useState, useEffect, useCallback } from 'react';
import { OfferService } from '../services/offerService';
import { ServiceOfferService } from '../services/serviceOfferService';
import { conversationService } from '../services/conversationService';
import { messageService } from '../services/messageService'; // Okunmamış mesaj sayısı için
import { Tag, MessageCircle } from 'lucide-react'; // İkonlar için
import { formatDistanceToNow, parseISO } from 'date-fns'; // Zaman formatlama için
import { tr } from 'date-fns/locale'; // Türkçe dil desteği için

interface Activity {
  title: string;
  time: string;
  icon: React.ElementType;
  color: string;
  createdAt: Date;
}
export const useRecentActivities = (userId: string | undefined) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📊 useRecentActivities: Fetching activities for user ${userId}`);

      // --- Teklif Aktiviteleri ---
      const receivedOffersPromise = OfferService.getReceivedOffers(userId);
      const receivedServiceOffersPromise = ServiceOfferService.getReceivedServiceOffers(userId);

      const [receivedOffers, receivedServiceOffers] = await Promise.all([
        receivedOffersPromise,
        receivedServiceOffersPromise,
      ]);

      console.log(`📊 useRecentActivities: Fetched ${receivedOffers.length} received offers`);
      console.log(`📊 useRecentActivities: Fetched ${receivedServiceOffers.length} received service offers`);

      const offerActivities: Activity[] = [
        ...receivedOffers.map(offer => ({
          title: `${offer.listing?.title || 'İlanınıza'} yeni bir teklif geldi (₺${offer.price_amount})`,
          time: offer.created_at ? formatDistanceToNow(parseISO(offer.created_at), { addSuffix: true, locale: tr }) : 'Bilinmiyor',
          icon: Tag,
          color: 'green',
          createdAt: offer.created_at ? parseISO(offer.created_at) : new Date(0),
          // Gerekirse navigasyon bilgisi eklenebilir
        })),
        ...receivedServiceOffers.map(offer => ({
          title: `${offer.transport_service?.title || 'Nakliye Hizmetinize'} yeni bir service teklifi geldi (₺${offer.price_amount})`,
          time: offer.created_at ? formatDistanceToNow(parseISO(offer.created_at), { addSuffix: true, locale: tr }) : 'Bilinmiyor',
          icon: Tag,
          color: 'green',
          createdAt: offer.created_at ? parseISO(offer.created_at) : new Date(0),
          // Gerekirse navigasyon bilgisi eklenebilir
        })),
        // Kabul edilen/Reddedilen/Geri çekilen teklifler de buraya eklenebilir
      ];

      // --- Mesajlaşma Aktiviteleri ---
      const conversations = await conversationService.getUserConversations(userId);
      console.log(`📊 useRecentActivities: Fetched ${conversations.length} conversations`);

      const messageActivities: Activity[] = [];
      for (const conversation of conversations) {
        if (conversation.last_message_at) {
          // Okunmamış mesaj sayısını al (performans için optimize edilebilir)
          const unreadCount = await messageService.getUnreadCount(conversation.id, userId);
          if (unreadCount > 0) {
            // Son mesajı çekip başlıkta gösterebiliriz veya sadece genel bir mesaj bırakabiliriz.
            // Şimdilik sadece okunmamış mesaj sayısını belirten genel bir aktivite ekleyelim.
            messageActivities.push({
              title: `${conversation.title || 'Bir konuşmada'} ${unreadCount} okunmamış mesajınız var.`,
              time: formatDistanceToNow(parseISO(conversation.last_message_at), { addSuffix: true, locale: tr }),
              icon: MessageCircle,
              color: 'blue',
              createdAt: parseISO(conversation.last_message_at),
              // Gerekirse navigasyon bilgisi (konuşma ID'si) eklenebilir
            });
          } else {
            // Okunmuş olsa bile son mesaj aktivitesini göstermek istersek buraya ekleyebiliriz.
            // Şimdilik sadece okunmamışları alalım.
          }
        } else if (conversation.created_at) {
          // Henüz mesajlaşma olmamış ama yeni başlayan bir konuşma varsa
          messageActivities.push({
            title: `${conversation.title || 'Yeni bir konuşma'} başladı.`,
            time: formatDistanceToNow(parseISO(conversation.created_at), { addSuffix: true, locale: tr }),
            icon: MessageCircle,
            color: 'blue',
            createdAt: parseISO(conversation.created_at),
          });
        }
      }

      // --- Diğer Aktiviteler (İşlem Tamamlama vb.) ---
      // Bu kısım için ilan veya teklif tablolarındaki status değişikliklerini veya ayrı bir 'transactions' tablosunu kontrol etmek gerekebilir.
      // Şimdilik mock bir tamamlama aktivitesi ekleyelim.

      const otherActivities: Activity[] = [];
      // Örnek (canlı veriden çekilmediği için yoruma alındı):
      // if (Math.random() > 0.8) { // Rastgele göstermek için
      //    otherActivities.push({
      //     title: 'Son işleminiz başarıyla tamamlandı!',
      //     time: formatDistanceToNow(new Date(), { addSuffix: true, locale: tr }),
      //     icon: CheckCheck,
      //     color: 'purple',
      //     createdAt: new Date(),
      //    });
      // }


      // --- Tüm Aktiviteleri Birleştir ve Sırala ---
      const allActivities = [
        ...offerActivities,
        ...messageActivities,
        ...otherActivities,
      ];

      // Zaman damgasına göre azalan sırada sırala
      allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Sadece ilk N tanesini göster (isteğe bağlı limit)
      const recentActivities = allActivities.slice(0, 10); // İlk 10 aktiviteyi al

      setActivities(recentActivities);

    } catch (err) {
      console.error('❌ useRecentActivities: Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Son etkinlikler alınamadı.');
      setActivities([]); // Hata durumunda boş liste
    } finally {
      setLoading(false);
    }
  }, [userId]); // userId değiştiğinde fetchActivities yeniden oluşturulmalı

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]); // fetchActivities değiştiğinde (userId değiştiğinde) effect çalışır

  return {
    recentActivities: activities,
    loadingRecentActivities: loading,
    recentActivitiesError: error,
    refetchRecentActivities: fetchActivities,
  };
};

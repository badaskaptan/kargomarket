import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EmailNotificationService } from '../services/emailNotificationService';

// Email bildirimleri için custom hook
export const useEmailNotifications = () => {
  
  // Yeni ilan eklendiğinde otomatik email gönderimi
  const notifyNewAd = async (adData: {
    id: string;
    title: string;
    from_city: string;
    to_city: string;
    cargo_type: string;
    price: number;
    delivery_date: string;
    created_by: string;
  }) => {
    try {
      await EmailNotificationService.sendNewAdNotification({
        ad_id: adData.id,
        title: adData.title,
        route: `${adData.from_city} - ${adData.to_city}`,
        cargo_type: adData.cargo_type,
        price: `${adData.price} TL`,
        delivery_date: adData.delivery_date,
        publisher_id: adData.created_by
      });
    } catch (error) {
      console.error('Yeni ilan email bildirimi hatası:', error);
    }
  };

  // Yeni mesaj eklendiğinde otomatik email gönderimi
  const notifyNewMessage = async (messageData: {
    id: string;
    sender_id: string;
    recipient_id: string;
    subject: string;
    content: string;
  }) => {
    try {
      // Gönderen ve alıcı bilgilerini al
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', messageData.sender_id)
        .single();

      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', messageData.recipient_id)
        .single();

      if (recipientProfile) {
        await EmailNotificationService.sendNewMessageNotification({
          message_id: messageData.id,
          sender_id: messageData.sender_id,
          sender_name: senderProfile?.name || 'Bir kullanıcı',
          recipient_id: messageData.recipient_id,
          recipient_email: recipientProfile.email,
          recipient_name: recipientProfile.name || 'Değerli Kullanıcı',
          subject: messageData.subject,
          message_preview: messageData.content.substring(0, 100) + (messageData.content.length > 100 ? '...' : '')
        });
      }
    } catch (error) {
      console.error('Yeni mesaj email bildirimi hatası:', error);
    }
  };

  // Yeni teklif eklendiğinde otomatik email gönderimi
  const notifyNewOffer = async (offerData: {
    id: string;
    ad_id: string;
    bidder_id: string;
    offered_price: number;
    message?: string;
  }) => {
    try {
      // İlan bilgilerini al
      const { data: adData } = await supabase
        .from('ads')
        .select('title, created_by')
        .eq('id', offerData.ad_id)
        .single();

      if (!adData) return;

      // Teklif veren bilgilerini al
      const { data: bidderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', offerData.bidder_id)
        .single();

      // İlan sahibi bilgilerini al
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', adData.created_by)
        .single();

      if (ownerProfile) {
        await EmailNotificationService.sendNewOfferNotification({
          offer_id: offerData.id,
          ad_id: offerData.ad_id,
          ad_title: adData.title,
          sender_id: offerData.bidder_id,
          sender_name: bidderProfile?.name || 'Bir kullanıcı',
          recipient_id: adData.created_by,
          recipient_email: ownerProfile.email,
          recipient_name: ownerProfile.name || 'Değerli Kullanıcı',
          offer_price: `${offerData.offered_price} TL`,
          offer_message: offerData.message || 'Teklif mesajı yok'
        });
      }
    } catch (error) {
      console.error('Yeni teklif email bildirimi hatası:', error);
    }
  };

  return {
    notifyNewAd,
    notifyNewMessage,
    notifyNewOffer
  };
};

// Kullanıcı bildirim tercihleri için hook
export const useNotificationPreferences = () => {
  
  // Kullanıcının bildirim tercihlerini al
  const getPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Eğer tercih bulunamazsa varsayılan tercihleri oluştur
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: userId,
            email_notifications: true,
            new_ad_notifications: true,
            new_message_notifications: true,
            new_offer_notifications: true,
            newsletter_notifications: true,
            system_notifications: true,
            notification_frequency: 'instant'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    } catch (error) {
      console.error('Bildirim tercihleri alınırken hata:', error);
      throw error;
    }
  };

  // Kullanıcının bildirim tercihlerini güncelle
  const updatePreferences = async (userId: string, preferences: {
    email_notifications?: boolean;
    new_ad_notifications?: boolean;
    new_message_notifications?: boolean;
    new_offer_notifications?: boolean;
    newsletter_notifications?: boolean;
    system_notifications?: boolean;
    notification_frequency?: 'instant' | 'daily' | 'weekly' | 'never';
    preferred_notification_time?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Bildirim tercihleri güncellenirken hata:', error);
      throw error;
    }
  };

  return {
    getPreferences,
    updatePreferences
  };
};

// Email kuyruğu yönetimi için hook (admin kullanımı)
export const useEmailQueue = () => {
  
  // Bekleyen email'leri al
  const getPendingEmails = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('is_sent', false)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Bekleyen emailler alınırken hata:', error);
      throw error;
    }
  };

  // Email istatistiklerini al
  const getEmailStats = async () => {
    try {
      const { data, error } = await supabase
        .from('email_notification_stats')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Email istatistikleri alınırken hata:', error);
      throw error;
    }
  };

  // Email'i manuel olarak yeniden gönder
  const retryEmail = async (emailId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .update({
          is_sent: false,
          failed_attempts: 0,
          last_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', emailId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Email yeniden gönderilirken hata:', error);
      throw error;
    }
  };

  // Başarısız email'leri sil
  const deleteFailedEmails = async () => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .delete()
        .gte('failed_attempts', 5)
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 gün önce

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Başarısız emailler silinirken hata:', error);
      throw error;
    }
  };

  return {
    getPendingEmails,
    getEmailStats,
    retryEmail,
    deleteFailedEmails
  };
};

// Otomatik email işleme için background hook
export const useEmailProcessor = () => {
  
  useEffect(() => {
    // Email kuyruğunu düzenli olarak kontrol et (development ortamında)
    const interval = setInterval(async () => {
      try {
        // Bu fonksiyon production'da cron job olarak çalışacak
        // Development için manuel kontrol
        await EmailNotificationService.processPendingEmails();
      } catch (error) {
        console.error('Email kuyruğu işlenirken hata:', error);
      }
    }, 5 * 60 * 1000); // 5 dakikada bir

    return () => clearInterval(interval);
  }, []);

  // Haftalık newsletter'ı manuel başlat (development için)
  const triggerWeeklyNewsletter = async () => {
    try {
      await EmailNotificationService.sendWeeklyNewsletter();
      console.log('Haftalık newsletter gönderim kuyruğa eklendi');
    } catch (error) {
      console.error('Haftalık newsletter hatası:', error);
      throw error;
    }
  };

  return {
    triggerWeeklyNewsletter
  };
};

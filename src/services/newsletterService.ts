import { supabase } from '../lib/supabase';

export interface NewsletterSubscription {
  id?: string;
  email: string;
  subscribed_at?: string;
  is_active?: boolean;
}

export class NewsletterService {
  static async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // E-posta formatı kontrolü
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Geçerli bir e-posta adresi girin.' };
      }

      // Zaten abone olup olmadığını kontrol et
      const { data: existing } = await supabase
        .from('newsletter_subscriptions')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (existing) {
        if (existing.is_active) {
          return { success: false, message: 'Bu e-posta adresi zaten abone.' };
        } else {
          // Deaktif aboneliği aktifleştir
          await supabase
            .from('newsletter_subscriptions')
            .update({ is_active: true, subscribed_at: new Date().toISOString() })
            .eq('email', email);
          return { success: true, message: 'Aboneliğiniz yeniden aktifleştirildi!' };
        }
      }

      // Yeni abonelik ekle
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
          email,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          ip_address: null // IP client tarafında alınamaz
        }]);

      if (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, message: 'Abonelik sırasında bir hata oluştu.' };
      }

      return { success: true, message: 'Başarıyla abone oldunuz!' };
    } catch (error) {
      console.error('Newsletter service error:', error);
      return { success: false, message: 'Beklenmeyen bir hata oluştu.' };
    }
  }

  static async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ is_active: false })
        .eq('email', email);

      if (error) throw error;

      return { success: true, message: 'Aboneliğiniz iptal edildi.' };
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      return { success: false, message: 'Abonelik iptali sırasında hata oluştu.' };
    }
  }

  // Admin için: Tüm aboneleri getir
  static async getAllSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get subscriptions error:', error);
      return [];
    }
  }
}

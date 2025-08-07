import { supabase } from '../lib/supabase';

export interface EmailNotification {
  id?: string;
  recipient_email: string;
  recipient_user_id?: string;
  notification_type: 'new_ad' | 'new_message' | 'new_offer' | 'newsletter' | 'system';
  subject: string;
  content: string;
  sender_name?: string;
  sender_id?: string;
  related_ad_id?: string;
  related_message_id?: string;
  related_offer_id?: string;
  is_sent: boolean;
  sent_at?: string;
  created_at?: string;
}

export interface EmailTemplate {
  type: string;
  subject: string;
  content: string;
}

export class EmailNotificationService {
  private static readonly EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
    new_ad: {
      type: 'new_ad',
      subject: 'KargoMarket - Size Uygun Yeni İlan!',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1>🚛 KargoMarket</h1>
            <h2>Size Uygun Yeni İlan!</h2>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p>Merhaba <strong>{{recipient_name}}</strong>,</p>
            <p>Kriterlerinize uygun yeni bir ilan yayınlandı:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1e40af;">
              <h3>{{ad_title}}</h3>
              <p><strong>Güzergah:</strong> {{route}}</p>
              <p><strong>Yük Tipi:</strong> {{cargo_type}}</p>
              <p><strong>Fiyat:</strong> {{price}}</p>
              <p><strong>Tarih:</strong> {{delivery_date}}</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="{{ad_link}}" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">İlanı Görüntüle</a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Bu bildirimi almak istemiyorsanız <a href="{{unsubscribe_link}}">buradan</a> aboneliğinizi iptal edebilirsiniz.
            </p>
          </div>
        </div>
      `
    },
    
    new_message: {
      type: 'new_message',
      subject: 'KargoMarket - Yeni Mesajınız Var!',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; color: white; padding: 20px; text-align: center;">
            <h1>💬 KargoMarket</h1>
            <h2>Yeni Mesajınız Var!</h2>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p>Merhaba <strong>{{recipient_name}}</strong>,</p>
            <p><strong>{{sender_name}}</strong> size yeni bir mesaj gönderdi:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #059669;">
              <p><strong>Gönderen:</strong> {{sender_name}}</p>
              <p><strong>Konu:</strong> {{message_subject}}</p>
              <div style="background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px;">
                <p>{{message_preview}}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="{{message_link}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Mesajı Görüntüle</a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Bu bildirimi almak istemiyorsanız <a href="{{unsubscribe_link}}">buradan</a> aboneliğinizi iptal edebilirsiniz.
            </p>
          </div>
        </div>
      `
    },
    
    new_offer: {
      type: 'new_offer',
      subject: 'KargoMarket - Yeni Teklif Aldınız!',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1>💰 KargoMarket</h1>
            <h2>Yeni Teklif Aldınız!</h2>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p>Merhaba <strong>{{recipient_name}}</strong>,</p>
            <p><strong>{{sender_name}}</strong> ilanınız için yeni bir teklif verdi:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626;">
              <p><strong>İlan:</strong> {{ad_title}}</p>
              <p><strong>Teklif Veren:</strong> {{sender_name}}</p>
              <p><strong>Teklif Edilen Fiyat:</strong> <span style="font-size: 18px; color: #dc2626; font-weight: bold;">{{offer_price}} TL</span></p>
              <p><strong>Mesaj:</strong> {{offer_message}}</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="{{offer_link}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">Teklifi Görüntüle</a>
              <a href="{{accept_link}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Teklifi Kabul Et</a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Bu bildirimi almak istemiyorsanız <a href="{{unsubscribe_link}}">buradan</a> aboneliğinizi iptal edebilirsiniz.
            </p>
          </div>
        </div>
      `
    },
    
    newsletter: {
      type: 'newsletter',
      subject: 'KargoMarket - Haftalık Bülten',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
            <h1>📧 KargoMarket</h1>
            <h2>Haftalık Bülten</h2>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p>Merhaba <strong>{{recipient_name}}</strong>,</p>
            <p>Bu hafta KargoMarket'te neler oldu:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>📊 Bu Hafta</h3>
              <ul>
                <li><strong>{{new_ads_count}}</strong> yeni ilan yayınlandı</li>
                <li><strong>{{completed_orders}}</strong> başarılı teslimat gerçekleşti</li>
                <li><strong>{{new_users}}</strong> yeni üye katıldı</li>
              </ul>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>🔥 Popüler İlanlar</h3>
              {{popular_ads}}
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="{{site_link}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Siteyi Ziyaret Et</a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Bu bildirimi almak istemiyorsanız <a href="{{unsubscribe_link}}">buradan</a> aboneliğinizi iptal edebilirsiniz.
            </p>
          </div>
        </div>
      `
    }
  };

  // Yeni ilan bildirimi gönder
  static async sendNewAdNotification(adData: {
    ad_id: string;
    title: string;
    route: string;
    cargo_type: string;
    price: string;
    delivery_date: string;
    publisher_id: string;
  }) {
    try {
      // İlgili kullanıcıları bul (aynı güzergah, kargo tipi vs.)
      const interestedUsers = await this.findInterestedUsers(adData);
      
      for (const user of interestedUsers) {
        const emailData: EmailNotification = {
          recipient_email: user.email,
          recipient_user_id: user.id,
          notification_type: 'new_ad',
          subject: this.EMAIL_TEMPLATES.new_ad.subject,
          content: this.replaceTemplateVariables(this.EMAIL_TEMPLATES.new_ad.content, {
            recipient_name: user.name || 'Değerli Kullanıcı',
            ad_title: adData.title,
            route: adData.route,
            cargo_type: adData.cargo_type,
            price: adData.price,
            delivery_date: adData.delivery_date,
            ad_link: `${process.env.VITE_APP_URL}/ads/${adData.ad_id}`,
            unsubscribe_link: `${process.env.VITE_APP_URL}/unsubscribe?email=${user.email}`,
            admin_contact: 'emrahbadas@gmail.com'
          }),
          related_ad_id: adData.ad_id,
          is_sent: false
        };

        await this.queueEmail(emailData);
      }

      console.log(`Yeni ilan bildirimi ${interestedUsers.length} kullanıcıya gönderildi`);
    } catch (error) {
      console.error('Yeni ilan bildirimi gönderme hatası:', error);
    }
  }

  // Yeni mesaj bildirimi gönder
  static async sendNewMessageNotification(messageData: {
    message_id: string;
    sender_id: string;
    sender_name: string;
    recipient_id: string;
    recipient_email: string;
    recipient_name: string;
    subject: string;
    message_preview: string;
  }) {
    try {
      const emailData: EmailNotification = {
        recipient_email: messageData.recipient_email,
        recipient_user_id: messageData.recipient_id,
        notification_type: 'new_message',
        subject: this.EMAIL_TEMPLATES.new_message.subject,
        content: this.replaceTemplateVariables(this.EMAIL_TEMPLATES.new_message.content, {
          recipient_name: messageData.recipient_name,
          sender_name: messageData.sender_name,
          message_subject: messageData.subject,
          message_preview: messageData.message_preview,
          message_link: `${process.env.VITE_APP_URL}/messages/${messageData.message_id}`,
          unsubscribe_link: `${process.env.VITE_APP_URL}/unsubscribe?email=${messageData.recipient_email}`,
          admin_contact: 'emrahbadas@gmail.com'
        }),
        sender_name: messageData.sender_name,
        sender_id: messageData.sender_id,
        related_message_id: messageData.message_id,
        is_sent: false
      };

      await this.queueEmail(emailData);
      console.log(`Yeni mesaj bildirimi gönderildi: ${messageData.recipient_email}`);
    } catch (error) {
      console.error('Yeni mesaj bildirimi gönderme hatası:', error);
    }
  }

  // Yeni teklif bildirimi gönder
  static async sendNewOfferNotification(offerData: {
    offer_id: string;
    ad_id: string;
    ad_title: string;
    sender_id: string;
    sender_name: string;
    recipient_id: string;
    recipient_email: string;
    recipient_name: string;
    offer_price: string;
    offer_message: string;
  }) {
    try {
      const emailData: EmailNotification = {
        recipient_email: offerData.recipient_email,
        recipient_user_id: offerData.recipient_id,
        notification_type: 'new_offer',
        subject: this.EMAIL_TEMPLATES.new_offer.subject,
        content: this.replaceTemplateVariables(this.EMAIL_TEMPLATES.new_offer.content, {
          recipient_name: offerData.recipient_name,
          sender_name: offerData.sender_name,
          ad_title: offerData.ad_title,
          offer_price: offerData.offer_price,
          offer_message: offerData.offer_message,
          offer_link: `${process.env.VITE_APP_URL}/offers/${offerData.offer_id}`,
          accept_link: `${process.env.VITE_APP_URL}/offers/${offerData.offer_id}/accept`,
          unsubscribe_link: `${process.env.VITE_APP_URL}/unsubscribe?email=${offerData.recipient_email}`,
          admin_contact: 'emrahbadas@gmail.com'
        }),
        sender_name: offerData.sender_name,
        sender_id: offerData.sender_id,
        related_ad_id: offerData.ad_id,
        related_offer_id: offerData.offer_id,
        is_sent: false
      };

      await this.queueEmail(emailData);
      console.log(`Yeni teklif bildirimi gönderildi: ${offerData.recipient_email}`);
    } catch (error) {
      console.error('Yeni teklif bildirimi gönderme hatası:', error);
    }
  }

  // Haftalık newsletter gönder
  static async sendWeeklyNewsletter() {
    try {
      // Newsletter abonelerini al
      const { data: subscribers } = await supabase
        .from('newsletter_subscriptions')
        .select('email')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (!subscribers?.length) {
        console.log('Newsletter abonesi bulunamadı');
        return;
      }

      // Bu haftanın istatistiklerini al
      const stats = await this.getWeeklyStats();

      for (const subscriber of subscribers) {
        const emailData: EmailNotification = {
          recipient_email: subscriber.email,
          notification_type: 'newsletter',
          subject: this.EMAIL_TEMPLATES.newsletter.subject,
          content: this.replaceTemplateVariables(this.EMAIL_TEMPLATES.newsletter.content, {
            recipient_name: 'Değerli Abone',
            new_ads_count: stats.new_ads_count,
            completed_orders: stats.completed_orders,
            new_users: stats.new_users,
            popular_ads: stats.popular_ads_html,
            site_link: process.env.VITE_APP_URL || 'https://kargomarketing.com',
            unsubscribe_link: `${process.env.VITE_APP_URL}/unsubscribe?email=${subscriber.email}`,
            admin_contact: 'emrahbadas@gmail.com'
          }),
          is_sent: false
        };

        await this.queueEmail(emailData);
      }

      console.log(`Haftalık newsletter ${subscribers.length} aboneye gönderildi`);
    } catch (error) {
      console.error('Haftalık newsletter gönderme hatası:', error);
    }
  }

  // Email'i kuyruğa ekle
  private static async queueEmail(emailData: EmailNotification) {
    const { error } = await supabase
      .from('email_notifications')
      .insert(emailData);

    if (error) {
      console.error('Email kuyruğa eklenirken hata:', error);
      throw error;
    }
  }

  // Template değişkenlerini değiştir
  private static replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  // İlgili kullanıcıları bul (yeni ilan için)
  private static async findInterestedUsers(adData: {
    ad_id: string;
    title: string;
    route: string;
    cargo_type: string;
    price: string;
    delivery_date: string;
    publisher_id: string;
  }) {
    // Bu fonksiyon kullanıcıların tercihlerine göre ilgili kullanıcıları bulur
    // Şimdilik basit bir implementasyon - gelecekte ML ile geliştirilebilir
    
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, name, notification_preferences')
        .eq('email_notifications', true)
        .neq('id', adData.publisher_id); // İlan veren kişiye gönderme

      return users?.filter(user => {
        // Basit filtreleme - kullanıcının tercihlerine göre
        return user.notification_preferences?.new_ads !== false;
      }) || [];
    } catch (error) {
      console.error('İlgili kullanıcılar bulunurken hata:', error);
      return [];
    }
  }

  // Haftalık istatistikleri al
  private static async getWeeklyStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Bu implementasyon örnek - gerçek verilerle güncellenecek
    return {
      new_ads_count: '127',
      completed_orders: '89',
      new_users: '34',
      popular_ads_html: `
        <ul>
          <li>İstanbul - Ankara Yük Taşıma</li>
          <li>İzmir - Bursa Nakliye</li>
          <li>Antalya - İstanbul Kargo</li>
        </ul>
      `
    };
  }

  // Gönderilmemiş email'leri işle (cron job için)
  static async processPendingEmails() {
    try {
      const { data: pendingEmails } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('is_sent', false)
        .order('created_at', { ascending: true })
        .limit(50); // Batch processing

      if (!pendingEmails?.length) {
        return;
      }

      for (const email of pendingEmails) {
        try {
          // Gerçek email gönderimi burada yapılacak
          // Şimdilik Supabase Edge Functions kullanabiliriz
          await this.sendEmailViaSupabase(email);
          
          // Email gönderildi olarak işaretle
          await supabase
            .from('email_notifications')
            .update({ 
              is_sent: true, 
              sent_at: new Date().toISOString() 
            })
            .eq('id', email.id);

        } catch (error) {
          console.error(`Email gönderme hatası (${email.id}):`, error);
        }
      }

      console.log(`${pendingEmails.length} email işlendi`);
    } catch (error) {
      console.error('Bekleyen emailler işlenirken hata:', error);
    }
  }

  // Supabase Edge Functions ile email gönder
  private static async sendEmailViaSupabase(emailData: EmailNotification) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          to: emailData.recipient_email,
          subject: emailData.subject,
          html: emailData.content,
          from: 'KargoMarket <noreply@kargomarketing.com>',
          notification_type: emailData.notification_type,
          admin_email: 'emrahbadas@gmail.com' // Admin email adresi
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Supabase email gönderme hatası:', error);
      throw error;
    }
  }
}

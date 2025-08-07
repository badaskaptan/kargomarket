-- Email Notification Triggers for KargoMarket
-- Bu dosyayı create-email-notification-system.sql'den sonra çalıştırın

-- 1. Yeni ilan eklendiğinde email bildirimi gönder (ads tablosu için)
CREATE OR REPLACE FUNCTION notify_new_ad()
RETURNS TRIGGER AS $$
DECLARE
    interested_user RECORD;
BEGIN
    -- İlgili kullanıcıları bul ve email bildirimi oluştur
    FOR interested_user IN 
        SELECT DISTINCT u.id, u.email, 
               COALESCE(u.raw_user_meta_data->>'name', 'Değerli Kullanıcı') as name
        FROM auth.users u
        LEFT JOIN user_notification_preferences unp ON u.id = unp.user_id
        WHERE COALESCE(unp.email_notifications, true) = true 
        AND COALESCE(unp.new_ad_notifications, true) = true
        AND u.id != NEW.created_by -- İlan veren kişiye gönderme
        AND u.email_confirmed_at IS NOT NULL
        LIMIT 100 -- Performance için sınırla
    LOOP
        -- Email bildirimini kuyruğa ekle
        INSERT INTO email_notifications (
            recipient_email,
            recipient_user_id,
            notification_type,
            subject,
            content,
            related_ad_id,
            is_sent
        ) VALUES (
            interested_user.email,
            interested_user.id,
            'new_ad',
            'KargoMarket - Size Uygun Yeni İlan!',
            format('Merhaba %s, kriterlerinize uygun yeni bir ilan yayınlandı: %s', 
                   interested_user.name, 
                   COALESCE(NEW.title, 'Yeni İlan')),
            NEW.id,
            false
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Yeni mesaj eklendiğinde email bildirimi gönder (messages tablosu için)
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    recipient_email TEXT;
    recipient_name TEXT;
    notifications_enabled BOOLEAN;
BEGIN
    -- Gönderen adını al
    SELECT COALESCE(raw_user_meta_data->>'name', 'Bir kullanıcı') 
    INTO sender_name
    FROM auth.users 
    WHERE id = NEW.sender_id;
    
    -- Alıcı bilgilerini al
    SELECT u.email, 
           COALESCE(u.raw_user_meta_data->>'name', 'Değerli Kullanıcı') as name,
           COALESCE(unp.email_notifications, true) AND COALESCE(unp.new_message_notifications, true) as notifications_enabled
    INTO recipient_email, recipient_name, notifications_enabled
    FROM auth.users u
    LEFT JOIN user_notification_preferences unp ON u.id = unp.user_id
    WHERE u.id = NEW.recipient_id;
    
    -- Alıcının email bildirimlerini açık mı kontrol et
    IF notifications_enabled = true AND recipient_email IS NOT NULL THEN
        -- Email bildirimini kuyruğa ekle
        INSERT INTO email_notifications (
            recipient_email,
            recipient_user_id,
            notification_type,
            subject,
            content,
            sender_name,
            sender_id,
            related_message_id,
            is_sent
        ) VALUES (
            recipient_email,
            NEW.recipient_id,
            'new_message',
            'KargoMarket - Yeni Mesajınız Var!',
            format('Merhaba %s, %s size yeni bir mesaj gönderdi: %s', 
                   recipient_name,
                   sender_name,
                   LEFT(COALESCE(NEW.content, 'Mesaj içeriği'), 100) || 
                   CASE WHEN LENGTH(COALESCE(NEW.content, '')) > 100 THEN '...' ELSE '' END),
            sender_name,
            NEW.sender_id,
            NEW.id,
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Yeni teklif eklendiğinde email bildirimi gönder
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS TRIGGER AS $$
DECLARE
    sender_record RECORD;
    recipient_record RECORD;
    ad_record RECORD;
BEGIN
    -- Teklif veren bilgilerini al
    SELECT u.email, p.name INTO sender_record
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE u.id = NEW.bidder_id;
    
    -- İlan sahibi bilgilerini al
    SELECT a.title, a.created_by, u.id, u.email, p.name, unp.email_notifications, unp.new_offer_notifications
    INTO ad_record, recipient_record
    FROM ads a
    JOIN auth.users u ON a.created_by = u.id
    LEFT JOIN profiles p ON u.id = p.id
    LEFT JOIN user_notification_preferences unp ON u.id = unp.user_id
    WHERE a.id = NEW.ad_id;
    
    -- İlan sahibinin email bildirimlerini açık mı kontrol et
    IF recipient_record.email_notifications = true AND recipient_record.new_offer_notifications = true THEN
        -- Email bildirimini kuyruğa ekle
        INSERT INTO email_notifications (
            recipient_email,
            recipient_user_id,
            notification_type,
            subject,
            content,
            sender_name,
            sender_id,
            related_ad_id,
            related_offer_id,
            is_sent
        ) VALUES (
            recipient_record.email,
            recipient_record.id,
            'new_offer',
            'KargoMarket - Yeni Teklif Aldınız!',
            format('Merhaba %s, %s ilanınız "%s" için %s TL teklif verdi.', 
                   COALESCE(recipient_record.name, 'Değerli Kullanıcı'),
                   COALESCE(sender_record.name, 'Bir kullanıcı'),
                   ad_record.title,
                   NEW.offered_price::text),
            COALESCE(sender_record.name, 'Anonim'),
            NEW.bidder_id,
            NEW.ad_id,
            NEW.id,
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Haftalık newsletter gönderimi için fonksiyon
CREATE OR REPLACE FUNCTION send_weekly_newsletter()
RETURNS void AS $$
DECLARE
    subscriber_record RECORD;
    stats_html TEXT;
    weekly_stats RECORD;
BEGIN
    -- Bu haftanın istatistiklerini hesapla
    SELECT 
        COUNT(DISTINCT a.id) as new_ads,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
        COUNT(DISTINCT u.id) as new_users
    INTO weekly_stats
    FROM (
        SELECT CURRENT_DATE - INTERVAL '7 days' as week_start,
               CURRENT_DATE as week_end
    ) date_range
    LEFT JOIN ads a ON a.created_at >= date_range.week_start AND a.created_at < date_range.week_end
    LEFT JOIN orders o ON o.updated_at >= date_range.week_start AND o.updated_at < date_range.week_end
    LEFT JOIN auth.users u ON u.created_at >= date_range.week_start AND u.created_at < date_range.week_end;
    
    -- İstatistik HTML'i oluştur
    stats_html := format('
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3>📊 Bu Hafta</h3>
            <ul>
                <li><strong>%s</strong> yeni ilan yayınlandı</li>
                <li><strong>%s</strong> başarılı teslimat gerçekleşti</li>
                <li><strong>%s</strong> yeni üye katıldı</li>
            </ul>
        </div>',
        COALESCE(weekly_stats.new_ads, 0),
        COALESCE(weekly_stats.completed_orders, 0),
        COALESCE(weekly_stats.new_users, 0)
    );
    
    -- Newsletter abonelerine email gönder
    FOR subscriber_record IN
        SELECT email FROM newsletter_subscriptions 
        WHERE is_active = true AND is_verified = true
    LOOP
        INSERT INTO email_notifications (
            recipient_email,
            notification_type,
            subject,
            content,
            is_sent
        ) VALUES (
            subscriber_record.email,
            'newsletter',
            'KargoMarket - Haftalık Bülten',
            format('
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
                        <h1>📧 KargoMarket</h1>
                        <h2>Haftalık Bülten</h2>
                    </div>
                    <div style="padding: 20px; background: #f9fafb;">
                        <p>Merhaba Değerli Abone,</p>
                        <p>Bu hafta KargoMarket''te neler oldu:</p>
                        %s
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://kargomarketing.com" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Siteyi Ziyaret Et</a>
                        </div>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Bu bildirimi almak istemiyorsanız <a href="https://kargomarketing.com/unsubscribe?email=%s">buradan</a> aboneliğinizi iptal edebilirsiniz.
                        </p>
                    </div>
                </div>',
                stats_html, subscriber_record.email
            ),
            false
        );
    END LOOP;
    
    RAISE NOTICE 'Haftalık newsletter gönderim kuyruğa eklendi';
END;
$$ LANGUAGE plpgsql;

-- 5. Email kuyruğunu işlemek için fonksiyon
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS void AS $$
DECLARE
    email_record RECORD;
    batch_size INTEGER := 50;
BEGIN
    -- Bekleyen email'leri al (batch processing)
    FOR email_record IN
        SELECT * FROM email_notifications 
        WHERE is_sent = false 
        AND failed_attempts < 5
        ORDER BY created_at ASC
        LIMIT batch_size
    LOOP
        BEGIN
            -- Burada gerçek email gönderimi yapılacak
            -- Şimdilik sadece başarılı olarak işaretle
            UPDATE email_notifications 
            SET 
                is_sent = true,
                sent_at = NOW(),
                updated_at = NOW()
            WHERE id = email_record.id;
            
            RAISE NOTICE 'Email gönderildi: % -> %', email_record.id, email_record.recipient_email;
            
        EXCEPTION WHEN OTHERS THEN
            -- Hata durumunda failed_attempts'i artır
            UPDATE email_notifications 
            SET 
                failed_attempts = failed_attempts + 1,
                last_error = SQLERRM,
                updated_at = NOW()
            WHERE id = email_record.id;
            
            RAISE NOTICE 'Email gönderme hatası: % - %', email_record.id, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger'ları tablelara bağla (tablolar oluşturulduktan sonra)

-- İlanlar için trigger (ads tablosu oluşturulduktan sonra aktif edilecek)
-- CREATE TRIGGER ads_email_notification_trigger
--     AFTER INSERT ON ads
--     FOR EACH ROW
--     EXECUTE FUNCTION notify_new_ad();

-- Mesajlar için trigger (messages tablosu oluşturulduktan sonra aktif edilecek)
-- CREATE TRIGGER messages_email_notification_trigger
--     AFTER INSERT ON messages
--     FOR EACH ROW
--     EXECUTE FUNCTION notify_new_message();

-- Teklifler için trigger (offers tablosu oluşturulduktan sonra aktif edilecek)
-- CREATE TRIGGER offers_email_notification_trigger
--     AFTER INSERT ON offers
--     FOR EACH ROW
--     EXECUTE FUNCTION notify_new_offer();

-- 7. Scheduled jobs (pg_cron extension gerekli)

-- Haftalık newsletter (Her Pazar sabah 9:00)
-- SELECT cron.schedule('weekly-newsletter', '0 9 * * 0', 'SELECT send_weekly_newsletter();');

-- Email kuyruğunu her 5 dakikada bir işle
-- SELECT cron.schedule('process-email-queue', '*/5 * * * *', 'SELECT process_email_queue();');

-- Eski email'leri temizle (Her gün gece 2:00)
-- SELECT cron.schedule('cleanup-old-emails', '0 2 * * *', 'SELECT cleanup_old_email_notifications();');

-- Tamamlandı!
-- Bu script'i çalıştırdıktan sonra:
-- 1. İlgili tablolar oluşturulunca trigger'ları aktif edin
-- 2. pg_cron extension'ı kurup scheduled job'ları etkinleştirin
-- 3. Gerçek email service provider entegrasyonu yapın

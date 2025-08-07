-- Email Notifications System for KargoMarket
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Email bildirimleri tablosunu oluştur
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('new_ad', 'new_message', 'new_offer', 'newsletter', 'system')),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sender_name VARCHAR(255),
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    related_ad_id UUID, -- ads tablosuna referans (ads tablosu oluşturulduktan sonra foreign key eklenebilir)
    related_message_id UUID, -- messages tablosuna referans
    related_offer_id UUID, -- offers tablosuna referans
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index'leri oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient_email ON email_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient_user_id ON email_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_is_sent ON email_notifications(is_sent);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_pending ON email_notifications(is_sent, created_at) WHERE is_sent = FALSE;

-- 3. Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_email_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_notifications_updated_at_trigger
    BEFORE UPDATE ON email_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_email_notifications_updated_at();

-- 4. RLS (Row Level Security) politikalarını etkinleştir
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Politikaları

-- Admin kullanıcılar tüm email bildirimlerini görebilir
CREATE POLICY "Admin can view all email notifications" ON email_notifications
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Kullanıcılar sadece kendi email bildirimlerini görebilir
CREATE POLICY "Users can view own email notifications" ON email_notifications
    FOR SELECT 
    USING (
        recipient_user_id = auth.uid() OR
        recipient_email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    );

-- Sistem (authenticated users) email bildirimi oluşturabilir
CREATE POLICY "System can create email notifications" ON email_notifications
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Admin kullanıcılar email bildirimlerini güncelleyebilir
CREATE POLICY "Admin can update email notifications" ON email_notifications
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Admin kullanıcılar email bildirimlerini silebilir
CREATE POLICY "Admin can delete email notifications" ON email_notifications
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- 6. User notification preferences tablosu
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    new_ad_notifications BOOLEAN DEFAULT TRUE,
    new_message_notifications BOOLEAN DEFAULT TRUE,
    new_offer_notifications BOOLEAN DEFAULT TRUE,
    newsletter_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    notification_frequency VARCHAR(20) DEFAULT 'instant' CHECK (notification_frequency IN ('instant', 'daily', 'weekly', 'never')),
    preferred_notification_time TIME DEFAULT '09:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences index'leri
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_email_enabled ON user_notification_preferences(email_notifications);

-- User preferences updated_at trigger
CREATE TRIGGER user_notification_preferences_updated_at_trigger
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_email_notifications_updated_at();

-- User preferences RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences" ON user_notification_preferences
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all notification preferences" ON user_notification_preferences
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- 7. Email istatistikleri için view'lar oluştur
CREATE OR REPLACE VIEW email_notification_stats AS
SELECT 
    notification_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_sent = true) as sent_count,
    COUNT(*) FILTER (WHERE is_sent = false) as pending_count,
    COUNT(*) FILTER (WHERE failed_attempts > 0) as failed_count,
    ROUND(
        (COUNT(*) FILTER (WHERE is_sent = true)::decimal / COUNT(*)) * 100, 2
    ) as success_rate,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) as week_count,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as month_count
FROM email_notifications
GROUP BY notification_type;

-- 8. Günlük email raporu view'ı
CREATE OR REPLACE VIEW daily_email_report AS
SELECT 
    DATE(created_at) as date,
    notification_type,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE is_sent = true) as successful_sends,
    COUNT(*) FILTER (WHERE failed_attempts > 0) as failed_sends,
    AVG(EXTRACT(EPOCH FROM (sent_at - created_at))/60) as avg_delivery_time_minutes
FROM email_notifications
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), notification_type
ORDER BY date DESC, notification_type;

-- 9. Kullanıcı bildirim özeti view'ı
CREATE OR REPLACE VIEW user_notification_summary AS
SELECT 
    u.id as user_id,
    u.email,
    p.email_notifications,
    p.notification_frequency,
    COUNT(en.*) as total_notifications_received,
    COUNT(en.*) FILTER (WHERE en.created_at >= CURRENT_DATE - INTERVAL '7 days') as notifications_last_week,
    COUNT(en.*) FILTER (WHERE en.created_at >= CURRENT_DATE - INTERVAL '30 days') as notifications_last_month,
    MAX(en.created_at) as last_notification_at
FROM auth.users u
LEFT JOIN user_notification_preferences p ON u.id = p.user_id
LEFT JOIN email_notifications en ON u.id = en.recipient_user_id
GROUP BY u.id, u.email, p.email_notifications, p.notification_frequency;

-- 10. Auto-cleanup function (eski bildirimleri temizle)
CREATE OR REPLACE FUNCTION cleanup_old_email_notifications()
RETURNS void AS $$
BEGIN
    -- 6 aydan eski başarıyla gönderilmiş bildirimleri sil
    DELETE FROM email_notifications 
    WHERE is_sent = true 
    AND sent_at < NOW() - INTERVAL '6 months';
    
    -- 1 aydan eski başarısız bildirimleri sil
    DELETE FROM email_notifications 
    WHERE is_sent = false 
    AND failed_attempts >= 5 
    AND created_at < NOW() - INTERVAL '1 month';
    
    RAISE NOTICE 'Eski email bildirimleri temizlendi';
END;
$$ LANGUAGE plpgsql;

-- 11. Haftalık cleanup için scheduled job (pg_cron extension gerekli)
-- SELECT cron.schedule('cleanup-old-emails', '0 2 * * 0', 'SELECT cleanup_old_email_notifications();');

-- 12. Email template'leri için tablo
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_type VARCHAR(50) NOT NULL UNIQUE,
    subject_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    variables JSONB, -- Template'de kullanılabilecek değişkenlerin listesi
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Email templates index'leri
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Email templates RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage email templates" ON email_templates
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Everyone can read active email templates" ON email_templates
    FOR SELECT 
    USING (is_active = true);

-- 13. Default email template'lerini ekle
INSERT INTO email_templates (template_type, subject_template, content_template, variables) VALUES
('new_ad', 'KargoMarket - Size Uygun Yeni İlan!', 
 'Merhaba {{recipient_name}}, kriterlerinize uygun yeni bir ilan yayınlandı: {{ad_title}}', 
 '["recipient_name", "ad_title", "route", "cargo_type", "price", "delivery_date", "ad_link"]'),

('new_message', 'KargoMarket - Yeni Mesajınız Var!', 
 'Merhaba {{recipient_name}}, {{sender_name}} size yeni bir mesaj gönderdi.', 
 '["recipient_name", "sender_name", "message_subject", "message_preview", "message_link"]'),

('new_offer', 'KargoMarket - Yeni Teklif Aldınız!', 
 'Merhaba {{recipient_name}}, {{sender_name}} ilanınız için {{offer_price}} TL teklif verdi.', 
 '["recipient_name", "sender_name", "ad_title", "offer_price", "offer_message", "offer_link"]'),

('newsletter', 'KargoMarket - Haftalık Bülten', 
 'Merhaba {{recipient_name}}, bu hafta KargoMarket''te neler oldu...', 
 '["recipient_name", "new_ads_count", "completed_orders", "new_users", "popular_ads"]')

ON CONFLICT (template_type) DO UPDATE SET
    subject_template = EXCLUDED.subject_template,
    content_template = EXCLUDED.content_template,
    variables = EXCLUDED.variables,
    updated_at = NOW();

-- Tamamlandı! 
-- Bu script çalıştırıldıktan sonra otomatik email bildirim sistemi hazır olacak.
-- 
-- Önemli Notlar:
-- 1. Supabase Edge Functions ile gerçek email gönderimi kurulmalı
-- 2. Cron job'lar için pg_cron extension'ı gerekebilir
-- 3. Email service provider (SendGrid, AWS SES, etc.) entegrasyonu yapılmalı
-- 4. Rate limiting ve email reputation yönetimi eklenmeli
-- 5. GDPR/KVKK uyumluluğu için unsubscribe mekanizmaları geliştirilmeli

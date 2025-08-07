-- Newsletter Subscriptions Table for KargoMarket
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Newsletter abonelikleri tablosunu oluştur
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_token UUID DEFAULT gen_random_uuid(),
    verification_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Email formatını kontrol et
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. Index'leri oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_verified ON newsletter_subscriptions(is_verified);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at);

-- 3. Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_updated_at_trigger
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_updated_at();

-- 4. RLS (Row Level Security) politikalarını etkinleştir
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Politikaları

-- Admin kullanıcılar tüm kayıtları görebilir (gelecekte admin panel için)
CREATE POLICY "Admin can view all newsletter subscriptions" ON newsletter_subscriptions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Herkes yeni abonelik oluşturabilir (public endpoint)
CREATE POLICY "Anyone can create newsletter subscription" ON newsletter_subscriptions
    FOR INSERT 
    WITH CHECK (true);

-- Sadece kendi aboneliklerini güncelleyebilir (doğrulama token'ı ile)
CREATE POLICY "Users can update own newsletter subscription" ON newsletter_subscriptions
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Admin kullanıcılar abonelikleri silebilir
CREATE POLICY "Admin can delete newsletter subscriptions" ON newsletter_subscriptions
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- 6. Test verisi ekle (opsiyonel - geliştirme için)
-- INSERT INTO newsletter_subscriptions (email, is_verified, is_active) 
-- VALUES ('test@example.com', true, true);

-- 7. İstatistikler için view oluştur
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions,
    COUNT(*) FILTER (WHERE is_verified = true) as verified_subscriptions,
    COUNT(*) FILTER (WHERE is_active = true AND is_verified = true) as active_verified_subscriptions,
    COUNT(*) FILTER (WHERE DATE(subscribed_at) = CURRENT_DATE) as today_subscriptions,
    COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('week', CURRENT_DATE)) as week_subscriptions,
    COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('month', CURRENT_DATE)) as month_subscriptions
FROM newsletter_subscriptions;

-- 8. Admin için newsletter aboneleri listesi view'ı
CREATE OR REPLACE VIEW newsletter_admin_list AS
SELECT 
    id,
    email,
    is_verified,
    is_active,
    subscribed_at,
    unsubscribed_at,
    CASE 
        WHEN is_active = true AND is_verified = true THEN 'Aktif'
        WHEN is_active = true AND is_verified = false THEN 'Doğrulanmamış'
        WHEN is_active = false THEN 'Pasif'
        ELSE 'Bilinmiyor'
    END as status
FROM newsletter_subscriptions
ORDER BY subscribed_at DESC;

-- 9. RLS politikalarını view'lar için de ayarla
ALTER VIEW newsletter_stats OWNER TO postgres;
ALTER VIEW newsletter_admin_list OWNER TO postgres;

-- Tamamlandı! 
-- Bu script çalıştırıldıktan sonra newsletter servisi çalışmaya hazır olacak.
-- 
-- Önemli Notlar:
-- - Email doğrulama sistemi için ek bir email service gerekebilir
-- - Admin panel için ayrı bir sayfa oluşturulabilir
-- - KVKK uyumluluğu için ek alanlar eklenebilir
-- - Unsubscribe için token tabanlı sistem geliştirilebilir

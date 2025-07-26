-- Billing System için gerekli tablolar ve mevcut ads tablosu güncellemeleri
-- Bu script'i Supabase SQL Editor'de çalıştırın

-- ============================================================================
-- PART 1: USER_BALANCES VE BILLING_TRANSACTIONS TABLOLARI
-- ============================================================================

-- 1. user_balances tablosu
CREATE TABLE IF NOT EXISTS user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (current_balance >= 0),
    total_spent DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (total_spent >= 0),
    currency VARCHAR(3) DEFAULT 'TRY' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Her kullanıcı için tek bakiye kaydı
    UNIQUE(user_id)
);

-- 2. billing_transactions tablosu
CREATE TABLE IF NOT EXISTS billing_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    reference_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PART 2: MEVCUT ADS TABLOSU GÜNCELLEMELERİ
-- ============================================================================

-- 3. ads tablosuna eksik alanları ekle
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS daily_budget NUMERIC DEFAULT 0;

ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS total_cost NUMERIC DEFAULT 0;

ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active';

-- 4. Constraints güncellemeleri
ALTER TABLE public.ads 
DROP CONSTRAINT IF EXISTS ads_ad_type_check;

ALTER TABLE public.ads 
ADD CONSTRAINT ads_ad_type_check 
CHECK (ad_type = ANY (ARRAY['banner'::text, 'video'::text, 'text'::text]));

ALTER TABLE public.ads 
DROP CONSTRAINT IF EXISTS ads_billing_status_check;

ALTER TABLE public.ads 
ADD CONSTRAINT ads_billing_status_check 
CHECK (billing_status = ANY (ARRAY['active'::text, 'paused'::text, 'insufficient_funds'::text]));

-- ============================================================================
-- PART 3: AD_CLICKS TABLOSUNU DÜZELT
-- ============================================================================

-- 5. Doğru ad_clicks tablosunu oluştur (eğer yanlış varsa önce manuel silin)
CREATE TABLE IF NOT EXISTS public.ad_clicks (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    ad_id BIGINT NOT NULL,
    user_id UUID NULL,
    ip_address TEXT NULL,
    user_agent TEXT NULL,
    page_url TEXT NULL,
    referrer_url TEXT NULL,
    click_position JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT ad_clicks_pkey PRIMARY KEY (id),
    CONSTRAINT ad_clicks_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES ads (id) ON DELETE CASCADE,
    CONSTRAINT ad_clicks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL
);

-- ============================================================================
-- PART 4: FONKSİYONLAR
-- ============================================================================

-- 6. Bakiye güncellemesi için fonksiyon
CREATE OR REPLACE FUNCTION update_user_balance(
    p_user_id UUID,
    p_amount DECIMAL,
    p_operation VARCHAR
)
RETURNS VOID AS $$
BEGIN
    IF p_operation = 'add' THEN
        UPDATE user_balances 
        SET 
            current_balance = current_balance + p_amount,
            last_updated = NOW()
        WHERE user_id = p_user_id;
    ELSIF p_operation = 'subtract' THEN
        UPDATE user_balances 
        SET 
            current_balance = current_balance - p_amount,
            total_spent = total_spent + p_amount,
            last_updated = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Reklam metriklerini güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_ad_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Impression eklendiğinde
    IF TG_TABLE_NAME = 'ad_impressions' THEN
        UPDATE ads 
        SET 
            impressions = (SELECT COUNT(*) FROM ad_impressions WHERE ad_id = NEW.ad_id),
            updated_at = NOW()
        WHERE id = NEW.ad_id;
    END IF;
    
    -- Click eklendiğinde
    IF TG_TABLE_NAME = 'ad_clicks' THEN
        UPDATE ads 
        SET 
            clicks = (SELECT COUNT(*) FROM ad_clicks WHERE ad_id = NEW.ad_id),
            updated_at = NOW()
        WHERE id = NEW.ad_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 5: TRİGGER'LAR
-- ============================================================================

-- 9. Mevcut trigger'ları güncelle
DROP TRIGGER IF EXISTS update_ad_impressions ON ad_impressions;
DROP TRIGGER IF EXISTS update_ad_clicks ON ad_clicks;

-- Yeni metrik trigger'ları
CREATE TRIGGER update_ad_impressions
    AFTER INSERT ON ad_impressions 
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_metrics();

CREATE TRIGGER update_ad_clicks
    AFTER INSERT ON ad_clicks 
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_metrics();

-- user_balances için updated_at trigger'ı
CREATE TRIGGER update_user_balances_last_updated
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- ============================================================================
-- PART 6: RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- ============================================================================

-- 10. RLS'i etkinleştir
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- 11. user_balances için RLS politikaları
CREATE POLICY "Users can view their own balance" ON user_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance" ON user_balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" ON user_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- 12. billing_transactions için RLS politikaları
CREATE POLICY "Users can view their own transactions" ON billing_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON billing_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. ad_clicks için RLS politikaları
CREATE POLICY "Users can view clicks on their ads" ON ad_clicks
    FOR SELECT USING (
        ad_id IN (SELECT id FROM ads WHERE user_id = auth.uid())
    );

CREATE POLICY "Anyone can insert ad clicks" ON ad_clicks
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PART 7: İNDEKSLER (PERFORMANS İÇİN)
-- ============================================================================

-- 14. Billing tabloları için indeksler
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_id ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_created_at ON billing_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_type ON billing_transactions(type);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_reference_id ON billing_transactions(reference_id);

-- 15. ads tablosu için ek indeksler
CREATE INDEX IF NOT EXISTS idx_ads_ad_type ON public.ads USING btree (ad_type);
CREATE INDEX IF NOT EXISTS idx_ads_billing_status ON public.ads USING btree (billing_status);
CREATE INDEX IF NOT EXISTS idx_ads_budget ON public.ads USING btree (budget);
CREATE INDEX IF NOT EXISTS idx_ads_daily_budget ON public.ads USING btree (daily_budget);
CREATE INDEX IF NOT EXISTS idx_ads_total_cost ON public.ads USING btree (total_cost);

-- 16. ad_clicks tablosu için indeksler
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON public.ad_clicks USING btree (ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON public.ad_clicks USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_created_at ON public.ad_clicks USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ip_address ON public.ad_clicks USING btree (ip_address);

-- ============================================================================
-- PART 8: YORUMLAR VE DOKÜMANTASYON
-- ============================================================================

-- 17. Tablo açıklamaları
COMMENT ON TABLE user_balances IS 'Kullanıcı bakiye bilgileri - her kullanıcı için tek kayıt';
COMMENT ON TABLE billing_transactions IS 'Tüm bakiye işlemlerinin geçmişi - para yükleme, reklam ödemeleri vb.';
COMMENT ON TABLE ad_clicks IS 'Reklam tıklama kayıtları - analytics ve billing için kullanılır';
COMMENT ON FUNCTION update_user_balance IS 'Kullanıcı bakiyesini güvenli şekilde günceller';
COMMENT ON FUNCTION update_ad_metrics IS 'Reklam metriklerini (impressions/clicks) otomatik günceller';

-- ============================================================================
-- KURULUM TAMAMLANDI!
-- ============================================================================

-- Kontrol sorguları:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%ad%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%billing%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%balance%';

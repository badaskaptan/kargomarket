-- ad_clicks tablosunu düzelt (şu anda ad_impressions olarak duplicate)
-- Önce doğru ad_clicks tablosunu oluştur

-- 1. Eğer yanlış ad_clicks tablosu varsa sil (dikkatli!)
-- DROP TABLE IF EXISTS public.ad_clicks CASCADE;

-- 2. Doğru ad_clicks tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.ad_clicks (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    ad_id BIGINT NOT NULL,
    user_id UUID NULL,
    ip_address TEXT NULL,
    user_agent TEXT NULL,
    page_url TEXT NULL,
    referrer_url TEXT NULL,
    click_position JSONB NULL, -- x,y koordinatları
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT ad_clicks_pkey PRIMARY KEY (id),
    CONSTRAINT ad_clicks_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES ads (id) ON DELETE CASCADE,
    CONSTRAINT ad_clicks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON public.ad_clicks USING btree (ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON public.ad_clicks USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_created_at ON public.ad_clicks USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ip_address ON public.ad_clicks USING btree (ip_address);

-- 4. Trigger - ad metriklerini güncelle
CREATE TRIGGER update_ad_clicks
    AFTER INSERT ON ad_clicks 
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_metrics();

-- 5. RLS (Row Level Security) ekle
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
CREATE POLICY "Users can view clicks on their ads" ON ad_clicks
    FOR SELECT USING (
        ad_id IN (SELECT id FROM ads WHERE user_id = auth.uid())
    );

CREATE POLICY "Anyone can insert ad clicks" ON ad_clicks
    FOR INSERT WITH CHECK (true); -- Herkes tıklama kaydedebilir

-- 6. Yorum ekle
COMMENT ON TABLE ad_clicks IS 'Reklam tıklama kayıtları - analytics ve billing için kullanılır';

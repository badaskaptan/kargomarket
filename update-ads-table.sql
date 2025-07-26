-- ADS tablosu uyumluluk güncellemeleri
-- Mevcut ads tablonuza eksik alanları ekler

-- 1. ad_type enum kontrolü ve güncelleme
ALTER TABLE public.ads 
DROP CONSTRAINT IF EXISTS ads_ad_type_check;

ALTER TABLE public.ads 
ADD CONSTRAINT ads_ad_type_check 
CHECK (ad_type = ANY (ARRAY['banner'::text, 'video'::text, 'text'::text]));

-- 2. Eksik placement değerleri ekleme
ALTER TABLE public.ads 
DROP CONSTRAINT IF EXISTS ads_placement_check;

ALTER TABLE public.ads 
ADD CONSTRAINT ads_placement_check 
CHECK (placement = ANY (ARRAY[
    'homepage'::text, 
    'search'::text, 
    'listing_detail'::text, 
    'sidebar'::text, 
    'banner'::text,
    'footer'::text,
    'mobile_banner'::text
]));

-- 3. Yeni status değerleri ekleme
ALTER TABLE public.ads 
DROP CONSTRAINT IF EXISTS ads_status_check;

ALTER TABLE public.ads 
ADD CONSTRAINT ads_status_check 
CHECK (status = ANY (ARRAY[
    'pending'::text, 
    'active'::text, 
    'paused'::text, 
    'rejected'::text, 
    'completed'::text,
    'draft'::text,
    'expired'::text
]));

-- 4. Billing için gerekli alanları ekleme (eğer yoksa)
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS daily_budget NUMERIC DEFAULT 0;

ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS total_cost NUMERIC DEFAULT 0;

ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active' 
CHECK (billing_status = ANY (ARRAY['active'::text, 'paused'::text, 'insufficient_funds'::text]));

-- 5. İndeks eklemeleri
CREATE INDEX IF NOT EXISTS idx_ads_ad_type ON public.ads USING btree (ad_type);
CREATE INDEX IF NOT EXISTS idx_ads_billing_status ON public.ads USING btree (billing_status);
CREATE INDEX IF NOT EXISTS idx_ads_budget ON public.ads USING btree (budget);
CREATE INDEX IF NOT EXISTS idx_ads_total_cost ON public.ads USING btree (total_cost);

-- 6. Güncelleme trigger'ı (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

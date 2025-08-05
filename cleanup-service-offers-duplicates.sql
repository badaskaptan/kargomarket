-- 🚨 ACİL: Service Offers tablosundaki duplicate column'ları temizle
-- Bu script inconsistent data sorununu çözecek ve modal tutarsızlıklarını düzeltecek

-- 1. ÖNCE MEVCUT VERİLERİ KORUMA - Önemli verileri migrate et
-- AMAÇ: EditServiceOfferModal ve EnhancedServiceOfferModal arasındaki field tutarsızlığını çöz
-- service_description verilerini message'a taşı (eğer message boşsa)
-- Önce column'un var olup olmadığını kontrol et
DO $
$
BEGIN
    IF EXISTS (SELECT 1
    FROM information_schema.columns
    WHERE table_name='service_offers' AND column_name='service_description') THEN
    UPDATE public.service_offers 
        SET message = COALESCE(message, service_description)
        WHERE service_description IS NOT NULL
        AND (message IS NULL OR trim(message) = '');
END
IF;
END $$;

-- proposed_dates JSON verilerini ayrı date field'larına migrate et
-- Önce column'un var olup olmadığını kontrol et
DO $$
BEGIN
    IF EXISTS (SELECT 1
    FROM information_schema.columns
    WHERE table_name='service_offers' AND column_name='proposed_dates') THEN
    UPDATE public.service_offers 
        SET pickup_date_preferred = COALESCE(
          pickup_date_preferred, 
          CASE 
            WHEN proposed_dates->>'pickup_date' IS NOT NULL 
            THEN (proposed_dates->>'pickup_date')::timestamp
    with time zone 
            ELSE NULL
END
),
        delivery_date_preferred = COALESCE
(
          delivery_date_preferred,
          CASE 
            WHEN proposed_dates->>'delivery_date' IS NOT NULL 
            THEN
(proposed_dates->>'delivery_date')::timestamp
with time zone 
            ELSE NULL
END
        )
        WHERE proposed_dates IS NOT NULL 
          AND proposed_dates != '{}'::jsonb;
END
IF;
END $$;

-- validity_period verilerini expires_at'a migrate et
UPDATE public.service_offers 
SET expires_at = COALESCE(
  expires_at,
  CASE 
    WHEN validity_period IS NOT NULL 
    THEN created_at + (validity_period || ' days')::interval
    ELSE NULL 
  END
)
WHERE validity_period IS NOT NULL
    AND expires_at IS NULL;

-- 2. DUPLICATE / UNUSED COLUMN'LARI SİL
-- Artık kullanılmayan eski field'ları drop et
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS service_description;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS validity_period;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS proposed_dates;

-- additional_services ve additional_terms da kullanılmıyor - temizle
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS additional_services;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS additional_terms;

-- price_breakdown da kullanılmıyor
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS price_breakdown;

-- attachments şimdilik kullanılmıyor
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS attachments;

-- valid_until vs expires_at duplicate - valid_until'i sil
UPDATE public.service_offers 
SET expires_at = COALESCE(expires_at, valid_until)
WHERE valid_until IS NOT NULL AND expires_at IS NULL;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS valid_until;

-- rejection_reason ve responded_at şimdilik kullanılmıyor
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS rejection_reason;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS responded_at;

-- 🎯 MODAL TUTARSIZLIK ÇÖZÜMÜ: Eski capacity/insurance field'larını sil
-- EditServiceOfferModal vs EnhancedServiceOfferModal field conflict'ini çöz
-- Artık cargo_weight, cargo_weight_unit, cargo_volume, cargo_volume_unit kullanıyoruz

-- Önce eski verileri yeni formata migrate et (eğer varsa)
UPDATE public.service_offers 
SET cargo_weight = COALESCE(cargo_weight, weight_capacity_kg),
    cargo_weight_unit = COALESCE(cargo_weight_unit, 'kg')
WHERE weight_capacity_kg IS NOT NULL
    AND cargo_weight IS NULL;

UPDATE public.service_offers 
SET cargo_volume = COALESCE(cargo_volume, volume_capacity_m3),
    cargo_volume_unit = COALESCE(cargo_volume_unit, 'm3')
WHERE volume_capacity_m3 IS NOT NULL
    AND cargo_volume IS NULL;

-- insurance_coverage_amount → insurance_policy_number (if needed)
-- Bu field için mapping yapılabilir ama şimdilik skip ediyoruz

-- Şimdi eski field'ları sil
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS weight_capacity_kg;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS volume_capacity_m3;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS insurance_coverage_amount;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS insurance_provider;

-- 3. GEREKSIZ INDEX'LERI TEMİZLE
-- Drop edilecek column'ların index'lerini temizle
DROP INDEX IF EXISTS idx_service_offers_additional_terms_gin;
DROP INDEX IF EXISTS idx_service_offers_additional_services_gin;
DROP INDEX IF EXISTS idx_service_offers_valid_until;

-- 4. VERİ TUTARLILIK KONTROLÜ
-- Temizlik sonrası veri kontrolü
SELECT
    COUNT(*) as total_offers,
    COUNT(CASE WHEN message IS NOT NULL THEN 1 END) as offers_with_message,
    COUNT(CASE WHEN pickup_date_preferred IS NOT NULL THEN 1 END) as offers_with_pickup_date,
    COUNT(CASE WHEN delivery_date_preferred IS NOT NULL THEN 1 END) as offers_with_delivery_date,
    COUNT(CASE WHEN expires_at IS NOT NULL THEN 1 END) as offers_with_expiry
FROM public.service_offers;

-- 5. COMMENT'LERI GÜNCELLE
COMMENT ON TABLE public.service_offers IS 'Temizlenmiş service offers tablosu - duplicate column'lar kaldırıldı';
COMMENT ON COLUMN public.service_offers.message IS 'Ana teklif mesajı
(eski service_description verilerini içerir)';
COMMENT ON COLUMN public.service_offers.expires_at IS 'Teklifin geçerlilik süresi
(eski validity_period ve valid_until birleştirildi)';
COMMENT ON COLUMN public.service_offers.pickup_date_preferred IS 'Tercih edilen alım tarihi
(eski proposed_dates migration)';
COMMENT ON COLUMN public.service_offers.delivery_date_preferred IS 'Tercih edilen teslimat tarihi
(eski proposed_dates migration)';

-- 6. FINAL VERIFICATION
-- Tablonun son halini kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

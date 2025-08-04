-- 🎯 MODAL CONFLICT FIX
-- EditServiceOfferModal vs EnhancedServiceOfferModal field tutarsızlığını çöz
-- Supabase SQL Editor'da çalıştır

-- 1. ÖNCE ESKİ VERİLERİ YENİ FORMATA MİGRATE ET
-- weight_capacity_kg → cargo_weight (kg)
UPDATE public.service_offers 
SET cargo_weight = COALESCE(cargo_weight, weight_capacity_kg),
    cargo_weight_unit = COALESCE(cargo_weight_unit, 'kg')
WHERE weight_capacity_kg IS NOT NULL 
  AND cargo_weight IS NULL;

-- volume_capacity_m3 → cargo_volume (m3)
UPDATE public.service_offers 
SET cargo_volume = COALESCE(cargo_volume, volume_capacity_m3),
    cargo_volume_unit = COALESCE(cargo_volume_unit, 'm3')
WHERE volume_capacity_m3 IS NOT NULL 
  AND cargo_volume IS NULL;

-- 2. ESKİ CONFLICT FIELD'LARINI SİL
ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS weight_capacity_kg;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS volume_capacity_m3;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS insurance_coverage_amount;

ALTER TABLE public.service_offers 
DROP COLUMN IF EXISTS insurance_provider;

-- 3. VERİ KONTROLÜ
SELECT 
  COUNT(*) as total_offers,
  COUNT(CASE WHEN cargo_weight IS NOT NULL THEN 1 END) as offers_with_cargo_weight,
  COUNT(CASE WHEN cargo_volume IS NOT NULL THEN 1 END) as offers_with_cargo_volume,
  COUNT(CASE WHEN insurance_company IS NOT NULL THEN 1 END) as offers_with_insurance_company,
  COUNT(CASE WHEN insurance_policy_number IS NOT NULL THEN 1 END) as offers_with_insurance_policy
FROM public.service_offers;

-- 4. FINAL COLUMN CHECK
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND table_schema = 'public'
  AND column_name IN ('cargo_weight', 'cargo_weight_unit', 'cargo_volume', 'cargo_volume_unit', 'insurance_company', 'insurance_policy_number')
ORDER BY column_name;

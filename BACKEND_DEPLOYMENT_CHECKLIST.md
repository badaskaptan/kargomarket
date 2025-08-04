-- 📋 BACKEND DEPLOYMENT CHECKLIST
-- Bu adımları sırayla takip et

-- ========================================
-- 1. ADIM: Critical Fields Migration
-- ========================================
-- Dosya: fix-service-offers-critical-fields.sql
-- Bu script şu alanları ekler:
-- ✅ pickup_location, delivery_location (coğrafi bilgiler)
-- ✅ service_reference_title, offered_vehicle_type
-- ✅ company_name, company_website, company_tax_number
-- ✅ insurance_company, insurance_policy_number  
-- ✅ cargo_weight, cargo_weight_unit, cargo_volume, cargo_volume_unit
-- ✅ matches_service_route, capacity_meets_requirement
-- ✅ Performance indexes
-- ✅ RLS policies
-- ✅ Data validation constraints

-- ÇALIŞTIR:
\i fix-service-offers-critical-fields.sql

-- ========================================
-- 2. ADIM: Duplicate Cleanup Migration  
-- ========================================
-- Dosya: cleanup-service-offers-duplicates.sql
-- Bu script şu temizlikleri yapar:
-- ✅ service_description → message (data migration)
-- ✅ proposed_dates → pickup_date_preferred/delivery_date_preferred
-- ✅ validity_period + valid_until → expires_at
-- ✅ MODAL TUTARSIZLIK ÇÖZÜMÜ: weight_capacity_kg, volume_capacity_m3, insurance_coverage_amount, insurance_provider → DELETED
-- ✅ EditServiceOfferModal artık cargo_weight, cargo_weight_unit, cargo_volume, cargo_volume_unit kullanıyor
-- ✅ Unused column'ları siler (additional_services, price_breakdown, attachments vs)
-- ✅ Gereksiz index'leri temizler

-- ÇALIŞTIR:
\i cleanup-service-offers-duplicates.sql

-- ========================================
-- 3. ADIM: Verification
-- ========================================
-- Migration sonrası kontrol et:

-- 3.1. Column'ları kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3.2. Index'leri kontrol et
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'service_offers' 
  AND schemaname = 'public'
ORDER BY indexname;

-- 3.3. RLS policies kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'service_offers';

-- 3.4. Data integrity kontrol et
SELECT 
  COUNT(*) as total_offers,
  COUNT(CASE WHEN message IS NOT NULL THEN 1 END) as offers_with_message,
  COUNT(CASE WHEN pickup_location IS NOT NULL THEN 1 END) as offers_with_pickup,
  COUNT(CASE WHEN delivery_location IS NOT NULL THEN 1 END) as offers_with_delivery,
  COUNT(CASE WHEN company_name IS NOT NULL THEN 1 END) as offers_with_company,
  COUNT(CASE WHEN cargo_weight IS NOT NULL THEN 1 END) as offers_with_weight
FROM public.service_offers;

-- ========================================
-- 4. ADIM: Performance Test
-- ========================================
-- Index'lerin çalışıp çalışmadığını test et:

EXPLAIN ANALYZE 
SELECT * FROM public.service_offers 
WHERE pickup_location ILIKE '%istanbul%';

EXPLAIN ANALYZE 
SELECT * FROM public.service_offers 
WHERE company_name IS NOT NULL;

-- ========================================
-- 5. ADIM: Backup Recommendation  
-- ========================================
-- Migration öncesi backup al:
-- pg_dump -h your-host -U your-user -d your-db -t service_offers > service_offers_backup.sql

-- ========================================
-- 6. ADIM: Production Deployment
-- ========================================
-- 1. Staging'de test et
-- 2. Production'da backup al
-- 3. Migration script'lerini çalıştır
-- 4. Frontend'i deploy et
-- 5. Functionality test et

-- ========================================
-- TROUBLESHOOTING
-- ========================================
-- Eğer constraint hatası alırsan:
-- ALTER TABLE public.service_offers DROP CONSTRAINT pickup_location_not_empty;
-- ALTER TABLE public.service_offers DROP CONSTRAINT delivery_location_not_empty;

-- Eğer RLS hatası alırsan:
-- DROP POLICY IF EXISTS "service_offers_select_policy" ON public.service_offers;

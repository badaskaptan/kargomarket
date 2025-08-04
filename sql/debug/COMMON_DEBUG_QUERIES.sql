-- 🔧 COMMON DEBUG QUERIES
-- KargoMarket v3 için sık kullanılan debug sorguları
-- Tarih: 5 Ağustos 2025

-- ========================================
-- SERVICE OFFERS DEBUG
-- ========================================

-- 1. Service offers genel durumu
SELECT 
  COUNT(*) as total_offers,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_offers,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_offers,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_offers,
  COUNT(CASE WHEN pickup_location IS NOT NULL THEN 1 END) as offers_with_pickup,
  COUNT(CASE WHEN delivery_location IS NOT NULL THEN 1 END) as offers_with_delivery,
  COUNT(CASE WHEN company_name IS NOT NULL THEN 1 END) as offers_with_company,
  COUNT(CASE WHEN cargo_weight IS NOT NULL THEN 1 END) as offers_with_weight
FROM public.service_offers;

-- 2. Boş field'ları tespit et
SELECT 
  id,
  user_id,
  created_at,
  CASE WHEN pickup_location IS NULL THEN 'MISSING' ELSE 'OK' END as pickup_status,
  CASE WHEN delivery_location IS NULL THEN 'MISSING' ELSE 'OK' END as delivery_status,
  CASE WHEN company_name IS NULL THEN 'MISSING' ELSE 'OK' END as company_status,
  CASE WHEN cargo_weight IS NULL THEN 'MISSING' ELSE 'OK' END as weight_status
FROM public.service_offers
ORDER BY created_at DESC;

-- 3. Son 24 saatteki yeni teklifler
SELECT 
  id,
  pickup_location,
  delivery_location,
  company_name,
  cargo_weight,
  cargo_weight_unit,
  status,
  created_at
FROM public.service_offers 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ========================================
-- PERFORMANCE CHECK
-- ========================================

-- 1. Index kullanımını kontrol et
EXPLAIN ANALYZE 
SELECT * FROM public.service_offers 
WHERE pickup_location ILIKE '%istanbul%';

EXPLAIN ANALYZE 
SELECT * FROM public.service_offers 
WHERE company_name IS NOT NULL;

-- 2. Yavaş sorguları tespit et
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%service_offers%'
ORDER BY mean_time DESC
LIMIT 10;

-- ========================================
-- RLS POLICIES CHECK
-- ========================================

-- 1. RLS policies durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'service_offers';

-- 2. RLS enable durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'service_offers';

-- ========================================
-- FOREIGN KEY INTEGRITY
-- ========================================

-- 1. Orphan service offers (transport service olmayan)
SELECT 
  so.id,
  so.transport_service_id,
  so.created_at
FROM public.service_offers so
LEFT JOIN public.transport_services ts ON so.transport_service_id = ts.id
WHERE ts.id IS NULL;

-- 2. User olmayan teklifler
SELECT 
  so.id,
  so.user_id,
  so.created_at
FROM public.service_offers so
LEFT JOIN auth.users u ON so.user_id::text = u.id::text
WHERE u.id IS NULL;

-- ========================================
-- DATA QUALITY CHECKS
-- ========================================

-- 1. Cargo weight unit consistency
SELECT 
  cargo_weight_unit,
  COUNT(*) as count,
  AVG(cargo_weight) as avg_weight,
  MIN(cargo_weight) as min_weight,
  MAX(cargo_weight) as max_weight
FROM public.service_offers 
WHERE cargo_weight IS NOT NULL
GROUP BY cargo_weight_unit;

-- 2. Price currency distribution
SELECT 
  price_currency,
  COUNT(*) as count,
  AVG(price_amount) as avg_price,
  MIN(price_amount) as min_price,
  MAX(price_amount) as max_price
FROM public.service_offers 
WHERE price_amount IS NOT NULL
GROUP BY price_currency;

-- 3. Geographic data quality
SELECT 
  pickup_location,
  delivery_location,
  COUNT(*) as offer_count
FROM public.service_offers 
WHERE pickup_location IS NOT NULL 
  AND delivery_location IS NOT NULL
GROUP BY pickup_location, delivery_location
ORDER BY offer_count DESC;

-- ========================================
-- BOOLEAN FIELD DEBUG
-- ========================================

-- 1. Boolean field'ların durumu
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN matches_service_route = true THEN 1 END) as route_matches,
  COUNT(CASE WHEN capacity_meets_requirement = true THEN 1 END) as capacity_sufficient,
  COUNT(CASE WHEN customs_handling_included = true THEN 1 END) as customs_included,
  COUNT(CASE WHEN tracking_system_provided = true THEN 1 END) as tracking_provided
FROM public.service_offers;

-- 2. Boolean validation hatalarını tespit et
SELECT 
  id,
  matches_service_route,
  capacity_meets_requirement,
  pickup_location,
  delivery_location,
  cargo_weight
FROM public.service_offers 
WHERE (matches_service_route IS NULL AND pickup_location IS NOT NULL)
   OR (capacity_meets_requirement IS NULL AND cargo_weight IS NOT NULL);

-- ========================================
-- SCHEMA VERIFICATION
-- ========================================

-- 1. Tüm column'ları listele
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Constraint'leri kontrol et
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'service_offers' 
  AND table_schema = 'public';

-- 3. Index'leri kontrol et
SELECT 
  indexname,
  indexdef 
FROM pg_indexes 
WHERE tablename = 'service_offers' 
  AND schemaname = 'public'
ORDER BY indexname;

-- ========================================
-- CLEANUP QUERIES (ACİL DURUM)
-- ========================================

-- 1. Constraint hatalarını çöz
-- ALTER TABLE public.service_offers DROP CONSTRAINT pickup_location_not_empty;
-- ALTER TABLE public.service_offers DROP CONSTRAINT delivery_location_not_empty;

-- 2. RLS hatalarını çöz
-- DROP POLICY IF EXISTS "service_offers_select_policy" ON public.service_offers;

-- 3. Corrupt data temizliği (DİKKATLİ KULLAN!)
-- DELETE FROM public.service_offers WHERE pickup_location = '';
-- DELETE FROM public.service_offers WHERE delivery_location = '';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 
  'Debug queries ready! ✅' as status,
  'Use these queries to monitor system health' as note,
  NOW() as timestamp;

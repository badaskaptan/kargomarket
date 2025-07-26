-- Mevcut ads tabloları kontrol ve doğrulama
-- Bu script'i çalıştırarak mevcut tablolarınızı kontrol edebilirsiniz

-- 1. Mevcut tabloları listele
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%ad%' 
ORDER BY table_name;

-- 2. ads tablosu yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. ad_impressions tablosu yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ad_impressions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. ad_clicks tablosu yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ad_clicks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. advertisements tablosu yapısını kontrol et (bucket için)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'advertisements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Storage bucket kontrolü
SELECT name, public as is_public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'advertisements';

-- 7. RLS politikalarını kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('ads', 'ad_impressions', 'ad_clicks', 'advertisements')
ORDER BY tablename, policyname;

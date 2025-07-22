-- Supabase SQL Editor'da bu sorguları çalıştırın:

-- 1. Listings tablosunda kaç kayıt var?
SELECT COUNT(*) as total_listings FROM listings;

-- 2. Son 10 listing'i göster
SELECT id, title, created_at FROM listings 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Offers tablosunda kaç kayıt var?
SELECT COUNT(*) as total_offers FROM offers;

-- 4. Foreign key constraint'i kontrol et
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='offers'
  AND kcu.column_name='listing_id';

-- 5. Test için bir listing ekle (eğer hiç yoksa)
INSERT INTO listings (
    id, user_id, title, description, origin, destination,
    listing_type, transport_mode, load_type, status
) VALUES (
    gen_random_uuid(),
    'test-user-id',
    'Test İlanı',
    'Test açıklaması',
    'İstanbul',
    'Ankara', 
    'load',
    'road',
    'general_cargo',
    'active'
);

-- service_offers tablosundaki foreign key constraint'ini düzelt
-- transport_service_id listings yerine transport_services tablosuna referans etmeli

-- Önce mevcut constraint'i kaldır
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS service_offers_transport_service_id_fkey;

-- Doğru constraint'i ekle - transport_services tablosuna referans
ALTER TABLE service_offers ADD CONSTRAINT service_offers_transport_service_id_fkey 
FOREIGN KEY (transport_service_id) REFERENCES transport_services(id) ON DELETE CASCADE;

-- Constraint'i kontrol et
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'service_offers' 
    AND kcu.column_name = 'transport_service_id'
    AND tc.constraint_type = 'FOREIGN KEY';

-- REVIEWS FOREIGN KEYS UPDATE
-- transaction_id constraint'ini kaldırıp transport_services ile değiştir

-- 1. Yanlış constraint'i kaldır
ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS reviews_transaction_id_fkey;

-- 2. transaction_id sütununu da kaldır (kullanılmıyorsa)
-- ALTER TABLE reviews DROP COLUMN IF EXISTS transaction_id;

-- 3. Eğer transport_service_id sütunu yoksa ekle
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS transport_service_id uuid;

-- 4. transport_services için foreign key ekle
ALTER TABLE reviews 
ADD CONSTRAINT reviews_transport_service_id_fkey 
FOREIGN KEY (transport_service_id) 
REFERENCES transport_services(id) 
ON DELETE SET NULL;

-- 5. Güncellenmiş constraint'leri kontrol et
SELECT conname, confrelid::regclass, conrelid::regclass
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND contype = 'f';

SELECT 'Foreign keys updated successfully' as status;

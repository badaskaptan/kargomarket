-- Ads tablosuna category alanı ekle ve mevcut placement sistemini güncelle

-- 1. Ads tablosuna category alanı ekle
ALTER TABLE ads ADD COLUMN category TEXT DEFAULT 'general';

-- 2. Category alanı için check constraint ekle
ALTER TABLE ads ADD CONSTRAINT ads_category_check 
  CHECK (category IN ('transport', 'insurance', 'logistics', 'general'));

-- 3. Mevcut verilere default category ata (zaten DEFAULT var)
UPDATE ads 
SET category = 'general' 
WHERE category IS NULL;

-- 4. Category alanını NOT NULL yap
ALTER TABLE ads ALTER COLUMN category
SET
NOT NULL;

-- 5. Placement değerlerinin güncel durumunu kontrol et
SELECT DISTINCT placement
FROM ads;

-- 6. Güncellenen ads tablosu yapısını kontrol et
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ads' AND table_schema = 'public'
ORDER BY ordinal_position;

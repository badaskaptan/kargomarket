-- REVIEWS FOREIGN KEYS FIX
-- Bu dosya reviews tablosu için foreign key constraint'lerini ekler

-- 1. Önce mevcut constraint'leri kontrol et
SELECT conname, confrelid::regclass, conrelid::regclass
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND contype = 'f';

-- 2. Foreign key constraint'leri ekle
-- Reviewer için foreign key
ALTER TABLE reviews 
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Reviewee için foreign key  
ALTER TABLE reviews 
ADD CONSTRAINT reviews_reviewee_id_fkey 
FOREIGN KEY (reviewee_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Listing için foreign key (opsiyonel)
ALTER TABLE reviews 
ADD CONSTRAINT reviews_listing_id_fkey 
FOREIGN KEY (listing_id) 
REFERENCES listings(id) 
ON DELETE SET NULL;

-- 3. Test et
SELECT 'Foreign keys added successfully' as status;

-- 4. Constraint'leri kontrol et
SELECT conname, confrelid::regclass, conrelid::regclass
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND contype = 'f';

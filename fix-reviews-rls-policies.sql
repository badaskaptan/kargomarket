-- REVIEWS TABLE RLS POLICIES FIX
-- Bu dosya reviews tablosu için RLS politikalarını düzeltir

-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Herkes public review'ları görebilir" ON reviews;
DROP POLICY IF EXISTS "Kullanıcılar kendi review'larını ekleyebilir" ON reviews;
DROP POLICY IF EXISTS "Kullanıcılar kendi review'larını güncelleyebilir" ON reviews;
DROP POLICY IF EXISTS "Kullanıcılar kendi review'larını silebilir" ON reviews;
DROP POLICY IF EXISTS "Published reviews are viewable by all" ON reviews;

-- RLS'i aktif tut
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy - Kullanıcılar kendi yazdıklarını ve kendilerine yazılanları görebilir
CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewee_id OR 
    (is_public = true AND status = 'active')
  );

-- 2. INSERT Policy - Kullanıcılar sadece kendi adına review yazabilir
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 3. UPDATE Policy - Kullanıcılar sadece kendi yazdıklarını güncelleyebilir
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- 4. DELETE Policy - Kullanıcılar sadece kendi yazdıklarını silebilir
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Test sorgusu
SELECT 'RLS policies updated successfully' as status;

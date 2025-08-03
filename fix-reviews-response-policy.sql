-- REVIEWS RESPONSE POLICY FIX
-- Bu dosya reviews tablosundaki response alanını güncellemek için RLS politikasını düzeltir

-- Mevcut UPDATE policy'sini sil
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

-- Yeni UPDATE Policy - 
-- 1. Reviewer kendi yazdığı review'ı güncelleyebilir
-- 2. Reviewee kendine yazılan review'a response ekleyebilir/güncelleyebilir
CREATE POLICY "Users can update reviews and responses" ON reviews
  FOR UPDATE USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewee_id
  );

-- Test sorgusu
SELECT 'Reviews response policy updated successfully' as status;

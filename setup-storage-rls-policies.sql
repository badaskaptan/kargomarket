-- ==============================================
-- SUPABASE STORAGE RLS POLİTİKALARI
-- Bucket'lar için Row Level Security ayarları
-- ==============================================

-- 📁 listing-images bucket için politikalar
-- ========================================

-- Herkes okuyabilir
CREATE POLICY "Anyone can view listing images" ON storage.objects
FOR SELECT USING (bucket_id = 'listing-images');

-- Kimlik doğrulaması yapan kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own listing images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own listing images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 📄 listing-documents bucket için politikalar
-- ==========================================

-- Herkes okuyabilir
CREATE POLICY "Anyone can view listing documents" ON storage.objects
FOR SELECT USING (bucket_id = 'listing-documents');

-- Kimlik doğrulaması yapan kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload listing documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listing-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own listing documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'listing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own listing documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'listing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 👤 avatars bucket için politikalar
-- ==================================

-- Herkes okuyabilir
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Kimlik doğrulaması yapan kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ✅ POLİTİKA KONTROL KOMUTLARI
-- =============================

-- Storage politikalarını listele
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'storage' 
ORDER BY tablename, policyname;

-- Bucket'ları listele
SELECT * FROM storage.buckets;

-- ⚠️ GÜVENLIK NOTU
-- ================
-- Bu politikalar kullanıcıların yalnızca kendi klasörlerine dosya yüklemesine izin verir
-- Dosya yolu şu şekilde olmalıdır: {user_id}/{dosya_adi}
-- Örnek: 123e4567-e89b-12d3-a456-426614174000/dokuman.pdf

-- 🔧 BUCKET OLUŞTURMA KOMUTLARI (Manuel)
-- =======================================
-- Eğer bucket'lar yoksa, aşağıdaki SQL ile oluşturabilirsiniz:

/*
INSERT INTO storage.buckets (id, name, owner, public)
VALUES ('listing-images', 'listing-images', null, true);

INSERT INTO storage.buckets (id, name, owner, public)
VALUES ('listing-documents', 'listing-documents', null, true);

INSERT INTO storage.buckets (id, name, owner, public)
VALUES ('avatars', 'avatars', null, true);
*/

-- 🗑️ POLİTİKALARI TEMİZLE (Gerekirse)
-- ===================================
-- DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;

-- DROP POLICY IF EXISTS "Anyone can view listing documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload listing documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own listing documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own listing documents" ON storage.objects;

-- DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

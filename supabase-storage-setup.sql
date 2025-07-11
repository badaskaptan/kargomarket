-- Storage bucket'larını oluştur (Supabase'deki mevcut bucket'larla senkronize)
-- Eğer bucket'lar yoksa oluştur, varsa sadece RLS politikalarını güncelle

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  -- Avatar resimleri için
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    '{"image/jpeg","image/png","image/gif","image/webp"}'
  ),
  -- Reklam içerikleri için (resim + video)
  (
    'advertisements',
    'advertisements',
    true,
    52428800, -- 50MB
    '{"image/jpeg","image/png","image/gif","image/webp","video/mp4","video/webm"}'
  ),
  -- İlan resimleri için
  (
    'listing_images',
    'Listing Images',
    true,
    null, -- Limit yok
    null -- Tüm mime type'lar kabul
  ),
  -- Profil resimleri için
  (
    'profile_images',
    'Profile Images',
    true,
    null, -- Limit yok
    null -- Tüm mime type'lar kabul
  ),
  -- İlan dosyaları için (güncellenmiş)
  (
    'listings',
    'listings',
    true,
    10485760, -- 10MB (Supabase'deki mevcut değer)
    '{"image/jpeg","image/png","image/gif","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}'
  ),
  -- Belgeler için (güncellenmiş)
  (
    'documents',
    'documents', 
    true,
    20971520, -- 20MB (Supabase'deki mevcut değer)
    '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}'
  ),
  -- Mesaj dosyaları için
  (
    'messages',
    'messages',
    true,
    10485760, -- 10MB
    '{"image/jpeg","image/png","image/gif","application/pdf"}'
  ),
  -- Doğrulama belgeleri için
  (
    'verification_documents',
    'Verification Documents',
    true,
    null, -- Limit yok
    null -- Tüm mime type'lar kabul
  ),
  -- Mesaj ekleri için
  (
    'message_attachments',
    'Message Attachments',
    true,
    null, -- Limit yok
    null -- Tüm mime type'lar kabul
  )
ON CONFLICT (id) DO NOTHING;

-- RLS politikalarını oluştur

-- avatars bucket için politikalar
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public to view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- advertisements bucket için politikalar
CREATE POLICY "Allow authenticated users to upload advertisements"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'advertisements');

CREATE POLICY "Allow public to view advertisements"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'advertisements');

CREATE POLICY "Allow users to update their own advertisements"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'advertisements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own advertisements"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'advertisements' AND auth.uid()::text = (storage.foldername(name))[1]);

-- listing_images bucket için politikalar
CREATE POLICY "Allow authenticated users to upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing_images');

CREATE POLICY "Allow public to view listing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing_images');

CREATE POLICY "Allow users to update their own listing images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listing_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listing_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- profile_images bucket için politikalar
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile_images');

CREATE POLICY "Allow public to view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile_images');

CREATE POLICY "Allow users to update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- listings bucket için politikalar (güncellenmiş)
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

CREATE POLICY "Allow public to view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listings');

CREATE POLICY "Allow users to update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- documents bucket için politikalar
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public to view documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Allow users to update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- messages bucket için politikalar
CREATE POLICY "Allow authenticated users to upload message files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');

CREATE POLICY "Allow public to view message files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'messages');

CREATE POLICY "Allow users to update their own message files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own message files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- verification_documents bucket için politikalar
CREATE POLICY "Allow authenticated users to upload verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification_documents');

CREATE POLICY "Allow public to view verification documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'verification_documents');

CREATE POLICY "Allow users to update their own verification documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'verification_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own verification documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'verification_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- message_attachments bucket için politikalar
CREATE POLICY "Allow authenticated users to upload message attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message_attachments');

CREATE POLICY "Allow public to view message attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'message_attachments');

CREATE POLICY "Allow users to update their own message attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'message_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own message attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'message_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Offers için dosya saklama yapısını organize etmek için bucket ve policy kurulumu

-- 1. Eğer verification-documents bucket'ı mevcut değilse oluştur
-- Bu bucket offers'ın evraklarını saklamak için kullanılacak

-- Bucket oluşturma (Supabase Dashboard'dan yapılmalı veya SQL ile):
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-documents',
    'verification-documents', 
    false,  -- Private bucket
    10485760,  -- 10MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']::text[]
);
*/

-- 2. Offers için dosya saklama politikalarını oluştur

-- Kullanıcılar sadece kendi dosyalarını görebilir
CREATE POLICY IF NOT EXISTS "Users can view own offer documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = 'offers'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını yükleyebilir
CREATE POLICY IF NOT EXISTS "Users can upload own offer documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = 'offers'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Kullanıcılar kendi dosyalarını silebilir
CREATE POLICY IF NOT EXISTS "Users can delete own offer documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = 'offers'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. İlan sahibi de teklif evraklarını görebilir (teklif onay süreci için)
CREATE POLICY IF NOT EXISTS "Listing owners can view offer documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND (storage.foldername(name))[1] = 'offers'
    AND EXISTS (
        SELECT 1 FROM offers o
        INNER JOIN listings l ON l.id = o.listing_id
        WHERE l.user_id = auth.uid()
        AND (storage.foldername(name))[3] = o.id::text
    )
);

-- 4. Yorum ekle
COMMENT ON POLICY "Users can view own offer documents" ON storage.objects IS 
'Kullanıcılar sadece kendi teklif evraklarını görüntüleyebilir';

COMMENT ON POLICY "Users can upload own offer documents" ON storage.objects IS 
'Kullanıcılar kendi teklifleri için evrak yükleyebilir';

COMMENT ON POLICY "Users can delete own offer documents" ON storage.objects IS 
'Kullanıcılar kendi teklif evraklarını silebilir';

COMMENT ON POLICY "Listing owners can view offer documents" ON storage.objects IS 
'İlan sahipleri kendilerine gelen tekliflerin evraklarını görüntüleyebilir';

/*
DOSYA SAKLAMA YAPISI:
verification-documents/
├── offers/
│   ├── {user_id}/
│   │   ├── {offer_id}/
│   │   │   ├── 1691234567890-sigorta_belgesi.pdf
│   │   │   ├── 1691234567891-yetki_belgesi.pdf
│   │   │   └── 1691234567892-is_sozlesmesi.docx
│   │   └── {other_offer_id}/
│   └── {other_user_id}/
└── (diğer klasörler için ayrılmış alan)

ÖRNEK DOSYA YOLU:
verification-documents/offers/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001/1691234567890-sigorta_belgesi.pdf

Bu yapı şu avantajları sağlar:
- Kullanıcı bazlı dosya izolasyonu
- Teklif bazlı dosya organizasyonu  
- Güvenli dosya erişimi
- Kolay dosya yönetimi
- Scalable yapı
*/

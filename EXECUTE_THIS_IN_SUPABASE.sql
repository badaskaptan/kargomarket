-- ⚠️ BU SQL'İ SUPABASE DASHBOARD'DA SQL EDITOR'DE ÇALIŞTIRIN ⚠️
-- Offers tablosuna document kolonları ekleme

-- 1. Kolonları ekle
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS documents_description TEXT;

ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS document_urls text[] NULL;

ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS image_urls text[] NULL;

-- 2. transport_mode constraint'ini güncelle
ALTER TABLE public.offers 
DROP CONSTRAINT IF EXISTS offers_transport_mode_check;

ALTER TABLE public.offers 
ADD CONSTRAINT offers_transport_mode_check CHECK (
    (transport_mode IS NULL) OR 
    (transport_mode::text = ANY (
        ARRAY[
            'road'::character varying,
            'sea'::character varying, 
            'air'::character varying,
            'rail'::character varying,
            'multimodal'::character varying,
            'negotiable'::character varying
        ]::text[]
    ))
);

-- 3. Index'leri ekle
CREATE INDEX IF NOT EXISTS idx_offers_documents_description 
ON public.offers USING btree (documents_description) 
WHERE documents_description IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_offers_document_urls 
ON public.offers USING gin(document_urls) 
WHERE document_urls IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_offers_image_urls 
ON public.offers USING gin(image_urls) 
WHERE image_urls IS NOT NULL;

-- 4. Yorumları ekle
COMMENT ON COLUMN public.offers.documents_description IS 'Kullanıcının yüklediği evrakların açıklaması (opsiyonel)';
COMMENT ON COLUMN public.offers.document_urls IS 'Yüklenen evrak dosyalarının URL listesi (verification-documents bucket)';
COMMENT ON COLUMN public.offers.image_urls IS 'Yüklenen resim dosyalarının URL listesi (verification-documents bucket)';

-- 5. RLS Politikaları - Offers tablosu için (yeni kolonlar mevcut politikalar tarafından korunur)
-- Offers tablosunda RLS zaten aktif, yeni kolonlar otomatik olarak mevcut politikalardan faydalanır

-- 6. Storage RLS Politikaları - verification-documents bucket için
-- Bucket'ı oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS politikaları
CREATE POLICY "Users can upload offer documents"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

CREATE POLICY "Users can view their own offer documents" 
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

CREATE POLICY "Users can view documents of their listings' offers"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[4] IN (
    SELECT id::text FROM offers 
    WHERE listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own offer documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

CREATE POLICY "Users can delete their own offer documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[3] = auth.uid()::text
);

-- 7. Dosya saklama yapısı açıklaması
/*
DOSYA SAKLAMA YAPISI (listings pattern'i takip ederek):

verification-documents/
├── offers/
│   ├── documents/
│   │   ├── {user_id}/
│   │   │   ├── {offer_id}/
│   │   │   │   ├── {timestamp}-{filename}.pdf
│   │   │   │   └── {timestamp}-{filename}.docx
│   └── images/
│       ├── {user_id}/
│       │   ├── {offer_id}/
│       │   │   ├── {timestamp}-{filename}.jpg
│       │   │   └── {timestamp}-{filename}.png

ÖRNEK URL'LER:
- document_urls: ['offers/documents/user-id/offer-id/1691234567890-sigorta.pdf']
- image_urls: ['offers/images/user-id/offer-id/1691234567891-foto.jpg']

RLS GÜVENLİK YAPISI:
- Kullanıcılar sadece kendi dosyalarını yükleyebilir/görüntüleyebilir
- Listing sahibi, kendi ilanına gelen tekliflerin dosyalarını görüntüleyebilir
- Folder yapısı: [offers][documents/images][user_id][offer_id]
- Storage RLS politikaları path bazlı güvenlik sağlar
*/

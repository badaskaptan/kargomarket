-- Messages tablosuna attachment kolonları ekleme
-- Listings tablosundaki mantığı takip ederek basit URL array yaklaşımı

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS document_urls text[] NULL,
ADD COLUMN IF NOT EXISTS image_urls text[] NULL;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_messages_document_urls ON messages USING gin(document_urls) WHERE document_urls IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_image_urls ON messages USING gin(image_urls) WHERE image_urls IS NOT NULL;

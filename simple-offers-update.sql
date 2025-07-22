-- Simple database update to add transport_service_id support
-- Bu script offers tablosunu her iki tablo türü için de destekleyecek şekilde günceller

-- transport_service_id sütunu ekle
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_service_id UUID;

-- target_type sütunu ekle  
ALTER TABLE offers ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'listing';

-- Foreign key constraint ekle
ALTER TABLE offers ADD CONSTRAINT offers_transport_service_id_fkey 
FOREIGN KEY (transport_service_id) REFERENCES transport_services(id) ON DELETE CASCADE;

-- listing_id'yi nullable yap
ALTER TABLE offers ALTER COLUMN listing_id DROP NOT NULL;

-- Check constraint ekle - ya listing_id ya da transport_service_id olmalı
ALTER TABLE offers ADD CONSTRAINT offers_target_check 
CHECK (
  (listing_id IS NOT NULL AND transport_service_id IS NULL) OR 
  (listing_id IS NULL AND transport_service_id IS NOT NULL)
);

-- target_type constraint ekle
ALTER TABLE offers ADD CONSTRAINT offers_target_type_check 
CHECK (target_type IN ('listing', 'transport_service'));

-- Index'ler ekle
CREATE INDEX IF NOT EXISTS idx_offers_transport_service_id ON offers(transport_service_id);
CREATE INDEX IF NOT EXISTS idx_offers_target_type ON offers(target_type);

-- Comment'lar ekle
COMMENT ON COLUMN offers.transport_service_id IS 'Reference to transport_services table for transport service offers';
COMMENT ON COLUMN offers.target_type IS 'Determines if offer is for listing or transport_service';

-- Mevcut verileri güncelle
UPDATE offers SET target_type = 'listing' WHERE listing_id IS NOT NULL AND target_type IS NULL;

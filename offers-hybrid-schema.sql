-- ====================================
-- OFFERS TABLE HYBRID SOLUTION
-- Hem listings hem de transport_services tabloları için teklif sistemi
-- ====================================

-- Mevcut offers tablosunu güncelle
-- listing_id'yi nullable yap ve transport_service_id ekle
ALTER TABLE offers ALTER COLUMN listing_id DROP NOT NULL;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_service_id UUID;

-- Foreign key constraints ekle
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_transport_service_id_fkey;
ALTER TABLE offers ADD CONSTRAINT offers_transport_service_id_fkey 
FOREIGN KEY (transport_service_id) REFERENCES transport_services(id) ON DELETE CASCADE;

-- Her offer ya listing_id ya da transport_service_id'ye sahip olmalı (en az birisi)
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_target_check;
ALTER TABLE offers ADD CONSTRAINT offers_target_check 
CHECK (
  (listing_id IS NOT NULL AND transport_service_id IS NULL) OR 
  (listing_id IS NULL AND transport_service_id IS NOT NULL)
);

-- Target type belirlemek için enum ekle
ALTER TABLE offers ADD COLUMN IF NOT EXISTS target_type VARCHAR(20) DEFAULT 'listing';
ALTER TABLE offers ADD CONSTRAINT offers_target_type_check 
CHECK (target_type = ANY (ARRAY['listing'::text, 'transport_service'::text]));

-- Index'leri güncelle
DROP INDEX IF EXISTS idx_offers_listing_id;
DROP INDEX IF EXISTS idx_offers_transport_service_id;

CREATE INDEX idx_offers_listing_id ON offers(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX idx_offers_transport_service_id ON offers(transport_service_id) WHERE transport_service_id IS NOT NULL;
CREATE INDEX idx_offers_target_type ON offers(target_type);

-- Mevcut verileri güncelle (listing_id olan tüm offer'lar için target_type = 'listing')
UPDATE offers SET target_type = 'listing' WHERE listing_id IS NOT NULL AND target_type IS NULL;

-- Comment ekleme
COMMENT ON COLUMN offers.listing_id IS 'References listings table for load_listing and shipment_request offers';
COMMENT ON COLUMN offers.transport_service_id IS 'References transport_services table for transport_service offers';
COMMENT ON COLUMN offers.target_type IS 'Determines which table this offer targets: listing or transport_service';
COMMENT ON CONSTRAINT offers_target_check ON offers IS 'Ensures each offer targets exactly one entity type';

-- View oluştur - tüm offer'ları birleşik görmek için
CREATE OR REPLACE VIEW offers_with_target AS
SELECT 
  o.*,
  CASE 
    WHEN o.target_type = 'listing' THEN l.title
    WHEN o.target_type = 'transport_service' THEN ts.title
  END as target_title,
  CASE 
    WHEN o.target_type = 'listing' THEN l.user_id
    WHEN o.target_type = 'transport_service' THEN ts.user_id
  END as target_owner_id,
  CASE 
    WHEN o.target_type = 'listing' THEN l.transport_mode
    WHEN o.target_type = 'transport_service' THEN ts.transport_mode
  END as target_transport_mode
FROM offers o
LEFT JOIN listings l ON o.listing_id = l.id
LEFT JOIN transport_services ts ON o.transport_service_id = ts.id;

-- RLS (Row Level Security) politikalarını güncelle
DROP POLICY IF EXISTS "Users can view offers for their listings" ON offers;
DROP POLICY IF EXISTS "Users can view offers for their transport services" ON offers;
DROP POLICY IF EXISTS "Users can create offers" ON offers;

-- Kullanıcılar kendi ilanları/hizmetleri için gelen teklifleri görebilir
CREATE POLICY "Users can view offers for their content" ON offers
FOR SELECT USING (
  auth.uid() = user_id OR  -- Kendi verdiği teklifler
  (target_type = 'listing' AND EXISTS (
    SELECT 1 FROM listings WHERE id = listing_id AND user_id = auth.uid()
  )) OR  -- Kendi ilanları için gelen teklifler
  (target_type = 'transport_service' AND EXISTS (
    SELECT 1 FROM transport_services WHERE id = transport_service_id AND user_id = auth.uid()
  ))  -- Kendi hizmetleri için gelen teklifler
);

-- Kullanıcılar teklif oluşturabilir (kendi ilanları/hizmetleri hariç)
CREATE POLICY "Users can create offers" ON offers
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND  -- Sadece kendi adına teklif verebilir
  (
    (target_type = 'listing' AND EXISTS (
      SELECT 1 FROM listings WHERE id = listing_id AND user_id != auth.uid()
    )) OR  -- Başkasının ilanına teklif verebilir
    (target_type = 'transport_service' AND EXISTS (
      SELECT 1 FROM transport_services WHERE id = transport_service_id AND user_id != auth.uid()
    ))  -- Başkasının hizmetine teklif verebilir
  )
);

-- Kullanıcılar kendi tekliflerini güncelleyebilir
CREATE POLICY "Users can update their own offers" ON offers
FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi tekliflerini silebilir
CREATE POLICY "Users can delete their own offers" ON offers
FOR DELETE USING (auth.uid() = user_id);

COMMIT;

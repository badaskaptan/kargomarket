-- ====================================
-- COMPLETE OFFERS TABLE SCHEMA UPDATE
-- Frontend CreateOfferModal ile tam uyumlu backend güncellemesi
-- ====================================

-- ==== 1. TEMEL TAŞIMA BİLGİLERİ ====
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(20);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS cargo_type VARCHAR(50);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS service_scope VARCHAR(20);

-- Transport mode constraints
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_transport_mode_check;
ALTER TABLE offers ADD CONSTRAINT offers_transport_mode_check 
CHECK (transport_mode = ANY (ARRAY['road'::text, 'sea'::text, 'air'::text, 'rail'::text, 'multimodal'::text]));

-- Cargo type constraints
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_cargo_type_check;
ALTER TABLE offers ADD CONSTRAINT offers_cargo_type_check 
CHECK (cargo_type = ANY (ARRAY[
  'general_cargo'::text, 'bulk_cargo'::text, 'container'::text, 'liquid'::text, 
  'dry_bulk'::text, 'refrigerated'::text, 'hazardous'::text, 'oversized'::text,
  'project_cargo'::text, 'livestock'::text, 'vehicles'::text, 'machinery'::text
]));

-- Service scope constraints
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_service_scope_check;
ALTER TABLE offers ADD CONSTRAINT offers_service_scope_check 
CHECK (service_scope = ANY (ARRAY[
  'door_to_door'::text, 'port_to_port'::text, 'terminal_to_terminal'::text, 
  'warehouse_to_warehouse'::text, 'pickup_only'::text, 'delivery_only'::text
]));

-- ==== 2. GENİŞLETİLMİŞ FİYATLANDIRMA ====
-- Mevcut price_per constraint'ini güncelle
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_price_per_check;
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_price_per_enhanced_check;
ALTER TABLE offers ADD CONSTRAINT offers_price_per_enhanced_check 
CHECK (price_per = ANY (ARRAY[
  'total'::text, 'per_km'::text, 'per_ton'::text, 'per_ton_km'::text, 
  'per_pallet'::text, 'per_hour'::text, 'per_day'::text, 'per_container'::text,
  'per_teu'::text, 'per_cbm'::text, 'per_piece'::text, 'per_vehicle'::text
]));

-- ==== 3. TARİH VE SÜRE BİLGİLERİ ====
ALTER TABLE offers ADD COLUMN IF NOT EXISTS pickup_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transit_time_estimate VARCHAR(100);

-- ==== 4. İLETİŞİM BİLGİLERİ ====
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- ==== 5. HİZMET KAPSAMI VE ÖZELLİKLERİ ====
-- Gümrük ve dokümantasyon
ALTER TABLE offers ADD COLUMN IF NOT EXISTS customs_handling_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS documentation_handling_included BOOLEAN DEFAULT false;

-- Yükleme ve boşaltma
ALTER TABLE offers ADD COLUMN IF NOT EXISTS loading_unloading_included BOOLEAN DEFAULT false;

-- Takip ve teknoloji
ALTER TABLE offers ADD COLUMN IF NOT EXISTS tracking_system_provided BOOLEAN DEFAULT false;

-- Express ve hafta sonu hizmetleri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS express_service BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS weekend_service BOOLEAN DEFAULT false;

-- ==== 6. ÜCRET DAHİLİYETLERİ ====
ALTER TABLE offers ADD COLUMN IF NOT EXISTS fuel_surcharge_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS toll_fees_included BOOLEAN DEFAULT false;

-- ==== 7. JSONB ALANLARI (Esnek veri yapıları) ====
-- Ek şartlar ve koşullar
ALTER TABLE offers ADD COLUMN IF NOT EXISTS additional_terms JSONB;

-- Ek hizmetler
ALTER TABLE offers ADD COLUMN IF NOT EXISTS additional_services JSONB;

-- Taşıma moduna özel detaylar
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_specifics JSONB;

-- ==== 8. PERFORMANS İNDEKSLERİ ====
CREATE INDEX IF NOT EXISTS idx_offers_transport_mode ON offers(transport_mode);
CREATE INDEX IF NOT EXISTS idx_offers_cargo_type ON offers(cargo_type);
CREATE INDEX IF NOT EXISTS idx_offers_service_scope ON offers(service_scope);
CREATE INDEX IF NOT EXISTS idx_offers_pickup_date ON offers(pickup_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_delivery_date ON offers(delivery_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_price_per ON offers(price_per);
CREATE INDEX IF NOT EXISTS idx_offers_expires_at ON offers(expires_at);

-- ==== 9. JSONB İNDEKSLERİ ====
-- additional_terms için
CREATE INDEX IF NOT EXISTS idx_offers_additional_terms_gin ON offers USING GIN (additional_terms);

-- additional_services için  
CREATE INDEX IF NOT EXISTS idx_offers_additional_services_gin ON offers USING GIN (additional_services);

-- transport_specifics için
CREATE INDEX IF NOT EXISTS idx_offers_transport_specifics_gin ON offers USING GIN (transport_specifics);

-- ==== 10. YORUM VE DOKÜMANTASYON ====
COMMENT ON COLUMN offers.transport_mode IS 'Taşıma modu: road, sea, air, rail, multimodal';
COMMENT ON COLUMN offers.cargo_type IS 'Kargo türü: general_cargo, bulk_cargo, container, liquid, vb.';
COMMENT ON COLUMN offers.service_scope IS 'Hizmet kapsamı: door_to_door, port_to_port, vb.';
COMMENT ON COLUMN offers.pickup_date_preferred IS 'Tercih edilen toplama tarihi';
COMMENT ON COLUMN offers.delivery_date_preferred IS 'Tercih edilen teslimat tarihi';
COMMENT ON COLUMN offers.transit_time_estimate IS 'Tahmini transit süresi (örn: "2-3 gün")';
COMMENT ON COLUMN offers.contact_person IS 'İletişim kişisi adı';
COMMENT ON COLUMN offers.contact_phone IS 'İletişim telefonu';
COMMENT ON COLUMN offers.customs_handling_included IS 'Gümrük işlemleri dahil mi?';
COMMENT ON COLUMN offers.documentation_handling_included IS 'Dokümantasyon işlemleri dahil mi?';
COMMENT ON COLUMN offers.loading_unloading_included IS 'Yükleme/boşaltma dahil mi?';
COMMENT ON COLUMN offers.tracking_system_provided IS 'Takip sistemi sağlanıyor mu?';
COMMENT ON COLUMN offers.express_service IS 'Express servis var mı?';
COMMENT ON COLUMN offers.weekend_service IS 'Hafta sonu servisi var mı?';
COMMENT ON COLUMN offers.fuel_surcharge_included IS 'Yakıt ek ücreti dahil mi?';
COMMENT ON COLUMN offers.toll_fees_included IS 'Geçiş ücretleri dahil mi?';
COMMENT ON COLUMN offers.additional_terms IS 'Ek şartlar ve koşullar (JSON format)';
COMMENT ON COLUMN offers.additional_services IS 'Ek hizmetler (JSON format)';
COMMENT ON COLUMN offers.transport_specifics IS 'Taşıma moduna özel detaylar (JSON format)';

-- ==== 11. ÖRNEK JSONB YAPILARI ====
/*
additional_terms örnek yapısı:
{
  "insurance_included": true,
  "loading_assistance": true,
  "unloading_assistance": false,
  "tracking_available": true,
  "payment_terms": "after_delivery",
  "customs_handling": false,
  "documentation_handling": true,
  "express_service": false,
  "weekend_service": true
}

additional_services örnek yapısı:
{
  "express_delivery": false,
  "weekend_delivery": true,
  "special_handling": false,
  "customs_clearance": true,
  "fuel_surcharge_included": true,
  "toll_fees_included": false
}

transport_specifics örnek yapıları:

KARAYOLU için:
{
  "vehicle_type": "truck",
  "vehicle_capacity": "24_tons",
  "route_preferences": ["highway"],
  "driver_experience": "10_years"
}

DENİZ için:
{
  "vessel_type": "container_ship",
  "container_types": ["20ft", "40ft"],
  "port_facilities": ["crane", "storage"],
  "sailing_frequency": "weekly"
}

HAVA için:
{
  "airline": "Turkish Cargo",
  "aircraft_type": "cargo_plane",
  "cargo_compartment": "main_deck",
  "flight_frequency": "daily"
}
*/

-- ==== 12. VERİ TUTARLILIK KONTROL TRİGGERLERİ ====
-- Tarih kontrolü fonksiyonu
CREATE OR REPLACE FUNCTION check_offer_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Toplama tarihi teslimat tarihinden önce olmalı
  IF NEW.pickup_date_preferred IS NOT NULL AND NEW.delivery_date_preferred IS NOT NULL THEN
    IF NEW.pickup_date_preferred >= NEW.delivery_date_preferred THEN
      RAISE EXCEPTION 'Pickup date must be before delivery date';
    END IF;
  END IF;

  -- Geçerlilik tarihi gelecekte olmalı
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Expiry date must be in the future';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS tr_check_offer_dates ON offers;
CREATE TRIGGER tr_check_offer_dates
  BEFORE INSERT OR UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION check_offer_dates();

-- ==== 13. VERİ MİGRASYON SCRIPT'İ ====
-- Mevcut offer'lar için varsayılan değerler
UPDATE offers SET 
  transport_mode = 'road',
  cargo_type = 'general_cargo',
  service_scope = 'door_to_door',
  customs_handling_included = false,
  documentation_handling_included = false,
  loading_unloading_included = false,
  tracking_system_provided = true,
  express_service = false,
  weekend_service = false,
  fuel_surcharge_included = false,
  toll_fees_included = false
WHERE transport_mode IS NULL;

-- ==== 14. GÜNCELLEME SONRASI KONTROL SORGUSU ====
/*
-- Tablo yapısını kontrol etmek için:
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'offers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Constraint'leri kontrol etmek için:
SELECT 
  constraint_name, 
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'offers' 
  AND tc.table_schema = 'public';

-- İndeksleri kontrol etmek için:
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'offers' 
  AND schemaname = 'public';
*/

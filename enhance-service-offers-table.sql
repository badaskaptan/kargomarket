-- service_offers tablosunu offers tablosu kadar zenginleştir
-- Transport services için detaylı offer sistemi

-- Önce mevcut tabloyu yedekle (opsiyonel)
-- CREATE TABLE service_offers_backup AS SELECT * FROM service_offers;

-- Yeni alanları ekle
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS offer_type TEXT DEFAULT 'direct_offer' CHECK (offer_type IN ('bid', 'quote', 'direct_offer', 'counter_offer'));
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS parent_offer_id UUID REFERENCES service_offers(id) ON DELETE SET NULL;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS price_per TEXT CHECK (price_per IN ('total', 'per_km', 'per_ton', 'per_ton_km', 'per_pallet', 'per_hour', 'per_day', 'per_container', 'per_teu', 'per_cbm', 'per_piece', 'per_vehicle'));
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS price_breakdown JSONB DEFAULT '{}';
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS service_description TEXT;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS proposed_dates JSONB DEFAULT '{}';
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS validity_period INTEGER;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS additional_services JSONB DEFAULT '{}';
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS special_conditions TEXT;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS additional_terms JSONB DEFAULT '{}';
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS counter_offer_to UUID REFERENCES service_offers(id);

-- Transport Service için özel alanlar
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(20) CHECK (transport_mode IN ('road', 'sea', 'air', 'rail', 'multimodal'));
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS cargo_type VARCHAR(50) CHECK (cargo_type IN ('general_cargo', 'bulk_cargo', 'container', 'liquid', 'dry_bulk', 'refrigerated', 'hazardous', 'oversized', 'project_cargo', 'livestock', 'vehicles', 'machinery'));
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS service_scope VARCHAR(20) CHECK (service_scope IN ('door_to_door', 'port_to_port', 'terminal_to_terminal', 'warehouse_to_warehouse', 'pickup_only', 'delivery_only'));
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS pickup_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS delivery_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS transit_time_estimate VARCHAR(100);
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Service özellik alanları
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS customs_handling_included BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS documentation_handling_included BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS loading_unloading_included BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS tracking_system_provided BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS express_service BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS weekend_service BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS fuel_surcharge_included BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS toll_fees_included BOOLEAN DEFAULT FALSE;

-- Yeni indexler ekle
CREATE INDEX IF NOT EXISTS idx_service_offers_offer_type ON service_offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_service_offers_parent_offer_id ON service_offers(parent_offer_id);
CREATE INDEX IF NOT EXISTS idx_service_offers_transport_mode ON service_offers(transport_mode);
CREATE INDEX IF NOT EXISTS idx_service_offers_cargo_type ON service_offers(cargo_type);
CREATE INDEX IF NOT EXISTS idx_service_offers_service_scope ON service_offers(service_scope);
CREATE INDEX IF NOT EXISTS idx_service_offers_pickup_date ON service_offers(pickup_date_preferred);
CREATE INDEX IF NOT EXISTS idx_service_offers_delivery_date ON service_offers(delivery_date_preferred);
CREATE INDEX IF NOT EXISTS idx_service_offers_valid_until ON service_offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_service_offers_additional_terms_gin ON service_offers USING gin(additional_terms);
CREATE INDEX IF NOT EXISTS idx_service_offers_additional_services_gin ON service_offers USING gin(additional_services);

-- Update constraints
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS service_offers_status_check;
ALTER TABLE service_offers ADD CONSTRAINT service_offers_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'countered'));

-- Comments for new fields
COMMENT ON COLUMN service_offers.offer_type IS 'Teklif türü: bid, quote, direct_offer, counter_offer';
COMMENT ON COLUMN service_offers.transport_mode IS 'Taşıma modu: road, sea, air, rail, multimodal';
COMMENT ON COLUMN service_offers.cargo_type IS 'Kargo türü: general_cargo, bulk_cargo, container, vb.';
COMMENT ON COLUMN service_offers.service_scope IS 'Hizmet kapsamı: door_to_door, port_to_port, vb.';
COMMENT ON COLUMN service_offers.additional_services IS 'Ek hizmetler JSON formatında';
COMMENT ON COLUMN service_offers.customs_handling_included IS 'Gümrük işlemleri dahil mi';
COMMENT ON COLUMN service_offers.documentation_handling_included IS 'Dokümantasyon işlemleri dahil mi';
COMMENT ON COLUMN service_offers.tracking_system_provided IS 'Takip sistemi sağlanıyor mu';

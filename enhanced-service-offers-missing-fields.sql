-- Enhanced Service Offers Table - Eksik Alanları Ekle
-- EnhancedServiceOfferModal için gerekli ek alanlar

-- Eksik tarih alanları
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS pickup_date_latest TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS delivery_date_latest TIMESTAMP WITH TIME ZONE;

-- Kapasite bilgileri
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS weight_capacity_kg DECIMAL(10,2);
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS volume_capacity_m3 DECIMAL(10,3);

-- Sigorta bilgileri
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS insurance_coverage_amount DECIMAL(15,2);
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100);

-- Ek ücret dahil edilenler
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS port_charges_included BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS airport_charges_included BOOLEAN DEFAULT FALSE;

-- Garantiler
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS on_time_guarantee BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS damage_free_guarantee BOOLEAN DEFAULT FALSE;
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS temperature_guarantee BOOLEAN DEFAULT FALSE;

-- Ek iletişim bilgileri
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100);

-- Risk yönetimi
ALTER TABLE service_offers ADD COLUMN IF NOT EXISTS contingency_plan TEXT;

-- Yeni indexler
CREATE INDEX IF NOT EXISTS idx_service_offers_pickup_date_latest ON service_offers(pickup_date_latest);
CREATE INDEX IF NOT EXISTS idx_service_offers_delivery_date_latest ON service_offers(delivery_date_latest);
CREATE INDEX IF NOT EXISTS idx_service_offers_weight_capacity ON service_offers(weight_capacity_kg);
CREATE INDEX IF NOT EXISTS idx_service_offers_volume_capacity ON service_offers(volume_capacity_m3);
CREATE INDEX IF NOT EXISTS idx_service_offers_insurance_amount ON service_offers(insurance_coverage_amount);

-- Comments
COMMENT ON COLUMN service_offers.pickup_date_latest IS 'En geç pickup tarihi';
COMMENT ON COLUMN service_offers.delivery_date_latest IS 'En geç teslimat tarihi';
COMMENT ON COLUMN service_offers.weight_capacity_kg IS 'Ağırlık kapasitesi (kg)';
COMMENT ON COLUMN service_offers.volume_capacity_m3 IS 'Hacim kapasitesi (m³)';
COMMENT ON COLUMN service_offers.insurance_coverage_amount IS 'Sigorta kapsama tutarı';
COMMENT ON COLUMN service_offers.insurance_provider IS 'Sigorta sağlayıcısı';
COMMENT ON COLUMN service_offers.port_charges_included IS 'Liman ücretleri dahil mi';
COMMENT ON COLUMN service_offers.airport_charges_included IS 'Havaalanı ücretleri dahil mi';
COMMENT ON COLUMN service_offers.on_time_guarantee IS 'Zamanında teslimat garantisi';
COMMENT ON COLUMN service_offers.damage_free_guarantee IS 'Hasarsız teslimat garantisi';
COMMENT ON COLUMN service_offers.temperature_guarantee IS 'Sıcaklık garantisi';
COMMENT ON COLUMN service_offers.emergency_contact IS 'Acil durum iletişim';
COMMENT ON COLUMN service_offers.contingency_plan IS 'Acil durum planı';

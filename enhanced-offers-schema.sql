-- ====================================
-- ENHANCED OFFERS TABLE SCHEMA
-- Tüm taşıma modları ve yük alım/satım senaryoları için genişletilmiş offers tablosu
-- ====================================

-- Mevcut offers tablosuna yeni alanlar ekleme
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(20);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS cargo_type VARCHAR(50);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS service_scope VARCHAR(20);

-- Yeni ENUM constraints ekleme
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_transport_mode_check;
ALTER TABLE offers ADD CONSTRAINT offers_transport_mode_check 
CHECK (transport_mode = ANY (ARRAY['road'::text, 'sea'::text, 'air'::text, 'rail'::text, 'multimodal'::text]));

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_cargo_type_check;
ALTER TABLE offers ADD CONSTRAINT offers_cargo_type_check 
CHECK (cargo_type = ANY (ARRAY[
  'general_cargo'::text, 'bulk_cargo'::text, 'container'::text, 'liquid'::text, 
  'dry_bulk'::text, 'refrigerated'::text, 'hazardous'::text, 'oversized'::text,
  'project_cargo'::text, 'livestock'::text, 'vehicles'::text, 'machinery'::text
]));

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_service_scope_check;
ALTER TABLE offers ADD CONSTRAINT offers_service_scope_check 
CHECK (service_scope = ANY (ARRAY[
  'door_to_door'::text, 'port_to_port'::text, 'terminal_to_terminal'::text, 
  'warehouse_to_warehouse'::text, 'pickup_only'::text, 'delivery_only'::text
]));

-- Taşıma moduna özel alanlar için JSONB
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transport_specifics JSONB;

-- Tarih ve süre alanları
ALTER TABLE offers ADD COLUMN IF NOT EXISTS pickup_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS pickup_date_latest TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_date_preferred TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_date_latest TIMESTAMP WITH TIME ZONE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS transit_time_estimate VARCHAR(50);

-- Kapasite ve ağırlık bilgileri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS weight_capacity_kg DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS volume_capacity_m3 DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS vehicle_specifications JSONB;

-- Sigorta ve yasal gereksinimler
ALTER TABLE offers ADD COLUMN IF NOT EXISTS insurance_coverage_amount DECIMAL(12,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS customs_handling_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS documentation_handling_included BOOLEAN DEFAULT false;

-- Fiyatlandırma yapısı genişletmesi
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_price_per_enhanced_check;
ALTER TABLE offers ADD CONSTRAINT offers_price_per_enhanced_check 
CHECK (price_per = ANY (ARRAY[
  'total'::text, 'per_km'::text, 'per_ton'::text, 'per_ton_km'::text, 
  'per_pallet'::text, 'per_hour'::text, 'per_day'::text, 'per_container'::text,
  'per_teu'::text, 'per_cbm'::text, 'per_piece'::text, 'per_vehicle'::text
]));

-- Ek hizmetler ve özellikler
ALTER TABLE offers ADD COLUMN IF NOT EXISTS loading_unloading_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS tracking_system_provided BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS express_service BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS weekend_service BOOLEAN DEFAULT false;

-- İletişim ve koordinasyon
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100);

-- Taşıma moduna özel fiyatlandırma
ALTER TABLE offers ADD COLUMN IF NOT EXISTS fuel_surcharge_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS toll_fees_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS port_charges_included BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS airport_charges_included BOOLEAN DEFAULT false;

-- Risk yönetimi
ALTER TABLE offers ADD COLUMN IF NOT EXISTS risk_assessment JSONB;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS contingency_plan TEXT;

-- Performans garantileri
ALTER TABLE offers ADD COLUMN IF NOT EXISTS on_time_guarantee BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS damage_free_guarantee BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS temperature_guarantee BOOLEAN DEFAULT false;

-- İndeksler ekleme
CREATE INDEX IF NOT EXISTS idx_offers_transport_mode ON offers(transport_mode);
CREATE INDEX IF NOT EXISTS idx_offers_cargo_type ON offers(cargo_type);
CREATE INDEX IF NOT EXISTS idx_offers_service_scope ON offers(service_scope);
CREATE INDEX IF NOT EXISTS idx_offers_pickup_date ON offers(pickup_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_delivery_date ON offers(delivery_date_preferred);

-- Transport specifics için örnek veri yapıları (yorum olarak)
/*
TRANSPORT SPECIFICS EXAMPLES:

ROAD TRANSPORT:
{
  "vehicle_type": "truck",
  "plate_number": "34ABC123",
  "driver_info": {
    "name": "Ali Veli",
    "license_number": "123456789",
    "experience_years": 15
  },
  "route_preferences": ["highway", "avoid_city_center"],
  "parking_requirements": "large_vehicle_parking"
}

SEA TRANSPORT:
{
  "vessel_name": "MSC Container",
  "imo_number": "1234567",
  "container_types": ["20ft", "40ft"],
  "port_facilities": ["crane", "storage"],
  "sailing_schedule": "weekly",
  "transit_time_days": 7
}

AIR TRANSPORT:
{
  "airline": "Turkish Cargo",
  "aircraft_type": "Boeing 777F",
  "cargo_compartment": "main_deck",
  "handling_requirements": ["temperature_controlled"],
  "flight_frequency": "daily",
  "cutoff_time": "6_hours_before"
}

RAIL TRANSPORT:
{
  "railway_company": "TCDD",
  "wagon_type": "container_wagon",
  "route": "Istanbul-Ankara",
  "loading_terminal": "Halkali",
  "unloading_terminal": "Ankara",
  "service_frequency": "3_times_weekly"
}
*/

COMMENT ON COLUMN offers.transport_specifics IS 'Taşıma moduna özel detaylar (JSONB format)';
COMMENT ON COLUMN offers.vehicle_specifications IS 'Araç/gemi/uçak özelliklerı (JSONB format)';
COMMENT ON COLUMN offers.risk_assessment IS 'Risk analizi ve değerlendirmesi (JSONB format)';

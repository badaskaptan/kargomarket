-- ====================================
-- BACKEND OFFERS TABLE COMPLETE UPDATE
-- Frontend CreateOfferModal ile 100% uyumlu PostgreSQL schema güncellemesi
-- ====================================

-- NOT: Bu script PostgreSQL veritabanında çalıştırılmalıdır
-- Supabase Dashboard > SQL Editor'da çalıştırın

-- ==== 1. MEVCUT OFFERS TABLOSUNU GENİŞLETME ====

-- Temel taşıma bilgileri
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='transport_mode') THEN
        ALTER TABLE offers ADD COLUMN transport_mode VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='cargo_type') THEN
        ALTER TABLE offers ADD COLUMN cargo_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='service_scope') THEN
        ALTER TABLE offers ADD COLUMN service_scope VARCHAR(20);
    END IF;
END
$$;

-- ==== 2. TARIH VE SÜRE BİLGİLERİ ====
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='pickup_date_preferred') THEN
        ALTER TABLE offers ADD COLUMN pickup_date_preferred TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='delivery_date_preferred') THEN
        ALTER TABLE offers ADD COLUMN delivery_date_preferred TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='transit_time_estimate') THEN
        ALTER TABLE offers ADD COLUMN transit_time_estimate VARCHAR(100);
    END IF;
END
$$;

-- ==== 3. İLETİŞİM BİLGİLERİ ====
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='contact_person') THEN
        ALTER TABLE offers ADD COLUMN contact_person VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='contact_phone') THEN
        ALTER TABLE offers ADD COLUMN contact_phone VARCHAR(20);
    END IF;
END
$$;

-- ==== 4. HİZMET ÖZELLİKLERİ (BOOLEAN ALANLAR) ====
DO $$
BEGIN
    -- Gümrük ve dokümantasyon
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='customs_handling_included') THEN
        ALTER TABLE offers ADD COLUMN customs_handling_included BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='documentation_handling_included') THEN
        ALTER TABLE offers ADD COLUMN documentation_handling_included BOOLEAN DEFAULT false;
    END IF;
    
    -- Yükleme ve boşaltma
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='loading_unloading_included') THEN
        ALTER TABLE offers ADD COLUMN loading_unloading_included BOOLEAN DEFAULT false;
    END IF;
    
    -- Takip sistemi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='tracking_system_provided') THEN
        ALTER TABLE offers ADD COLUMN tracking_system_provided BOOLEAN DEFAULT false;
    END IF;
    
    -- Express ve hafta sonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='express_service') THEN
        ALTER TABLE offers ADD COLUMN express_service BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='weekend_service') THEN
        ALTER TABLE offers ADD COLUMN weekend_service BOOLEAN DEFAULT false;
    END IF;
    
    -- Ücret dahiliyetleri
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='fuel_surcharge_included') THEN
        ALTER TABLE offers ADD COLUMN fuel_surcharge_included BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='toll_fees_included') THEN
        ALTER TABLE offers ADD COLUMN toll_fees_included BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- ==== 5. JSONB ALANLARI ====
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='additional_terms') THEN
        ALTER TABLE offers ADD COLUMN additional_terms JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='additional_services') THEN
        ALTER TABLE offers ADD COLUMN additional_services JSONB;
    END IF;
END
$$;

-- ==== 6. CONSTRAINTS (Kısıtlamalar) ====
-- Transport mode constraint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='offers_transport_mode_check') THEN
        ALTER TABLE offers DROP CONSTRAINT offers_transport_mode_check;
    END IF;
    
    ALTER TABLE offers ADD CONSTRAINT offers_transport_mode_check 
    CHECK (transport_mode IS NULL OR transport_mode IN ('road', 'sea', 'air', 'rail', 'multimodal'));
END
$$;

-- Cargo type constraint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='offers_cargo_type_check') THEN
        ALTER TABLE offers DROP CONSTRAINT offers_cargo_type_check;
    END IF;
    
    ALTER TABLE offers ADD CONSTRAINT offers_cargo_type_check 
    CHECK (cargo_type IS NULL OR cargo_type IN (
        'general_cargo', 'bulk_cargo', 'container', 'liquid', 
        'dry_bulk', 'refrigerated', 'hazardous', 'oversized',
        'project_cargo', 'livestock', 'vehicles', 'machinery'
    ));
END
$$;

-- Service scope constraint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='offers_service_scope_check') THEN
        ALTER TABLE offers DROP CONSTRAINT offers_service_scope_check;
    END IF;
    
    ALTER TABLE offers ADD CONSTRAINT offers_service_scope_check 
    CHECK (service_scope IS NULL OR service_scope IN (
        'door_to_door', 'port_to_port', 'terminal_to_terminal', 
        'warehouse_to_warehouse', 'pickup_only', 'delivery_only'
    ));
END
$$;

-- Price per constraint güncellemesi
DO $$
BEGIN
    -- Eski constraint'leri kaldır
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='offers_price_per_check') THEN
        ALTER TABLE offers DROP CONSTRAINT offers_price_per_check;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='offers_price_per_enhanced_check') THEN
        ALTER TABLE offers DROP CONSTRAINT offers_price_per_enhanced_check;
    END IF;
    
    -- Yeni genişletilmiş constraint ekle
    ALTER TABLE offers ADD CONSTRAINT offers_price_per_enhanced_check 
    CHECK (price_per IN (
        'total', 'per_km', 'per_ton', 'per_ton_km', 
        'per_pallet', 'per_hour', 'per_day', 'per_container',
        'per_teu', 'per_cbm', 'per_piece', 'per_vehicle'
    ));
END
$$;

-- ==== 7. PERFORMANS İNDEKSLERİ ====
-- Temel indeksler
CREATE INDEX IF NOT EXISTS idx_offers_transport_mode ON offers(transport_mode);
CREATE INDEX IF NOT EXISTS idx_offers_cargo_type ON offers(cargo_type);
CREATE INDEX IF NOT EXISTS idx_offers_service_scope ON offers(service_scope);
CREATE INDEX IF NOT EXISTS idx_offers_pickup_date ON offers(pickup_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_delivery_date ON offers(delivery_date_preferred);
CREATE INDEX IF NOT EXISTS idx_offers_price_per ON offers(price_per);

-- JSONB indeksleri
CREATE INDEX IF NOT EXISTS idx_offers_additional_terms_gin ON offers USING GIN (additional_terms);
CREATE INDEX IF NOT EXISTS idx_offers_additional_services_gin ON offers USING GIN (additional_services);

-- ==== 8. VERİ MİGRASYONU ====
-- Mevcut kayıtlar için varsayılan değerler
UPDATE offers SET 
    transport_mode = COALESCE(transport_mode, 'road'),
    cargo_type = COALESCE(cargo_type, 'general_cargo'),
    service_scope = COALESCE(service_scope, 'door_to_door'),
    customs_handling_included = COALESCE(customs_handling_included, false),
    documentation_handling_included = COALESCE(documentation_handling_included, false),
    loading_unloading_included = COALESCE(loading_unloading_included, false),
    tracking_system_provided = COALESCE(tracking_system_provided, true),
    express_service = COALESCE(express_service, false),
    weekend_service = COALESCE(weekend_service, false),
    fuel_surcharge_included = COALESCE(fuel_surcharge_included, false),
    toll_fees_included = COALESCE(toll_fees_included, false)
WHERE transport_mode IS NULL 
   OR cargo_type IS NULL 
   OR service_scope IS NULL;

-- ==== 9. VERİ TUTARLILIK TRİGGERİ ====
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

-- Trigger
DROP TRIGGER IF EXISTS tr_check_offer_dates ON offers;
CREATE TRIGGER tr_check_offer_dates
    BEFORE INSERT OR UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION check_offer_dates();

-- ==== 10. YORUM VE DOKÜMANTASYON ====
COMMENT ON COLUMN offers.transport_mode IS 'Taşıma modu: road, sea, air, rail, multimodal';
COMMENT ON COLUMN offers.cargo_type IS 'Kargo türü: general_cargo, bulk_cargo, container, liquid, vb.';
COMMENT ON COLUMN offers.service_scope IS 'Hizmet kapsamı: door_to_door, port_to_port, vb.';
COMMENT ON COLUMN offers.pickup_date_preferred IS 'Tercih edilen toplama tarihi';
COMMENT ON COLUMN offers.delivery_date_preferred IS 'Tercih edilen teslimat tarihi';
COMMENT ON COLUMN offers.transit_time_estimate IS 'Tahmini transit süresi (örn: "2-3 gün")';
COMMENT ON COLUMN offers.contact_person IS 'İletişim kişisi adı';
COMMENT ON COLUMN offers.contact_phone IS 'İletişim telefonu';
COMMENT ON COLUMN offers.additional_terms IS 'Ek şartlar ve koşullar (JSON format)';
COMMENT ON COLUMN offers.additional_services IS 'Ek hizmetler (JSON format)';

-- ==== 11. VERIFICATION QUERY ====
-- Güncelleme başarılı mı kontrol et
SELECT 
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name = 'transport_mode' THEN 1 END) as has_transport_mode,
    COUNT(CASE WHEN column_name = 'cargo_type' THEN 1 END) as has_cargo_type,
    COUNT(CASE WHEN column_name = 'service_scope' THEN 1 END) as has_service_scope,
    COUNT(CASE WHEN column_name = 'additional_terms' THEN 1 END) as has_additional_terms,
    COUNT(CASE WHEN column_name = 'additional_services' THEN 1 END) as has_additional_services
FROM information_schema.columns 
WHERE table_name = 'offers' AND table_schema = 'public';

-- ==== 12. FRONTEND İLE UYUMLULUK KONTROLÜ ====
/*
CreateOfferModal'dan gelen veriler şu alanlarla eşleşir:

Frontend Field -> Database Column
-------------------------------
transport_mode -> transport_mode
cargo_type -> cargo_type
service_scope -> service_scope
pickup_date_preferred -> pickup_date_preferred
delivery_date_preferred -> delivery_date_preferred
estimated_delivery_time -> transit_time_estimate
contact_person -> contact_person
contact_phone -> contact_phone
terms_conditions.customs_handling -> customs_handling_included
terms_conditions.documentation_handling -> documentation_handling_included
terms_conditions.loading_assistance -> loading_unloading_included
terms_conditions.tracking_available -> tracking_system_provided
terms_conditions.express_service -> express_service
terms_conditions.weekend_service -> weekend_service
additional_services.fuel_surcharge_included -> fuel_surcharge_included
additional_services.toll_fees_included -> toll_fees_included
terms_conditions (full object) -> additional_terms
additional_services (full object) -> additional_services
*/

-- ==== 13. ÖRNEK SORGULAR ====
/*
-- Yeni teklif ekleme örneği:
INSERT INTO offers (
    listing_id, user_id, offer_type, price_amount, price_currency, price_per,
    message, service_description, expires_at, status,
    transport_mode, cargo_type, service_scope,
    pickup_date_preferred, delivery_date_preferred, transit_time_estimate,
    contact_person, contact_phone,
    customs_handling_included, documentation_handling_included,
    loading_unloading_included, tracking_system_provided,
    express_service, weekend_service,
    fuel_surcharge_included, toll_fees_included,
    additional_terms, additional_services
) VALUES (
    $1, $2, 'direct_offer', $3, $4, $5,
    $6, $7, $8, 'pending',
    $9, $10, $11,
    $12, $13, $14,
    $15, $16,
    $17, $18,
    $19, $20,
    $21, $22,
    $23, $24,
    $25, $26
);

-- Taşıma moduna göre teklifler
SELECT * FROM offers WHERE transport_mode = 'sea' AND cargo_type = 'container';

-- Express servis sağlayan teklifler
SELECT * FROM offers WHERE express_service = true;

-- JSONB sorgulama örnekleri
SELECT * FROM offers WHERE additional_terms->>'insurance_included' = 'true';
SELECT * FROM offers WHERE additional_services->>'customs_clearance' = 'true';
*/

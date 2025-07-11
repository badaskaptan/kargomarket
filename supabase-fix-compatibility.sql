-- ====================================
-- SUPABASE SCHEMA UYUMLULUK FİX - ARAÇ TİPLERİ VE EKSİK KOLONLAR
-- İndirilen CSV dosyalarına göre eksik alanları ekler
-- ÖNEMLİ: vehicle_types (çoğul, array) format tutarlılığı sağlandı
-- ====================================

-- 1. LISTINGS tablosuna eksik vehicle_types kolonu ekle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='vehicle_types') THEN
        ALTER TABLE listings ADD COLUMN vehicle_types TEXT[];
    END IF;
END $$;

-- 2. LISTINGS tablosuna eksik JSONB kolonları ekle (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='cargo_details') THEN
        ALTER TABLE listings ADD COLUMN cargo_details JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='transport_details') THEN
        ALTER TABLE listings ADD COLUMN transport_details JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='additional_requirements') THEN
        ALTER TABLE listings ADD COLUMN additional_requirements JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. PROFILES tablosuna eksik kolonlar (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='settings') THEN
        ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='metadata') THEN
        ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- 4. TRANSPORT_SERVICES tablosuna eksik kolonlar (eğer yoksa)  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='vehicle_types') THEN
        ALTER TABLE transport_services ADD COLUMN vehicle_types TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='max_weight') THEN
        ALTER TABLE transport_services ADD COLUMN max_weight DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='max_volume') THEN
        ALTER TABLE transport_services ADD COLUMN max_volume DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='coverage_areas') THEN
        ALTER TABLE transport_services ADD COLUMN coverage_areas JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='features') THEN
        ALTER TABLE transport_services ADD COLUMN features JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='pricing_model') THEN
        ALTER TABLE transport_services ADD COLUMN pricing_model TEXT DEFAULT 'negotiable';
        ALTER TABLE transport_services ADD CONSTRAINT chk_pricing_model CHECK (pricing_model IN ('per_km', 'per_hour', 'fixed', 'negotiable'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='base_price') THEN
        ALTER TABLE transport_services ADD COLUMN base_price DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='rating') THEN
        ALTER TABLE transport_services ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='rating_count') THEN
        ALTER TABLE transport_services ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='status') THEN
        ALTER TABLE transport_services ADD COLUMN status TEXT DEFAULT 'active';
        ALTER TABLE transport_services ADD CONSTRAINT chk_transport_status CHECK (status IN ('active', 'inactive', 'busy', 'maintenance'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_services' AND column_name='metadata') THEN
        ALTER TABLE transport_services ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- 5. OFFERS tablosuna eksik kolonlar (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='message') THEN
        ALTER TABLE offers ADD COLUMN message TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='valid_until') THEN
        ALTER TABLE offers ADD COLUMN valid_until TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='additional_terms') THEN
        ALTER TABLE offers ADD COLUMN additional_terms JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='offers' AND column_name='counter_offer_to') THEN
        ALTER TABLE offers ADD COLUMN counter_offer_to UUID REFERENCES offers(id);
    END IF;
END $$;

-- 6. REVIEWS tablosuna eksik detay kolonları (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='title') THEN
        ALTER TABLE reviews ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='review_type') THEN
        ALTER TABLE reviews ADD COLUMN review_type TEXT DEFAULT 'general';
        ALTER TABLE reviews ADD CONSTRAINT chk_review_type CHECK (review_type IN ('buyer_to_carrier', 'carrier_to_buyer', 'general'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='service_quality') THEN
        ALTER TABLE reviews ADD COLUMN service_quality INTEGER;
        ALTER TABLE reviews ADD CONSTRAINT chk_service_quality CHECK (service_quality >= 1 AND service_quality <= 5);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='communication') THEN
        ALTER TABLE reviews ADD COLUMN communication INTEGER;
        ALTER TABLE reviews ADD CONSTRAINT chk_communication CHECK (communication >= 1 AND communication <= 5);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='timeliness') THEN
        ALTER TABLE reviews ADD COLUMN timeliness INTEGER;
        ALTER TABLE reviews ADD CONSTRAINT chk_timeliness CHECK (timeliness >= 1 AND timeliness <= 5);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='status') THEN
        ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'active';
        ALTER TABLE reviews ADD CONSTRAINT chk_review_status CHECK (status IN ('active', 'hidden', 'reported'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='helpful_count') THEN
        ALTER TABLE reviews ADD COLUMN helpful_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='verified_transaction') THEN
        ALTER TABLE reviews ADD COLUMN verified_transaction BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='response') THEN
        ALTER TABLE reviews ADD COLUMN response TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='response_date') THEN
        ALTER TABLE reviews ADD COLUMN response_date TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='metadata') THEN
        ALTER TABLE reviews ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- 7-9. Diğer tablolar için kolon eklemeleri
DO $$
BEGIN
    -- TRANSACTIONS tablosu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='currency') THEN
        ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'TRY';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='platform_fee') THEN
        ALTER TABLE transactions ADD COLUMN platform_fee DECIMAL(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='tracking_number') THEN
        ALTER TABLE transactions ADD COLUMN tracking_number TEXT;
    END IF;

    -- ADS tablosu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='ad_type') THEN
        ALTER TABLE ads ADD COLUMN ad_type TEXT DEFAULT 'banner';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='impressions') THEN
        ALTER TABLE ads ADD COLUMN impressions INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ads' AND column_name='clicks') THEN
        ALTER TABLE ads ADD COLUMN clicks INTEGER DEFAULT 0;
    END IF;

    -- NOTIFICATIONS tablosu  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='notification_type') THEN
        ALTER TABLE notifications ADD COLUMN notification_type TEXT DEFAULT 'info';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='category') THEN
        ALTER TABLE notifications ADD COLUMN category TEXT DEFAULT 'system';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_id') THEN
        ALTER TABLE notifications ADD COLUMN related_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_type') THEN
        ALTER TABLE notifications ADD COLUMN related_type TEXT;
    END IF;
END $$;

-- 10. İNDEXLER (Performans için)
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_types ON listings USING GIN(vehicle_types);
CREATE INDEX IF NOT EXISTS idx_listings_transport_mode ON listings(transport_mode);
CREATE INDEX IF NOT EXISTS idx_transport_services_vehicle_types ON transport_services USING GIN(vehicle_types);
CREATE INDEX IF NOT EXISTS idx_transport_services_rating ON transport_services(rating);
CREATE INDEX IF NOT EXISTS idx_offers_valid_until ON offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews(review_type);

-- 11. FOREIGN KEY KONTROLÜ VE DÜZELTMESİ
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='related_load_listing_id') THEN
        ALTER TABLE listings ADD COLUMN related_load_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL;
        CREATE INDEX idx_listings_related_load_listing ON listings(related_load_listing_id);
    END IF;
END $$;

-- 12. RLS POLICY GÜNCELLEMELERI (Gerekirse)
-- Mevcut policies'i güncelle

-- Listings için vehicle_types erişimi
DROP POLICY IF EXISTS "Active listings are viewable by all" ON listings;
CREATE POLICY "Active listings are viewable by all" ON listings
  FOR SELECT USING (
    status = 'active' AND 
    visibility IN ('public', 'premium') AND 
    expires_at > NOW()
  );

-- Transport services için genel erişim
DROP POLICY IF EXISTS "Transport services are viewable by all" ON transport_services;
CREATE POLICY "Transport services are viewable by all" ON transport_services
  FOR SELECT USING (status = 'active');

-- Reviews için genel görünürlük
DROP POLICY IF EXISTS "Published reviews are viewable by all" ON reviews;
CREATE POLICY "Published reviews are viewable by all" ON reviews
  FOR SELECT USING (status = 'active');

-- ====================================
-- TAMAMLAMA MESAJI
-- ====================================

-- Bu SQL dosyası çalıştırıldıktan sonra:
-- 1. vehicle_types alanı listings tablosunda mevcut olacak
-- 2. Tüm JSONB alanları eklenmiş olacak  
-- 3. Foreign key ilişkileri düzeltilmiş olacak
-- 4. Performance indexleri eklenmiş olacak
-- 5. RLS policies güncellenmiş olacak

SELECT 'Schema alignment completed successfully!' as result;

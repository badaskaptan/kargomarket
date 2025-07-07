-- ====================================
-- KRİTİK EKSİK TABLOLAR - ÖNCE BUNLARI ÇALIŞTIRUN
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- ====================================

-- 1. REVIEWS tablosu (kritik - güven sistemi için)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('buyer_to_carrier', 'carrier_to_buyer', 'general')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'hidden', 'reported')) DEFAULT 'active',
  
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- 2. TRANSPORT_SERVICES tablosu
CREATE TABLE IF NOT EXISTS transport_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  vehicle_type TEXT NOT NULL,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  
  max_weight DECIMAL(10,2),
  max_volume DECIMAL(10,2),
  coverage_areas JSONB DEFAULT '[]',
  
  pricing_model TEXT CHECK (pricing_model IN ('per_km', 'per_hour', 'fixed', 'negotiable')) DEFAULT 'negotiable',
  base_price DECIMAL(10,2),
  
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  
  status TEXT CHECK (status IN ('active', 'inactive', 'busy', 'maintenance')) DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  
  contact_phone TEXT,
  contact_email TEXT,
  metadata JSONB DEFAULT '{}'
);

-- 3. TRANSACTIONS tablosu
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  carrier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  platform_fee DECIMAL(12,2) DEFAULT 0,
  
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')) DEFAULT 'pending',
  
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  tracking_updates JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

-- 4. MEVCUT TABLOLARA EKSİK KOLONLARI EKLE

-- profiles tablosuna rating alanları ekle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rating') THEN
        ALTER TABLE profiles ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rating_count') THEN
        ALTER TABLE profiles ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_transactions') THEN
        ALTER TABLE profiles ADD COLUMN total_transactions INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'settings') THEN
        ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- listings tablosuna sayaç alanları ekle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'views_count') THEN
        ALTER TABLE listings ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'offers_count') THEN
        ALTER TABLE listings ADD COLUMN offers_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_featured') THEN
        ALTER TABLE listings ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'expires_at') THEN
        ALTER TABLE listings ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 5. İNDEXLER
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_transport_services_user_id ON transport_services(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_services_status ON transport_services(status);
CREATE INDEX IF NOT EXISTS idx_transport_services_vehicle_type ON transport_services(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_transport_services_rating ON transport_services(rating);

CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_carrier_id ON transactions(carrier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- 6. RLS POLİCİLERİ
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view active reviews" ON reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = reviewer_id);

-- Transport services policies
CREATE POLICY "Users can view active transport services" ON transport_services
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage own transport services" ON transport_services
  FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = carrier_id);

-- 7. TRİGGERLAR
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_services_updated_at BEFORE UPDATE ON transport_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. UTİLİTY FONKSİYONLAR

-- Rating güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_user_rating_from_reviews(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM reviews 
    WHERE reviewed_id = user_uuid AND status = 'active';
    
    UPDATE profiles 
    SET rating = COALESCE(avg_rating, 0.00),
        rating_count = review_count
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Listing görüntülenme sayısını artırma
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE listings 
    SET views_count = views_count + 1
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Offer sayısını güncelleme
CREATE OR REPLACE FUNCTION update_listing_offers_count(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE listings 
    SET offers_count = (
        SELECT COUNT(*) 
        FROM offers 
        WHERE listing_id = listing_uuid
    )
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Review eklendiğinde/silindiğinde rating güncelleme trigger'ı
CREATE OR REPLACE FUNCTION handle_review_rating_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_rating_from_reviews(NEW.reviewed_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_rating_from_reviews(OLD.reviewed_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION handle_review_rating_update();

-- Offer sayısı güncelleme trigger'ı
CREATE OR REPLACE FUNCTION handle_offer_count_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_listing_offers_count(NEW.listing_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_listing_offers_count(OLD.listing_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER offers_count_trigger
    AFTER INSERT OR DELETE ON offers
    FOR EACH ROW EXECUTE FUNCTION handle_offer_count_change();

-- ====================================
-- KRİTİK TABLOLAR TAMAMLANDI
-- ====================================

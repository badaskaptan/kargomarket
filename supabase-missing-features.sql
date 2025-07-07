-- ====================================
-- KARGO MARKET - EKSİK TABLO VE ÖZELLİKLER TAMAMLAMA
-- Mevcut schema analizi sonrasında eksik parçalar
-- ====================================

-- ====================================
-- 1. REVIEWS TABLE (Değerlendirme sistemi eksik)
-- ====================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  
  -- Değerlendirme
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  
  -- Kategori
  review_type TEXT CHECK (review_type IN ('buyer_to_carrier', 'carrier_to_buyer', 'general')) NOT NULL,
  
  -- Durumu
  status TEXT CHECK (status IN ('active', 'hidden', 'reported')) DEFAULT 'active',
  
  -- Response
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 2. ADS TABLE (Reklam sistemi eksik)
-- ====================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reklam Detayları
  title TEXT NOT NULL,
  description TEXT,
  ad_type TEXT CHECK (ad_type IN ('banner', 'featured_listing', 'sponsored_post', 'premium_placement')) NOT NULL,
  
  -- Hedefleme
  target_audience JSONB DEFAULT '{}',
  target_locations JSONB DEFAULT '[]',
  target_categories JSONB DEFAULT '[]',
  
  -- Bütçe ve Ödeme
  budget_total DECIMAL(12,2),
  budget_daily DECIMAL(12,2),
  cost_per_click DECIMAL(8,4),
  cost_per_impression DECIMAL(8,4),
  
  -- İstatistikler
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Tarihler
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Durum
  status TEXT CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected')) DEFAULT 'draft',
  
  -- İçerik
  images JSONB DEFAULT '[]',
  call_to_action TEXT,
  landing_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 3. TRANSACTIONS TABLE (İşlem takibi eksik)
-- ====================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  carrier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Finansal Bilgiler
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  platform_fee DECIMAL(12,2) DEFAULT 0,
  carrier_amount DECIMAL(12,2) NOT NULL,
  
  -- Durum
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
  
  -- Ödeme Bilgileri
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')) DEFAULT 'pending',
  payment_reference TEXT,
  
  -- Teslimat Bilgileri
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  tracking_number TEXT,
  tracking_updates JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 4. TRANSPORT_SERVICES TABLE (Nakliye hizmetleri eksik)
-- ====================================
CREATE TABLE IF NOT EXISTS transport_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Hizmet Detayları
  service_name TEXT NOT NULL,
  description TEXT,
  
  -- Araç Bilgileri
  vehicle_type TEXT NOT NULL,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  license_plate TEXT,
  
  -- Kapasite
  max_weight DECIMAL(10,2),
  max_volume DECIMAL(10,2),
  max_dimensions JSONB, -- {length, width, height}
  
  -- Hizmet Alanları
  coverage_areas JSONB DEFAULT '[]',
  base_location TEXT,
  
  -- Özellikler
  features JSONB DEFAULT '[]', -- refrigerated, crane, etc.
  certifications JSONB DEFAULT '[]',
  
  -- Fiyatlandırma
  pricing_model TEXT CHECK (pricing_model IN ('per_km', 'per_hour', 'fixed', 'negotiable')) DEFAULT 'negotiable',
  base_price DECIMAL(10,2),
  price_per_km DECIMAL(8,2),
  price_per_hour DECIMAL(8,2),
  
  -- Müsaitlik
  availability_schedule JSONB DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  
  -- İstatistikler
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Durum
  status TEXT CHECK (status IN ('active', 'inactive', 'busy', 'maintenance')) DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- İletişim
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 5. FILES TABLE (Dosya yönetimi)
-- ====================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  related_id UUID, -- listing_id, offer_id, message_id, etc.
  related_type TEXT, -- 'listing', 'offer', 'message', 'profile', etc.
  
  -- Dosya Bilgileri
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Kategoriler
  file_category TEXT CHECK (file_category IN ('avatar', 'listing_image', 'document', 'attachment', 'transport_image')) NOT NULL,
  
  -- Durum
  status TEXT CHECK (status IN ('active', 'deleted', 'processing')) DEFAULT 'active',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 6. SAVED_SEARCHES TABLE (Kaydedilmiş aramalar)
-- ====================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Arama Detayları
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  
  -- Bildirim Ayarları
  email_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT FALSE,
  
  -- Durum
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 7. REPORTS TABLE (Şikayet sistemi)
-- ====================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  reported_offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  reported_review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  
  -- Şikayet Detayları
  report_type TEXT CHECK (report_type IN ('spam', 'fraud', 'inappropriate_content', 'fake_listing', 'payment_issue', 'other')) NOT NULL,
  description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]',
  
  -- Durum
  status TEXT CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')) DEFAULT 'pending',
  admin_notes TEXT,
  resolution_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 8. EKSİK İNDEXLER
-- ====================================

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Ads indexes
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_ad_type ON ads(ad_type);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_end_date ON ads(end_date);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_offer_id ON transactions(offer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_carrier_id ON transactions(carrier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Transport services indexes
CREATE INDEX IF NOT EXISTS idx_transport_services_user_id ON transport_services(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_services_status ON transport_services(status);
CREATE INDEX IF NOT EXISTS idx_transport_services_vehicle_type ON transport_services(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_transport_services_rating ON transport_services(rating);
CREATE INDEX IF NOT EXISTS idx_transport_services_location ON transport_services(base_location);

-- Files indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_related ON files(related_id, related_type);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(file_category);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);

-- Saved searches indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON saved_searches(is_active);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- ====================================
-- 9. EKSİK RLS POLİCİES
-- ====================================

-- Enable RLS on new tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view active reviews" ON reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = reviewer_id);

-- Ads policies
CREATE POLICY "Users can view active ads" ON ads
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage own ads" ON ads
  FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = carrier_id);

-- Transport services policies
CREATE POLICY "Users can view active transport services" ON transport_services
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage own transport services" ON transport_services
  FOR ALL USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view related files" ON files
  FOR SELECT USING (
    auth.uid() = user_id OR 
    related_type = 'listing' AND related_id IN (SELECT id FROM listings WHERE user_id = auth.uid()) OR
    file_category IN ('avatar', 'listing_image') AND status = 'active'
  );

CREATE POLICY "Users can manage own files" ON files
  FOR ALL USING (auth.uid() = user_id);

-- Saved searches policies
CREATE POLICY "Users can manage own saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- ====================================
-- 10. EKSİK TRİGGERLAR
-- ====================================

-- Updated at triggers for new tables
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_services_updated_at BEFORE UPDATE ON transport_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 11. UTİLİTY FONKSİYONLAR
-- ====================================

-- Function to update user rating based on reviews
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

-- Function to update transport service rating
CREATE OR REPLACE FUNCTION update_transport_service_stats(service_uuid UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
    completed_jobs INTEGER;
BEGIN
    -- Rating hesaplama (transport service ile ilgili reviews'lerden)
    SELECT AVG(r.rating), COUNT(*)
    INTO avg_rating, review_count
    FROM reviews r
    JOIN transactions t ON r.listing_id = t.listing_id
    JOIN transport_services ts ON t.carrier_id = ts.user_id
    WHERE ts.id = service_uuid AND r.status = 'active';
    
    -- Tamamlanan iş sayısı
    SELECT COUNT(*)
    INTO completed_jobs
    FROM transactions t
    JOIN transport_services ts ON t.carrier_id = ts.user_id
    WHERE ts.id = service_uuid AND t.status = 'completed';
    
    UPDATE transport_services 
    SET rating = COALESCE(avg_rating, 0.00),
        rating_count = review_count,
        total_jobs = completed_jobs,
        completion_rate = CASE 
            WHEN total_jobs > 0 THEN (completed_jobs::DECIMAL / total_jobs::DECIMAL) * 100
            ELSE 0.00
        END
    WHERE id = service_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings when review is created/updated
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

-- ====================================
-- 12. STORAGE BUCKETS (Eğer yoksa)
-- ====================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('listing-images', 'listing-images', true),
  ('transport-images', 'transport-images', true),
  ('ad-images', 'ad-images', true),
  ('documents', 'documents', false),
  ('message-attachments', 'message-attachments', false),
  ('reports-evidence', 'reports-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- TAMAMLAMA COMPLETED
-- ====================================

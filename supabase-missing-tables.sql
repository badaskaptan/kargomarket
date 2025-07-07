-- ====================================
-- KARGO MARKET - EKSİK TABLOLARI TAMAMLAMA
-- ====================================

-- ====================================
-- 1. PROFILES TABLE (Auth Extension ile bağlantı)
-- ====================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Temel Bilgiler
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  
  -- Roller
  user_type TEXT CHECK (user_type IN ('buyer_seller', 'carrier', 'both')) DEFAULT 'buyer_seller',
  
  -- Firma Bilgileri
  company_name TEXT,
  tax_office TEXT,
  tax_number TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Turkey',
  
  -- Platform Durumu
  status TEXT CHECK (status IN ('active', 'suspended', 'pending_verification')) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- İstatistikler
  total_listings INTEGER DEFAULT 0,
  total_offers INTEGER DEFAULT 0,
  total_completed_transactions INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- JSONB alanlar
  preferences JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 2. OFFERS TABLE (Teklifler)
-- ====================================
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Teklif Detayları
  offer_amount DECIMAL(12,2) NOT NULL,
  offer_currency TEXT DEFAULT 'TRY',
  message TEXT,
  
  -- Zaman
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Durum
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')) DEFAULT 'pending',
  
  -- Ek Bilgiler
  counter_offer_to UUID REFERENCES offers(id),
  additional_terms JSONB DEFAULT '{}',
  
  UNIQUE(listing_id, bidder_id)
);

-- ====================================
-- 3. MESSAGES TABLE (Mesajlaşma) - conversations tablosunu genişletme
-- ====================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  
  -- Mesaj İçeriği
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'system')) DEFAULT 'text',
  
  -- Durum
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Ek Bilgiler
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 4. REVIEWS TABLE (Değerlendirmeler)
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
  
  -- Kategoriler
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
  
  -- Durum
  status TEXT CHECK (status IN ('pending', 'published', 'hidden')) DEFAULT 'published',
  helpful_count INTEGER DEFAULT 0,
  
  -- Doğrulama
  verified_transaction BOOLEAN DEFAULT FALSE,
  
  UNIQUE(reviewer_id, reviewed_id, listing_id)
);

-- ====================================
-- 5. ADS TABLE (Reklamlar) - advertisements tablosunu genişletme
-- ====================================
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS ad_number TEXT UNIQUE;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS ad_type TEXT CHECK (ad_type IN ('banner', 'featured_listing', 'profile_boost', 'premium_card'));
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS target_audience TEXT CHECK (target_audience IN ('buyer_seller', 'carrier', 'all')) DEFAULT 'all';
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS target_locations TEXT[];
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS budget_amount DECIMAL(12,2);
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS budget_currency TEXT DEFAULT 'TRY';
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}';

-- ====================================
-- 6. NOTIFICATIONS TABLE (Bildirimler)
-- ====================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Alıcı
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Bildirim İçeriği
  type TEXT CHECK (type IN ('new_offer', 'offer_accepted', 'offer_rejected', 'new_message', 'listing_expired', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- İlişkili Kayıtlar
  related_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  related_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Durum
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Kanal Tercihleri
  sent_email BOOLEAN DEFAULT FALSE,
  sent_sms BOOLEAN DEFAULT FALSE,
  sent_push BOOLEAN DEFAULT FALSE,
  
  -- Ek Bilgiler
  action_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- 7. FILE_UPLOADS TABLE (Dosya Yüklemeleri)
-- ====================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Sahibi
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dosya Bilgileri
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- İlişkiler
  entity_type TEXT CHECK (entity_type IN ('profile', 'listing', 'message', 'advertisement')) NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Durum
  status TEXT CHECK (status IN ('uploading', 'completed', 'failed', 'deleted')) DEFAULT 'uploading',
  
  -- Ek Bilgiler
  metadata JSONB DEFAULT '{}'
);

-- ====================================
-- FOREIGN KEY İLİŞKİLERİNİ DÜZELTME
-- ====================================

-- Listings tablosuna eksik foreign key ekle
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;
ALTER TABLE listings ADD CONSTRAINT listings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Listing_form_data tablosuna foreign key ekle  
ALTER TABLE listing_form_data DROP CONSTRAINT IF EXISTS listing_form_data_listing_id_fkey;
ALTER TABLE listing_form_data ADD CONSTRAINT listing_form_data_listing_id_fkey 
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

-- Listing_transport_details tablosuna foreign key ekle
ALTER TABLE listing_transport_details DROP CONSTRAINT IF EXISTS listing_transport_details_listing_id_fkey;
ALTER TABLE listing_transport_details ADD CONSTRAINT listing_transport_details_listing_id_fkey 
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

-- Conversations tablosunda foreign key'leri düzelt
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_listing_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_sender_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_receiver_id_fkey;

ALTER TABLE conversations ADD CONSTRAINT conversations_listing_id_fkey 
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD CONSTRAINT conversations_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD CONSTRAINT conversations_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Chat tabloları için foreign key'ler
ALTER TABLE chat_participants DROP CONSTRAINT IF EXISTS chat_participants_chat_id_fkey;
ALTER TABLE chat_participants DROP CONSTRAINT IF EXISTS chat_participants_user_id_fkey;

ALTER TABLE chat_participants ADD CONSTRAINT chat_participants_chat_id_fkey 
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;
ALTER TABLE chat_participants ADD CONSTRAINT chat_participants_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Advertisements tablosunda foreign key düzelt
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_user_id_fkey;
ALTER TABLE advertisements ADD CONSTRAINT advertisements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ====================================
-- INDEXES (Performans Optimizasyonu)
-- ====================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_transport_mode ON listings(transport_mode);
CREATE INDEX IF NOT EXISTS idx_listings_origin ON listings(origin);
CREATE INDEX IF NOT EXISTS idx_listings_destination ON listings(destination);
CREATE INDEX IF NOT EXISTS idx_listings_load_type ON listings(load_type);
CREATE INDEX IF NOT EXISTS idx_listings_loading_date ON listings(loading_date);

-- Offers indexes
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_bidder_id ON offers(bidder_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);

-- ====================================
-- RLS POLICIES (Row Level Security)
-- ====================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings RLS policies  
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
DROP POLICY IF EXISTS "Users can manage own listings" ON listings;

CREATE POLICY "Anyone can view listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can manage own listings" ON listings 
  FOR ALL USING (auth.uid() = user_id);

-- Offers RLS policies
DROP POLICY IF EXISTS "Users can view relevant offers" ON offers;
DROP POLICY IF EXISTS "Users can manage own offers" ON offers;

CREATE POLICY "Users can view relevant offers" ON offers FOR SELECT USING (
  auth.uid() = bidder_id OR 
  auth.uid() IN (SELECT user_id FROM listings WHERE id = listing_id)
);
CREATE POLICY "Users can manage own offers" ON offers 
  FOR ALL USING (auth.uid() = bidder_id);

-- Messages RLS policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews RLS policies
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;

CREATE POLICY "Anyone can view published reviews" ON reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Users can manage own reviews" ON reviews 
  FOR ALL USING (auth.uid() = reviewer_id);

-- Notifications RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- File uploads RLS policies
DROP POLICY IF EXISTS "Users can manage own files" ON file_uploads;

CREATE POLICY "Users can manage own files" ON file_uploads 
  FOR ALL USING (auth.uid() = owner_id);

-- ====================================
-- TRIGGERS (Otomatik İşlemler)
-- ====================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- STORAGE BUCKETS (Dosya Depolama)
-- ====================================

-- Create storage buckets if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('listings', 'listings', true),
  ('documents', 'documents', false),
  ('advertisements', 'advertisements', true)
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- FUNCTIONS (Arama ve İstatistik)
-- ====================================

-- Search listings function
CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT '',
  listing_type_filter TEXT DEFAULT '',
  transport_mode_filter TEXT DEFAULT '',
  origin_filter TEXT DEFAULT '',
  destination_filter TEXT DEFAULT '',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS SETOF listings AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM listings
  WHERE 
    (search_query = '' OR (
      title ILIKE '%' || search_query || '%' 
      OR description ILIKE '%' || search_query || '%'
      OR load_type ILIKE '%' || search_query || '%'
    ))
    AND (listing_type_filter = '' OR listing_type = listing_type_filter)
    AND (transport_mode_filter = '' OR transport_mode = transport_mode_filter)
    AND (origin_filter = '' OR origin ILIKE '%' || origin_filter || '%')
    AND (destination_filter = '' OR destination ILIKE '%' || destination_filter || '%')
  ORDER BY created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User statistics function
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_listings', COALESCE((SELECT COUNT(*) FROM listings WHERE user_id = user_uuid), 0),
    'active_listings', COALESCE((SELECT COUNT(*) FROM listings WHERE user_id = user_uuid AND loading_date >= CURRENT_DATE), 0),
    'total_offers_made', COALESCE((SELECT COUNT(*) FROM offers WHERE bidder_id = user_uuid), 0),
    'total_offers_received', COALESCE((SELECT COUNT(*) FROM offers o JOIN listings l ON o.listing_id = l.id WHERE l.user_id = user_uuid), 0),
    'average_rating', COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE reviewed_id = user_uuid AND status = 'published'), 0),
    'total_reviews', COALESCE((SELECT COUNT(*) FROM reviews WHERE reviewed_id = user_uuid AND status = 'published'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

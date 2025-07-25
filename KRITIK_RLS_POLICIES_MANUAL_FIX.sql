-- 🔒 KRİTİK RLS POLİTİKALARI - SUPABASE MANUAL FIX
-- Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================================================
-- ⚠️ EN KRİTİK SORUN: SERVICE_OFFERS TABLOSU RLS POLİTİKALARI
-- =============================================================================

-- Önce mevcut hatalı politikaları sil (eğer varsa)
DROP POLICY IF EXISTS "Users can view offers on their listings" ON service_offers;
DROP POLICY IF EXISTS "service_offers_select_policy" ON service_offers;

-- 🚨 DOĞRU POLİTİKA: transport_services tablosuna referans veren
CREATE POLICY "Users can view service offers they sent" ON service_offers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view offers on their transport services" ON service_offers
  FOR SELECT USING (
    transport_service_id IN (
      SELECT id FROM transport_services WHERE user_id = auth.uid()
    )
  );

-- Diğer service_offers politikaları
CREATE POLICY "Users can create service offers" ON service_offers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own service offers" ON service_offers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own service offers" ON service_offers
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- MESSAGING SYSTEM POLİTİKALARI
-- =============================================================================

-- Messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Conversation participants table
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =============================================================================
-- TEMEL TABLOLAR İÇİN POLİTİKALAR
-- =============================================================================

-- Profiles (public read, own update)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Listings (public read, own crud)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can create their own listings" ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own listings" ON listings FOR UPDATE USING (user_id = auth.uid());

-- Transport services (public read, own crud)
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to transport_services" ON transport_services FOR SELECT USING (true);
CREATE POLICY "Users can create their own transport_services" ON transport_services FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own transport_services" ON transport_services FOR UPDATE USING (user_id = auth.uid());

-- Regular offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view offers they sent" ON offers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view offers on their listings" ON offers FOR SELECT USING (
  listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own offers" ON offers FOR UPDATE USING (user_id = auth.uid());

-- =============================================================================
-- DOĞRULAMA SORGUSU
-- =============================================================================

-- RLS durumunu kontrol et
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'listings', 'transport_services', 'offers', 'service_offers', 'conversations', 'conversation_participants', 'messages')
ORDER BY tablename;

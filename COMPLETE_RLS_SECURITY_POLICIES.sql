-- 🔒 KARGOMARKET - COMPLETE RLS SECURITY POLICIES
-- Bu dosya tüm tablolar için gerekli Row Level Security politikalarını içerir
-- Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================================================
-- 1. PROFILES TABLE RLS POLICIES
-- =============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (for public information like company names)
CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- =============================================================================
-- 2. LISTINGS TABLE RLS POLICIES
-- =============================================================================

-- Enable RLS on listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Users can view all listings (public marketplace)
CREATE POLICY "Allow public read access to listings" ON listings
  FOR SELECT USING (true);

-- Users can create their own listings
CREATE POLICY "Users can create their own listings" ON listings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own listings
CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own listings
CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- 3. TRANSPORT_SERVICES TABLE RLS POLICIES
-- =============================================================================

-- Enable RLS on transport_services table
ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

-- Users can view all transport services (public marketplace)
CREATE POLICY "Allow public read access to transport_services" ON transport_services
  FOR SELECT USING (true);

-- Users can create their own transport services
CREATE POLICY "Users can create their own transport_services" ON transport_services
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own transport services
CREATE POLICY "Users can update their own transport_services" ON transport_services
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own transport services
CREATE POLICY "Users can delete their own transport_services" ON transport_services
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- 4. OFFERS TABLE RLS POLICIES (Regular Offers)
-- =============================================================================

-- Enable RLS on offers table
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Users can view offers they sent
CREATE POLICY "Users can view offers they sent" ON offers
  FOR SELECT USING (user_id = auth.uid());

-- Users can view offers received on their listings
CREATE POLICY "Users can view offers on their listings" ON offers
  FOR SELECT USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

-- Users can create offers
CREATE POLICY "Users can create offers" ON offers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own offers
CREATE POLICY "Users can update their own offers" ON offers
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own offers
CREATE POLICY "Users can delete their own offers" ON offers
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- 5. SERVICE_OFFERS TABLE RLS POLICIES (Enhanced Offers)
-- =============================================================================

-- Enable RLS on service_offers table
ALTER TABLE service_offers ENABLE ROW LEVEL SECURITY;

-- Users can view service offers they sent
CREATE POLICY "Users can view service offers they sent" ON service_offers
  FOR SELECT USING (user_id = auth.uid());

-- ⚠️ CRITICAL: Users can view service offers on their transport services
-- NOT listings! transport_services table is the correct reference
CREATE POLICY "Users can view offers on their transport services" ON service_offers
  FOR SELECT USING (
    transport_service_id IN (
      SELECT id FROM transport_services WHERE user_id = auth.uid()
    )
  );

-- Users can create service offers
CREATE POLICY "Users can create service offers" ON service_offers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own service offers
CREATE POLICY "Users can update their own service offers" ON service_offers
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own service offers
CREATE POLICY "Users can delete their own service offers" ON service_offers
  FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- 6. MESSAGING SYSTEM RLS POLICIES
-- =============================================================================

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they participate in
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Users can update conversations they participate in
CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Enable RLS on conversation_participants table
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants of their conversations
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can add participants to conversations they're part of
CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their own participation
CREATE POLICY "Users can update their own participation" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their conversations
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- =============================================================================
-- 7. VERIFICATION QUERIES (Run after applying policies)
-- =============================================================================

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'listings', 'transport_services', 
    'offers', 'service_offers', 'conversations', 
    'conversation_participants', 'messages'
  )
ORDER BY tablename;

-- Check policies for each table
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as "Command",
  roles as "Roles"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- 8. TROUBLESHOOTING COMMANDS
-- =============================================================================

-- If you need to drop and recreate policies, uncomment these:

/*
-- Drop existing policies for fresh start
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Allow public read access to listings" ON listings;
DROP POLICY IF EXISTS "Users can create their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

DROP POLICY IF EXISTS "Allow public read access to transport_services" ON transport_services;
DROP POLICY IF EXISTS "Users can create their own transport_services" ON transport_services;
DROP POLICY IF EXISTS "Users can update their own transport_services" ON transport_services;
DROP POLICY IF EXISTS "Users can delete their own transport_services" ON transport_services;

DROP POLICY IF EXISTS "Users can view offers they sent" ON offers;
DROP POLICY IF EXISTS "Users can view offers on their listings" ON offers;
DROP POLICY IF EXISTS "Users can create offers" ON offers;
DROP POLICY IF EXISTS "Users can update their own offers" ON offers;
DROP POLICY IF EXISTS "Users can delete their own offers" ON offers;

DROP POLICY IF EXISTS "Users can view service offers they sent" ON service_offers;
DROP POLICY IF EXISTS "Users can view offers on their transport services" ON service_offers;
DROP POLICY IF EXISTS "Users can create service offers" ON service_offers;
DROP POLICY IF EXISTS "Users can update their own service offers" ON service_offers;
DROP POLICY IF EXISTS "Users can delete their own service offers" ON service_offers;

-- Messaging policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
*/

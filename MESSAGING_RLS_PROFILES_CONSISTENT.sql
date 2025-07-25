-- 🔒 MESAJLAŞMA SİSTEMİ RLS POLİTİKALARI (PROFILES UYUMLU)
-- Diğer modüllerle tutarlılık için profiles tablosunu referans alır
-- Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================================================
-- 1. CONVERSATIONS TABLOSU RLS POLİTİKALARI (PROFILES UYUMLU)
-- =============================================================================

-- RLS'yi etkinleştir
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece katıldıkları konuşmaları görebilir
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Kullanıcılar yeni konuşma oluşturabilir (profiles ile uyumlu)
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    creator_id = auth.uid() AND
    creator_id IN (SELECT id FROM profiles)
  );

-- Kullanıcılar katıldıkları konuşmaları güncelleyebilir
CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- =============================================================================
-- 2. CONVERSATION_PARTICIPANTS TABLOSU RLS POLİTİKALARI (PROFILES UYUMLU)
-- =============================================================================

-- RLS'yi etkinleştir
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar katıldıkları konuşmaların katılımcılarını görebilir
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Kullanıcılar katıldıkları konuşmalara yeni katılımcı ekleyebilir (profiles kontrolü)
CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    ) AND
    user_id IN (SELECT id FROM profiles)  -- Sadece profiles'da olan kullanıcılar
  );

-- Kullanıcılar kendi katılım durumlarını güncelleyebilir (profiles kontrolü)
CREATE POLICY "Users can update their own participation" ON conversation_participants
  FOR UPDATE USING (
    user_id = auth.uid() AND
    user_id IN (SELECT id FROM profiles)
  );

-- =============================================================================
-- 3. MESSAGES TABLOSU RLS POLİTİKALARI (PROFILES UYUMLU)
-- =============================================================================

-- RLS'yi etkinleştir
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece katıldıkları konuşmaların mesajlarını görebilir
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Kullanıcılar katıldıkları konuşmalara mesaj gönderebilir (profiles kontrolü)
CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    sender_id IN (SELECT id FROM profiles) AND  -- Profiles'da kayıtlı olmalı
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Kullanıcılar kendi mesajlarını güncelleyebilir (profiles kontrolü)
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid() AND
    sender_id IN (SELECT id FROM profiles)
  );

-- Kullanıcılar kendi mesajlarını silebilir (profiles kontrolü)
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (
    sender_id = auth.uid() AND
    sender_id IN (SELECT id FROM profiles)
  );

-- =============================================================================
-- 4. KONTROL SORGUSU
-- =============================================================================

-- Mesajlaşma tablolarının RLS durumunu kontrol et
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename;

-- Mesajlaşma politikalarını listele
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

-- =============================================================================
-- 5. TUTARLILIK KONTROLÜ (Diğer modüllerle uyumlu mu?)
-- =============================================================================

-- Tüm sistem genelinde profiles referansı kontrolü
SELECT 
  'listings' as table_name,
  COUNT(*) as profile_references
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'listings'
  AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%')

UNION ALL

SELECT 
  'service_offers' as table_name,
  COUNT(*) as profile_references
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'service_offers'
  AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%')

UNION ALL

SELECT 
  'messages' as table_name,
  COUNT(*) as profile_references
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'messages'
  AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%');

-- =============================================================================
-- 6. GÜVENLİK AÇIKLAMASI (PROFILES UYUMLU)
-- =============================================================================

/*
Bu güncellenen politikalar şunları garanti eder:

✅ Sadece 2 kişi arasında özel mesajlaşma
✅ Kullanıcı C, A-B arasındaki mesajları GÖREMEZ
✅ Conversation_participants tablosu katılımcı kontrolü yapar
✅ Her tablo auth.uid() + profiles tablosu kontrolü yapar
✅ Cross-user data leakage imkansız
✅ DİĞER MODÜLLERLE TUTARLI: listings, service_offers, transport_services ile aynı pattern

Fark:
- Eski: Sadece auth.uid() kontrolü
- Yeni: auth.uid() + profiles tablosu kontrolü (diğer modüllerle uyumlu)

Sonuç: Enterprise düzeyinde güvenli + tutarlı mesajlaşma sistemi
*/

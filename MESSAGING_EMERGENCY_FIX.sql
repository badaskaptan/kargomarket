-- 🚨 MESAJLAŞMA SİSTEMİ ACİL DÜZELTMESİ
-- Konuşmalar görünmüyor sorunu için hızlı çözüm

-- =============================================================================
-- SORUN: RLS POLİTİKA İSİMLERİ UYUMSUZLUĞU
-- =============================================================================

-- 1. MEVCUT HATALARI POLİTİKALARI SİL
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;

-- 2. DOĞRU İSİMLERDE YENİ POLİTİKALAR OLUŞTUR

-- Conversations için
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Messages için  
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Conversation participants için (eğer eksikse)
CREATE POLICY "Users can view their own participations" ON conversation_participants
  FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- HIZLI TEST SORGUSU
-- =============================================================================

-- Bu sorguyu çalıştırarak conversation_participants tablosunda veri var mı kontrol edin:
SELECT COUNT(*) as participant_count FROM conversation_participants;

-- Kullanıcının katılımcı olduğu konuşmaları kontrol edin:
-- SELECT * FROM conversation_participants WHERE user_id = auth.uid();

-- =============================================================================
-- DEBUG İÇİN KONTROL SORGUSU  
-- =============================================================================

-- Tüm aktif politikaları listele
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

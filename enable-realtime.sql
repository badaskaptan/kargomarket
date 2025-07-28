-- KargoMarketing - Realtime Publication Setup
-- Bu komutları Supabase Dashboard > SQL Editor'da çalıştırın

-- Mesajlaşma tabloları için realtime etkinleştir
ALTER PUBLICATION supabase_realtime
ADD TABLE conversations;

ALTER PUBLICATION supabase_realtime  
ADD TABLE messages;

ALTER PUBLICATION supabase_realtime
ADD TABLE conversation_participants;

-- Diğer tablolar için realtime (isteğe bağlı)
ALTER PUBLICATION supabase_realtime
ADD TABLE listings;

ALTER PUBLICATION supabase_realtime
ADD TABLE offers;

ALTER PUBLICATION supabase_realtime
ADD TABLE service_offers;

ALTER PUBLICATION supabase_realtime
ADD TABLE notifications;

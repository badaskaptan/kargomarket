📋 SUPABASE RLS MANUEL DÜZELTMESİ - UYGULAMA PLANI

=============================================================================
🚨 EN KRİTİK SORUN: SERVICE_OFFERS TABLOSU
=============================================================================

Problem: "Aldığım Teklifler" sekmesi boş görünüyor
Çözüm: RLS politikası listings tablosuna değil transport_services tablosuna referans vermeli

SUPABASE'DE YAPMANZ GEREKENLER:

1) SQL Editor'a gidin ve şu sorguyu çalıştırın:

-- Mevcut hatalı politikaları sil
DROP POLICY IF EXISTS "service_offers_select_policy" ON service_offers;

-- RLS'yi etkinleştir
ALTER TABLE service_offers ENABLE ROW LEVEL SECURITY;

-- DOĞRU politikayı oluştur
CREATE POLICY "Users can view offers on their transport services" ON service_offers
  FOR SELECT USING (
    transport_service_id IN (
      SELECT id FROM transport_services WHERE user_id = auth.uid()
    )
  );

=============================================================================
📋 DİĞER TABLOLAR İÇİN RLS KONTROLÜ
=============================================================================

Şu tabloları kontrol edin ve gerekirse RLS etkinleştirin:

TABLO: profiles
✅ RLS: Genel okuma, sadece kendi profili güncelleme

TABLO: listings  
✅ RLS: Genel okuma, kendi ilanlarını yönetme

TABLO: transport_services
✅ RLS: Genel okuma, kendi servislerini yönetme

TABLO: offers
✅ RLS: Kendi gönderdiği + aldığı teklifleri görme

TABLO: conversations
✅ RLS: Sadece katıldığı konuşmaları görme

TABLO: messages
✅ RLS: Sadece kendi konuşmalarının mesajlarını görme

=============================================================================
🔍 KONTROL SORGUSU (Supabase'de çalıştırın)
=============================================================================

-- RLS durumunu kontrol et:
SELECT 
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

-- Politika listesini kontrol et:
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'service_offers'
ORDER BY tablename, policyname;

=============================================================================
✅ TEST (Düzeltme sonrası)
=============================================================================

1. Uygulama dasboard'ına gidin
2. "Aldığım Teklifler" sekmesini açın
3. Transport servislerinize gelen teklifler görünmeli

Bu düzeltme sonrası sistem tamamen güvenli olacak ve "Aldığım Teklifler" 
sorunu çözülecek.

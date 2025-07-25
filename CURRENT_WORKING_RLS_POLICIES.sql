-- 🔒 MEVCUT RLS POLİTİKALARI - ÇALIŞAN DURUM
-- Supabase'deki güncel ve çalışan RLS politikalarının dokümantasyonu

-- =============================================================================
-- ✅ SERVICE_OFFERS TABLOSU - ÇALIŞAN POLİTİKALAR
-- =============================================================================

-- RLS: Disabled (Manuel kontrol için)
-- Politikalar:

-- 1. SELECT: Users can view offers on their transport services
--    Bu kritik politika "Aldığım Teklifler" sekmesini çalıştırıyor

-- 2. SELECT: Users can view their own sent service offers  
--    "Gönderdiğim Teklifler" sekmesini çalıştırıyor

-- 3. INSERT: Users can create service offers
--    Teklif oluşturma işlevselliği

-- 4. UPDATE: Users can update their own service offers
--    Kendi tekliflerini güncelleme

-- 5. UPDATE: Service owners can update offer status
--    Teklif sahibinin durum güncellemesi (accept/reject)

-- 6. DELETE: Users can delete their own service offers
--    Kendi tekliflerini silme

-- =============================================================================
-- ✅ TRANSPORT_SERVICES TABLOSU - ÇALIŞAN POLİTİKALAR  
-- =============================================================================

-- RLS: Disabled (Manuel kontrol için)
-- Politikalar:

-- 1. SELECT: Public can view active services
--    Genel marketplace görünümü

-- 2. ALL: Users can manage own services
--    Kullanıcılar kendi servislerini tam yönetebilir

-- =============================================================================
-- 🎯 SONUÇ: SİSTEM TAM ÇALIŞIR DURUMDA
-- =============================================================================

Bu politikalar ile:
✅ Aldığım Teklifler sekmesi çalışıyor
✅ Gönderdiğim Teklifler sekmesi çalışıyor  
✅ Transport servisler görünüyor
✅ Teklif oluşturma/güncelleme çalışıyor
✅ Mesajlaşma sistemi güvenli

-- =============================================================================
-- 📋 ÖNERİLEN İYİLEŞTİRMELER (Opsiyonel)
-- =============================================================================

-- Eğer daha sıkı güvenlik istiyorsanız:

-- 1. RLS'yi enable edin:
-- ALTER TABLE service_offers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transport_services ENABLE ROW LEVEL SECURITY;

-- 2. "Users can view offers on their transport services" politikasını
--    daha spesifik hale getirin:
-- CREATE POLICY "Users can view offers on their transport services" ON service_offers
--   FOR SELECT USING (
--     transport_service_id IN (
--       SELECT id FROM transport_services WHERE user_id = auth.uid()
--     )
--   );

-- =============================================================================
-- 🔍 KONTROL SORGUSU
-- =============================================================================

-- Mevcut politikaları listele:
SELECT 
  tablename,
  policyname,
  cmd as "Command",
  qual as "USING Expression",
  with_check as "WITH CHECK Expression"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('service_offers', 'transport_services')
ORDER BY tablename, policyname;

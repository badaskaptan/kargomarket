-- 🚨 SERVICE_OFFERS RLS ACIL DÜZELTMESİ
-- "Aldığım Teklifler" sorunu için kritik düzeltme

-- ADIM 1: Mevcut hatalı politikaları sil
DROP POLICY IF EXISTS "service_offers_select_policy" ON service_offers;
DROP POLICY IF EXISTS "Users can view offers on their listings" ON service_offers;

-- ADIM 2: RLS'yi etkinleştir (eğer değilse)
ALTER TABLE service_offers ENABLE ROW LEVEL SECURITY;

-- ADIM 3: DOĞRU politikaları oluştur

-- ✅ Gönderilen teklifler: Kullanıcı kendi gönderdiği teklifleri görebilir
CREATE POLICY "Users can view service offers they sent" ON service_offers
  FOR SELECT USING (user_id = auth.uid());

-- ✅ Alınan teklifler: transport_services tablosuna referans (listings DEĞİL!)
CREATE POLICY "Users can view offers on their transport services" ON service_offers
  FOR SELECT USING (
    transport_service_id IN (
      SELECT id FROM transport_services WHERE user_id = auth.uid()
    )
  );

-- Diğer temel işlemler
CREATE POLICY "Users can create service offers" ON service_offers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own service offers" ON service_offers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own service offers" ON service_offers
  FOR DELETE USING (user_id = auth.uid());

-- ADIM 4: Test sorgusu
-- Bu sorgu çalıştıktan sonra "Aldığım Teklifler" sekmesi çalışmalı
SELECT 
  so.*,
  ts.title as transport_service_title,
  p.company_name as sender_company
FROM service_offers so
JOIN transport_services ts ON so.transport_service_id = ts.id
JOIN profiles p ON so.user_id = p.id
WHERE ts.user_id = auth.uid()  -- Sizin transport servislerinize gelen teklifler
ORDER BY so.created_at DESC;

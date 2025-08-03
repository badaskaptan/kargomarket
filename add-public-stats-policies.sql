-- İstatistik sorguları için mevcut politikaları güncelle
-- Mevcut kısıtlı politikaları daha geniş hale getir

-- offers tablosu için mevcut "Users can view offers for their listings" politikasını güncelle
-- Önce mevcut politikayı kaldır
DROP POLICY IF EXISTS "Users can view offers for their listings" ON offers;
DROP POLICY IF EXISTS "Listing owners view offers" ON offers;
DROP POLICY IF EXISTS "Users manage own offers" ON offers;

-- Yeni politikalar - kendi tekliflerini ve kendi ilanlarına gelen teklifleri + istatistik için tümünü görebilir
CREATE POLICY "offers_comprehensive_access" ON offers FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid())) OR
  true  -- İstatistik amaçlı tüm kayıtlara okuma erişimi
);

CREATE POLICY "offers_insert_own" ON offers FOR INSERT WITH CHECK (true);
CREATE POLICY "offers_update_own" ON offers FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "offers_delete_own" ON offers FOR DELETE USING (auth.uid() = user_id);

-- service_offers tablosu için benzer güncelleme
DROP POLICY IF EXISTS "Users can view their own sent service offers" ON service_offers;
DROP POLICY IF EXISTS "Users can view offers on their transport services" ON service_offers;
DROP POLICY IF EXISTS "Service owners can update offer status" ON service_offers;

CREATE POLICY "service_offers_comprehensive_access" ON service_offers FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (transport_service_id IN (SELECT id FROM transport_services WHERE user_id = auth.uid())) OR
  true  -- İstatistik amaçlı tüm kayıtlara okuma erişimi
);

CREATE POLICY "service_offers_insert_own" ON service_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "service_offers_update_own" ON service_offers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "service_offers_delete_own" ON service_offers FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "service_offers_update_by_service_owner" ON service_offers FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM transport_services WHERE id = transport_service_id)
);

-- Mevcut politikaları kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('offers', 'service_offers')
ORDER BY tablename, policyname;

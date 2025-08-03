-- RLS politikalarını kontrol et ve statsService için gerekli izinleri ver

-- offers tablosu için read-only public policy
DROP POLICY IF EXISTS "offers_public_read" ON offers;
CREATE POLICY "offers_public_read" ON offers
  FOR SELECT USING (true);

-- service_offers tablosu için read-only public policy  
DROP POLICY IF EXISTS "service_offers_public_read" ON service_offers;
CREATE POLICY "service_offers_public_read" ON service_offers
  FOR SELECT USING (true);

-- Mevcut politikaları kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('offers', 'service_offers')
ORDER BY tablename, policyname;

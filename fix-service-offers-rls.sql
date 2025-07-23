-- service_offers RLS politikalarını düzelt
-- SORUN: Policy listings tablosuna bakıyor, transport_services olmalı

-- Mevcut yanlış policies'i sil
DROP POLICY IF EXISTS "Users can view offers on their transport services" ON service_offers;
DROP POLICY IF EXISTS "Service owners can update offer status" ON service_offers;

-- Doğru policies'i oluştur

-- Policy: Users can view offers received on their transport services (DÜZELTME)
CREATE POLICY "Users can view offers on their transport services" ON service_offers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM transport_services 
            WHERE id = service_offers.transport_service_id
        )
    );

-- Policy: Service owners can update offer status (accept/reject) (DÜZELTME)
CREATE POLICY "Service owners can update offer status" ON service_offers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM transport_services 
            WHERE id = service_offers.transport_service_id
        )
    );

-- Test için teyit sorgusu
SELECT 'RLS policies fixed for service_offers table' AS status;

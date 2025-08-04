-- 🚨 ACİL: Service Offers tablosuna kritik eksik alanları ekle
-- Bu alanlar olmadan sistem mantıklı çalışamaz

-- 1. Coğrafi bilgiler (EN ÖNEMLİ)
ALTER TABLE public.service_offers 
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(255);

-- 2. Hizmet referans bilgileri
ALTER TABLE public.service_offers 
ADD COLUMN IF NOT EXISTS service_reference_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS offered_vehicle_type VARCHAR(100);

-- 3. Güzergah ve kapasite uygunluğu
ALTER TABLE public.service_offers 
ADD COLUMN IF NOT EXISTS matches_service_route BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS capacity_meets_requirement BOOLEAN DEFAULT false;

-- 4. İndeksler ekleme (performans için)
CREATE INDEX IF NOT EXISTS idx_service_offers_pickup_location 
ON public.service_offers USING btree (pickup_location);

CREATE INDEX IF NOT EXISTS idx_service_offers_delivery_location 
ON public.service_offers USING btree (delivery_location);

CREATE INDEX IF NOT EXISTS idx_service_offers_matches_route 
ON public.service_offers USING btree (matches_service_route);

-- 5. Güvenlik politikaları güncelle (RLS)
-- Mevcut RLS politikalarını kontrol et ve güncelle
DROP POLICY IF EXISTS "service_offers_select_policy" ON public.service_offers;
CREATE POLICY "service_offers_select_policy" ON public.service_offers
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT ts.user_id 
    FROM transport_services ts 
    WHERE ts.id = transport_service_id
  )
);

-- 6. Constraint eklemeleri
ALTER TABLE public.service_offers 
ADD CONSTRAINT pickup_location_not_empty 
CHECK (pickup_location IS NOT NULL AND length(trim(pickup_location)) > 0);

ALTER TABLE public.service_offers 
ADD CONSTRAINT delivery_location_not_empty 
CHECK (delivery_location IS NOT NULL AND length(trim(delivery_location)) > 0);

COMMENT ON COLUMN public.service_offers.pickup_location IS 'Teklif verilen hizmetin alım noktası (şehir/bölge)';
COMMENT ON COLUMN public.service_offers.delivery_location IS 'Teklif verilen hizmetin teslimat noktası (şehir/bölge)';
COMMENT ON COLUMN public.service_offers.service_reference_title IS 'Teklif verilen nakliye hizmeti ilanının başlığı';
COMMENT ON COLUMN public.service_offers.offered_vehicle_type IS 'Teklif edilen araç/vasıta tipi';

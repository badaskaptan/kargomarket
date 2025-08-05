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

-- 2.1. Şirket ve iletişim bilgileri (YENİ)
ALTER TABLE public.service_offers 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_website VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_tax_number VARCHAR(50);

-- 2.2. Sigorta bilgileri (YENİ)
ALTER TABLE public.service_offers 
ADD COLUMN IF NOT EXISTS insurance_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100);

-- 2.3. Yük miktarı ve hacim bilgileri (YENİ)
ALTER TABLE public.service_offers 
ADD COLUMN IF NOT EXISTS cargo_weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cargo_weight_unit VARCHAR(10) DEFAULT 'kg' CHECK (cargo_weight_unit IN ('kg', 'ton', 'lb')),
ADD COLUMN IF NOT EXISTS cargo_volume DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cargo_volume_unit VARCHAR(10) DEFAULT 'm3' CHECK (cargo_volume_unit IN ('m3', 'ft3', 'l'));

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

-- 4.1. Yeni alanlar için indeksler
CREATE INDEX IF NOT EXISTS idx_service_offers_company_name 
ON public.service_offers USING btree (company_name);

CREATE INDEX IF NOT EXISTS idx_service_offers_cargo_weight 
ON public.service_offers USING btree (cargo_weight);

CREATE INDEX IF NOT EXISTS idx_service_offers_cargo_volume 
ON public.service_offers USING btree (cargo_volume);

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

-- 6. Constraint eklemeleri (sadece yeni teklifler için - mevcut veriler NULL olabilir)
-- NOT NULL constraint'i eklenmez, sadece boş string kontrolü
-- IF NOT EXISTS kullanamadığımız için önce DROP IF EXISTS yapıyoruz
ALTER TABLE public.service_offers 
DROP CONSTRAINT IF EXISTS pickup_location_not_empty;

ALTER TABLE public.service_offers 
DROP CONSTRAINT IF EXISTS delivery_location_not_empty;

-- Şimdi constraint'leri yeniden ekle
ALTER TABLE public.service_offers 
ADD CONSTRAINT pickup_location_not_empty 
CHECK (pickup_location IS NULL OR length(trim(pickup_location)) > 0);

ALTER TABLE public.service_offers 
ADD CONSTRAINT delivery_location_not_empty 
CHECK (delivery_location IS NULL OR length(trim(delivery_location)) > 0);

COMMENT ON COLUMN public.service_offers.pickup_location IS 'Teklif verilen hizmetin alım noktası (şehir/bölge)';
COMMENT ON COLUMN public.service_offers.delivery_location IS 'Teklif verilen hizmetin teslimat noktası (şehir/bölge)';
COMMENT ON COLUMN public.service_offers.service_reference_title IS 'Teklif verilen nakliye hizmeti ilanının başlığı';
COMMENT ON COLUMN public.service_offers.offered_vehicle_type IS 'Teklif edilen araç/vasıta tipi';

-- Yeni alanlar için açıklamalar
COMMENT ON COLUMN public.service_offers.company_name IS 'Teklif veren şirketin adı';
COMMENT ON COLUMN public.service_offers.company_website IS 'Şirket web sitesi adresi';
COMMENT ON COLUMN public.service_offers.company_tax_number IS 'Şirket vergi numarası';
COMMENT ON COLUMN public.service_offers.insurance_company IS 'Sigorta şirketi adı';
COMMENT ON COLUMN public.service_offers.insurance_policy_number IS 'Sigorta poliçe numarası';
COMMENT ON COLUMN public.service_offers.cargo_weight IS 'Yük ağırlığı';
COMMENT ON COLUMN public.service_offers.cargo_weight_unit IS 'Ağırlık birimi (kg, ton, lb)';
COMMENT ON COLUMN public.service_offers.cargo_volume IS 'Yük hacmi';
COMMENT ON COLUMN public.service_offers.cargo_volume_unit IS 'Hacim birimi (m3, ft3, l)';

-- 🐛 BOOLEAN FIELD DEBUG
-- "ALSANCAK" boolean hatası için field mapping kontrolü

-- 1. service_offers tablosundaki boolean column'ları listele
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND data_type = 'boolean'
ORDER BY column_name;

-- 2. matches_service_route ve capacity_meets_requirement field'larını kontrol et
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND column_name IN ('matches_service_route', 'capacity_meets_requirement');

-- 3. Text field'ların boolean'a karışıp karışmadığını kontrol et
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'service_offers' 
  AND column_name IN ('pickup_location', 'delivery_location', 'service_reference_title', 'offered_vehicle_type');

-- Service offers tablosundaki location constraint'lerini kaldır

-- Muhtemel constraint isimleri:
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS delivery_location_not_empty;
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS pickup_location_not_empty;
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS service_offers_delivery_location_check;
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS service_offers_pickup_location_check;
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS chk_delivery_location_not_empty;
ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS chk_pickup_location_not_empty;

-- Eğer başka constraint isimleri varsa, bu sorguyu çalıştırıp mevcut constraint'leri görebilirsiniz:
-- SELECT conname, consrc FROM pg_constraint WHERE conrelid = 'service_offers'::regclass AND contype = 'c';

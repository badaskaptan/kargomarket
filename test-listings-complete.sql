-- Test user oluştur ve listings ekle
-- NOT: Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Test user oluştur (eğer yoksa)
-- Bu kısım sadece test için, gerçek uygulamada auth.users otomatik doldurulur
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@example.com',
  '$2a$10$randomHashHere',
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Test user profile oluştur
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  company_name,
  phone,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  'test@example.com',
  'Test',
  'User',
  'Test Nakliye Ltd.',
  '+90 555 123 4567',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Test listings ekle
-- Yük İlanı
INSERT INTO listings (
  listing_type,
  title,
  description,
  origin,
  destination,
  load_type,
  weight_value,
  weight_unit,
  transport_mode,
  price_amount,
  price_currency,
  offer_type,
  status,
  user_id,
  created_at,
  updated_at
) VALUES (
  'load_listing',
  'İstanbul-Ankara Elektronik Yük Taşıma',
  'Elektronik eşyalar için dikkatli taşıma gerekli. Paketli ve sigortalı.',
  'İstanbul',
  'Ankara',
  'elektronik',
  1500,
  'kg',
  'road',
  3500.00,
  'TRY',
  'negotiable',
  'active',
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  now(),
  now()
);

-- Nakliye Talebi
INSERT INTO listings (
  listing_type,
  title,
  description,
  origin,
  destination,
  load_type,
  weight_value,
  weight_unit,
  transport_mode,
  budget_max,
  price_currency,
  offer_type,
  status,
  user_id,
  created_at,
  updated_at
) VALUES (
  'shipment_request',
  'Mobilya Taşıma Talebi - İzmir-Bursa',
  'Ev taşıma için mobilya ve eşyalar. Özenli taşıma gerekli.',
  'İzmir',
  'Bursa',
  'mobilya',
  800,
  'kg',
  'road',
  2000.00,
  'TRY',
  'free_quote',
  'active',
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  now(),
  now()
);

-- Nakliye Hizmeti
INSERT INTO listings (
  listing_type,
  title,
  description,
  origin,
  destination,
  transport_mode,
  vehicle_types,
  price_amount,
  price_currency,
  price_per,
  offer_type,
  status,
  user_id,
  created_at,
  updated_at
) VALUES (
  'transport_service',
  'Ankara-İstanbul Günlük Sefer Hizmeti',
  'Günlük sefer yapıyoruz. Hızlı ve güvenilir taşıma.',
  'Ankara',
  'İstanbul',
  'road',
  '{kamyon,kamyonet}',
  5.50,
  'TRY',
  'km',
  'fixed_price',
  'active',
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  now(),
  now()
);

-- Ek test listings (farklılık için)
INSERT INTO listings (
  listing_type,
  title,
  description,
  origin,
  destination,
  load_type,
  weight_value,
  weight_unit,
  transport_mode,
  price_amount,
  price_currency,
  offer_type,
  status,
  user_id,
  created_at,
  updated_at
) VALUES (
  'load_listing',
  'Bursa-Antalya Tekstil Ürünleri',
  'Kumaş ve hazır giyim ürünleri. Kuru ve temiz ortamda taşınmalı.',
  'Bursa',
  'Antalya',
  'tekstil',
  2000,
  'kg',
  'road',
  4200.00,
  'TRY',
  'fixed_price',
  'active',
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  now(),
  now()
),
(
  'shipment_request',
  'Makine Parçası Taşıma - Kocaeli-Konya',
  'Ağır makine parçaları. Özel araç gerekli.',
  'Kocaeli',
  'Konya',
  'makine',
  5000,
  'kg',
  'road',
  6000.00,
  'TRY',
  'negotiable',
  'active',
  'a1b2c3d4-5678-9abc-def0-123456789abc',
  now(),
  now()
);

-- Test için listing count'ını göster
SELECT 
  listing_type,
  count(*) as count
FROM listings 
WHERE status = 'active'
GROUP BY listing_type;

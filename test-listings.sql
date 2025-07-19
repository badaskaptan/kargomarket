-- Test listings eklemek için SQL komutları

-- 1. Yük İlanı (Load Listing)
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
  user_id
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
  -- Test user ID'si (gerçek uygulama için auth.users'dan alınmalı)
  'd7b9c4e8-1234-5678-9abc-def012345678'
);

-- 2. Nakliye Talebi (Shipment Request)
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
  user_id
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
  'd7b9c4e8-1234-5678-9abc-def012345678'
);

-- 3. Nakliye Hizmeti (Transport Service)
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
  user_id
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
  'd7b9c4e8-1234-5678-9abc-def012345678'
);

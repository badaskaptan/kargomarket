-- Farklı kullanıcılardan test ilanları ekle
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Test için farklı user ID'leri kullanacağız
-- Gerçek kullanım için auth.users tablosunda kayıtlı kullanıcılar olmalı

-- 1. İstanbul'dan Ankara'ya Yük İlanı (Nakliye Firması)
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
  'İstanbul-Ankara Elektronik Yük',
  'MacBook, iPhone ve diğer elektronik ürünler. Sigortalı taşıma gerekli.',
  'İstanbul, Taksim',
  'Ankara, Çankaya',
  'elektronik',
  150,
  'kg',
  'road',
  2500.00,
  'TRY',
  'negotiable',
  'active',
  '11111111-1111-1111-1111-111111111111',
  now() - INTERVAL '2 hours',
  now() - INTERVAL '2 hours'
);

-- 2. İzmir'den Bursa'ya Mobilya Taşıma Talebi
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
  'Ev Taşıma - İzmir→Bursa',
  '3+1 daire eşyaları. Beyaz eşya ve mobilyalar dahil. Özenli taşıma.',
  'İzmir, Alsancak',
  'Bursa, Nilüfer',
  'mobilya',
  1200,
  'kg',
  'road',
  3500.00,
  'TRY',
  'free_quote',
  'active',
  '22222222-2222-2222-2222-222222222222',
  now() - interval '5 hours',
  now() - interval '5 hours'
);

-- 3. Ankara-İstanbul Günlük Sefer Hizmeti
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
  'Ankara↔İstanbul Günlük Sefer',
  'Her gün sefer var. Hızlı ve güvenli. Kapıdan kapıya hizmet.',
  'Ankara Merkez',
  'İstanbul Avrupa',
  'road',
  '["kamyon", "kamyonet"]',
  4.50,
  'TRY',
  'km',
  'fixed_price',
  'active',
  '33333333-3333-3333-3333-333333333333',
  now() - interval '1 day',
  now() - interval '1 day'
);

-- 4. Bursa'dan Antalya'ya Tekstil Yükü
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
  'Bursa-Antalya Tekstil Sevkiyatı',
  'Hazır giyim ürünleri. Kuru ve temiz ortamda taşınmalı.',
  'Bursa, Osmangazi',
  'Antalya, Muratpaşa',
  'tekstil',
  800,
  'kg',
  'road',
  3200.00,
  'TRY',
  'fixed_price',
  'active',
  '44444444-4444-4444-4444-444444444444',
  now() - interval '3 hours',
  now() - interval '3 hours'
);

-- 5. Makine Parçası Taşıma Talebi
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
  'Ağır Makine Parçası - Kocaeli→Konya',
  'CNC tezgahı parçaları. Forklift gerekli. Çok dikkatli taşınmalı.',
  'Kocaeli, Gebze',
  'Konya, Selçuklu',
  'makine',
  2500,
  'kg',
  'road',
  5000.00,
  'TRY',
  'negotiable',
  'active',
  '55555555-5555-5555-5555-555555555555',
  now() - interval '6 hours',
  now() - interval '6 hours'
);

-- 6. Denizli-İstanbul Express Kargo
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
  'Denizli→İstanbul Express',
  'Haftada 3 sefer. Tekstil ve genel kargo.',
  'Denizli Merkez',
  'İstanbul Anadolu',
  'road',
  '["kamyon"]',
  3.80,
  'TRY',
  'km',
  'negotiable',
  'active',
  '66666666-6666-6666-6666-666666666666',
  now() - interval '12 hours',
  now() - interval '12 hours'
);

-- 7. Gıda Ürünleri Soğuk Zincir
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
  'Soğuk Zincir - Antalya→İstanbul',
  'Dondurulmuş gıda ürünleri. -18°C sabit sıcaklık.',
  'Antalya, Kepez',
  'İstanbul, Başakşehir',
  'gıda',
  500,
  'kg',
  'road',
  4500.00,
  'TRY',
  'fixed_price',
  'active',
  '77777777-7777-7777-7777-777777777777',
  now() - interval '4 hours',
  now() - interval '4 hours'
);

-- 8. Otomobil Taşıma Talebi
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
  'Araç Taşıma - Trabzon→Ankara',
  '2020 model sedan otomobil. Hasarsız teslim.',
  'Trabzon Merkez',
  'Ankara, Yenimahalle',
  'araç',
  1500,
  'kg',
  'road',
  2800.00,
  'TRY',
  'free_quote',
  'active',
  '88888888-8888-8888-8888-888888888888',
  now() - interval '8 hours',
  now() - interval '8 hours'
);

-- Sonuç kontrolü
SELECT 
  listing_type,
  count(*) as total_count,
  count(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM listings 
GROUP BY listing_type
ORDER BY listing_type;

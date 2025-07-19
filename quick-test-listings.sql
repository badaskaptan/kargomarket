-- Farklı kullanıcılardan test ilanları
-- Supabase SQL Editor'da çalıştırın

-- 1. İstanbul-Ankara Elektronik Yük
INSERT INTO listings (
  listing_type, title, description, origin, destination, load_type,
  weight_value, weight_unit, transport_mode, price_amount, price_currency,
  offer_type, status, user_id
) VALUES (
  'load_listing',
  'İstanbul-Ankara Elektronik Yük',
  'MacBook, iPhone ve diğer elektronik ürünler. Sigortalı taşıma gerekli.',
  'İstanbul, Taksim',
  'Ankara, Çankaya', 
  'elektronik',
  150, 'kg', 'road', 2500.00, 'TRY',
  'negotiable', 'active', '11111111-1111-1111-1111-111111111111'
);

-- 2. İzmir-Bursa Mobilya Taşıma
INSERT INTO listings (
  listing_type, title, description, origin, destination, load_type,
  weight_value, weight_unit, transport_mode, budget_max, price_currency,
  offer_type, status, user_id
) VALUES (
  'shipment_request',
  'Ev Taşıma - İzmir→Bursa', 
  '3+1 daire eşyaları. Beyaz eşya ve mobilyalar dahil.',
  'İzmir, Alsancak',
  'Bursa, Nilüfer',
  'mobilya',
  1200, 'kg', 'road', 3500.00, 'TRY',
  'free_quote', 'active', '22222222-2222-2222-2222-222222222222'
);

-- 3. Ankara-İstanbul Sefer Hizmeti
INSERT INTO listings (
  listing_type, title, description, origin, destination, transport_mode,
  vehicle_types, price_amount, price_currency, price_per, offer_type,
  status, user_id
) VALUES (
  'transport_service',
  'Ankara↔İstanbul Günlük Sefer',
  'Her gün sefer var. Kapıdan kapıya hizmet.',
  'Ankara Merkez',
  'İstanbul Avrupa',
  'road',
  '["kamyon", "kamyonet"]', 4.50, 'TRY', 'km',
  'fixed_price', 'active', '33333333-3333-3333-3333-333333333333'
);

-- 4. Bursa-Antalya Tekstil
INSERT INTO listings (
  listing_type, title, description, origin, destination, load_type,
  weight_value, weight_unit, transport_mode, price_amount, price_currency,
  offer_type, status, user_id
) VALUES (
  'load_listing',
  'Bursa-Antalya Tekstil Sevkiyatı',
  'Hazır giyim ürünleri. Kuru ve temiz ortamda taşınmalı.',
  'Bursa, Osmangazi',
  'Antalya, Muratpaşa',
  'tekstil',
  800, 'kg', 'road', 3200.00, 'TRY',
  'fixed_price', 'active', '44444444-4444-4444-4444-444444444444'
);

-- 5. Makine Parçası Taşıma
INSERT INTO listings (
  listing_type, title, description, origin, destination, load_type,
  weight_value, weight_unit, transport_mode, budget_max, price_currency,
  offer_type, status, user_id
) VALUES (
  'shipment_request',
  'Ağır Makine Parçası - Kocaeli→Konya',
  'CNC tezgahı parçaları. Forklift gerekli.',
  'Kocaeli, Gebze',
  'Konya, Selçuklu',
  'makine',
  2500, 'kg', 'road', 5000.00, 'TRY',
  'negotiable', 'active', '55555555-5555-5555-5555-555555555555'
);

-- 6. Gıda Ürünleri Soğuk Zincir
INSERT INTO listings (
  listing_type, title, description, origin, destination, load_type,
  weight_value, weight_unit, transport_mode, price_amount, price_currency,
  offer_type, status, user_id
) VALUES (
  'load_listing',
  'Soğuk Zincir - Antalya→İstanbul',
  'Dondurulmuş gıda ürünleri. -18°C sabit sıcaklık.',
  'Antalya, Kepez',
  'İstanbul, Başakşehir',
  'gıda',
  500, 'kg', 'road', 4500.00, 'TRY',
  'fixed_price', 'active', '77777777-7777-7777-7777-777777777777'
);

-- 7. Araç Taşıma Talebi
INSERT INTO listings (
  listing_type, title, description, origin, destination, load_type,
  weight_value, weight_unit, transport_mode, budget_max, price_currency,
  offer_type, status, user_id
) VALUES (
  'shipment_request',
  'Araç Taşıma - Trabzon→Ankara',
  '2020 model sedan otomobil. Hasarsız teslim.',
  'Trabzon Merkez',
  'Ankara, Yenimahalle',
  'araç',
  1500, 'kg', 'road', 2800.00, 'TRY',
  'free_quote', 'active', '88888888-8888-8888-8888-888888888888'
);

-- İlan sayısını kontrol et
SELECT listing_type, count(*) FROM listings WHERE status = 'active' GROUP BY listing_type;

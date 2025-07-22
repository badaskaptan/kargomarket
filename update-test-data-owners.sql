-- Mevcut listings ve transport services verilerini test kullanıcılarına atama

-- Listings tablosundaki mevcut verileri güncelle
UPDATE listings 
SET user_id = CASE 
    WHEN listing_number LIKE '%001' THEN '1cc5549f-2826-43f9-b378-a3861b5af9e7'
    WHEN listing_number LIKE '%002' THEN '2cc5549f-2826-43f9-b378-a3861b5af9e8'
    WHEN listing_number LIKE '%003' THEN '3cc5549f-2826-43f9-b378-a3861b5af9e9'
    WHEN listing_number LIKE '%004' THEN '4cc5549f-2826-43f9-b378-a3861b5af9ea'
    ELSE '5cc5549f-2826-43f9-b378-a3861b5af9eb'
END
WHERE user_id IS NULL OR user_id = '1cc5549f-2826-43f9-b378-a3861b5af9e7';

-- Transport services tablosundaki mevcut verileri güncelle
UPDATE transport_services 
SET user_id = CASE 
    WHEN service_number LIKE '%001' THEN '1cc5549f-2826-43f9-b378-a3861b5af9e7'
    WHEN service_number LIKE '%002' THEN '2cc5549f-2826-43f9-b378-a3861b5af9e8'
    WHEN service_number LIKE '%003' THEN '3cc5549f-2826-43f9-b378-a3861b5af9e9'
    WHEN service_number LIKE '%004' THEN '4cc5549f-2826-43f9-b378-a3861b5af9ea'
    ELSE '5cc5549f-2826-43f9-b378-a3861b5af9eb'
END
WHERE user_id IS NULL OR user_id = '1cc5549f-2826-43f9-b378-a3861b5af9e7';

-- Yeni test listings ekle
INSERT INTO listings (
    user_id,
    listing_number,
    listing_type,
    role_type,
    title,
    description,
    origin,
    destination,
    load_type,
    weight_value,
    weight_unit,
    price_amount,
    price_currency,
    transport_mode,
    status
) VALUES 
(
    '3cc5549f-2826-43f9-b378-a3861b5af9e9',
    'LD20250722001',
    'load_listing',
    'seller',
    'Ankara-İzmir Tekstil Ürünleri Taşınacak',
    'Kaliteli tekstil ürünleri güvenli taşıma ile İzmir''e gönderilecek. Ambalajlı ve temiz.',
    'Ankara',
    'İzmir',
    'textile',
    8500,
    'kg',
    12000,
    'TRY',
    'road',
    'active'
),
(
    '4cc5549f-2826-43f9-b378-a3861b5af9ea',
    'SR20250722001',
    'shipment_request',
    'buyer',
    'İstanbul-Bursa Makine Parçası Nakliye Talebi',
    'Ağır makine parçaları için özel yükleme ekipmanı gereken nakliye talebi.',
    'İstanbul',
    'Bursa',
    'machinery',
    15000,
    'kg',
    8500,
    'TRY',
    'road',
    'active'
);

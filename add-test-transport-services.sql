-- Transport Services test verisi ekleme - Kullanıcı ID ile
-- Aşağıdaki user_id'yi kendi user_id'nizle değiştirin: 1cc5549f-2826-43f9-b378-a3861b5af9e7

INSERT INTO transport_services
    (
    service_number,
    title,
    description,
    transport_mode,
    vehicle_type,
    origin,
    destination,
    available_from_date,
    available_until_date,
    capacity_value,
    capacity_unit,
    company_name,
    contact_info,
    status,
    user_id
    )
VALUES
    (
        'TS202507190001',
        'İstanbul-Ankara Karayolu Nakliye Hizmeti',
        'Güvenilir ve hızlı karayolu taşımacılığı. 7/24 hizmet.',
        'road',
        'Kamyon',
        'İstanbul',
        'Ankara',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL
'30 days',
    25000,
    'kg',
    'Test Nakliye A.Ş.',
    'Telefon: +90 212 555 0123',
    'active',
    '1cc5549f-2826-43f9-b378-a3861b5af9e7'  -- Sizin user ID'niz
),
(
    'TS202507190002', 
    'Denizli-Bursa Tekstil Taşımacılığı',
    'Tekstil ürünleri için özel paketleme ve nakliye.',
    'road',
    'Kapalı Kasa',
    'Denizli',
    'Bursa',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    15000,
    'kg',
    'Tekstil Lojistik Ltd.',
    'info@tekstillojistik.com',
    'active',
    '1cc5549f-2826-43f9-b378-a3861b5af9e7'  -- Sizin user ID'niz
);

-- Eklenen verileri kontrol et
SELECT
    id,
    service_number,
    title,
    transport_mode,
    origin,
    destination,
    status,
    user_id,
    created_at
FROM transport_services
WHERE user_id = '1cc5549f-2826-43f9-b378-a3861b5af9e7'
ORDER BY created_at DESC;

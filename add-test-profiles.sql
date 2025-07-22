-- Test kullanıcıları ekleme scripti
-- Bu kullanıcılar listings ve transport_services tablolarındaki test verilerinin sahibi olacak

INSERT INTO profiles (
    id,
    created_at,
    updated_at,
    full_name,
    email,
    phone,
    user_type,
    company_name,
    city,
    country,
    status,
    email_verified,
    phone_verified
) VALUES 
(
    '1cc5549f-2826-43f9-b378-a3861b5af9e7',
    NOW(),
    NOW(),
    'Ali Özkan',
    'ali.ozkan@testnakliye.com',
    '+90 532 111 22 33',
    'carrier',
    'Test Nakliye A.Ş.',
    'İstanbul',
    'Türkiye',
    'active',
    true,
    true
),
(
    '2cc5549f-2826-43f9-b378-a3861b5af9e8',
    NOW(),
    NOW(),
    'Mehmet Kaya',
    'mehmet.kaya@tekstillojistik.com',
    '+90 533 444 55 66',
    'carrier',
    'Tekstil Lojistik Ltd.',
    'Denizli',
    'Türkiye',
    'active',
    true,
    true
),
(
    '3cc5549f-2826-43f9-b378-a3861b5af9e9',
    NOW(),
    NOW(),
    'Fatma Demir',
    'fatma.demir@yuknakliye.com',
    '+90 534 777 88 99',
    'both',
    'Yük Nakliye Hizmetleri',
    'Ankara',
    'Türkiye',
    'active',
    true,
    true
),
(
    '4cc5549f-2826-43f9-b378-a3861b5af9ea',
    NOW(),
    NOW(),
    'Ahmet Yılmaz',
    'ahmet.yilmaz@karayolulojistik.com',
    '+90 535 123 45 67',
    'carrier',
    'Karayolu Lojistik San. Tic. A.Ş.',
    'İzmir',
    'Türkiye',
    'active',
    true,
    true
),
(
    '5cc5549f-2826-43f9-b378-a3861b5af9eb',
    NOW(),
    NOW(),
    'Zeynep Arslan',
    'zeynep.arslan@denizyolunakliye.com',
    '+90 536 987 65 43',
    'carrier',
    'Denizyolu Nakliye Ltd. Şti.',
    'Mersin',
    'Türkiye',
    'active',
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- Kontrol sorgusu
SELECT 
    id,
    full_name,
    email,
    phone,
    company_name,
    city,
    user_type,
    status
FROM profiles 
WHERE id IN (
    '1cc5549f-2826-43f9-b378-a3861b5af9e7',
    '2cc5549f-2826-43f9-b378-a3861b5af9e8',
    '3cc5549f-2826-43f9-b378-a3861b5af9e9',
    '4cc5549f-2826-43f9-b378-a3861b5af9ea',
    '5cc5549f-2826-43f9-b378-a3861b5af9eb'
)
ORDER BY created_at;

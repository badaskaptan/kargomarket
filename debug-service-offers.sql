-- Supabase SQL Editor'da çalıştırın
-- Transport services ve service offers ilişkisini kontrol edin

-- 1. Hangi transport service'e hangi offer gelmiş?
SELECT 
    so.id as offer_id,
    so.price_amount,
    so.user_id as offer_creator,
    so.transport_service_id,
    ts.user_id as service_owner,
    ts.service_number,
    ts.title as service_title,
    p.email as service_owner_email
FROM service_offers so
LEFT JOIN transport_services ts ON so.transport_service_id = ts.id
LEFT JOIN auth.users au ON ts.user_id = au.id
LEFT JOIN profiles p ON ts.user_id = p.id
ORDER BY so.created_at DESC;

-- 2. emrahbadas1980 kullanıcısının transport services'ları
SELECT 
    ts.id,
    ts.service_number,
    ts.title,
    ts.user_id,
    p.email
FROM transport_services ts
LEFT JOIN profiles p ON ts.user_id = p.id
WHERE p.email LIKE '%emrahbadas1980%'
   OR ts.user_id = '1cc5549f-2826-43f9-b378-a3861b5af9e7';

-- 3. 500000 TRY'lik teklifin detayları
SELECT 
    so.*,
    ts.user_id as service_owner,
    ts.service_number,
    p.email as service_owner_email
FROM service_offers so
LEFT JOIN transport_services ts ON so.transport_service_id = ts.id
LEFT JOIN profiles p ON ts.user_id = p.id
WHERE so.price_amount = 500000;

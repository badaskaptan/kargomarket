-- Test service offer oluştur
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- Önce mevcut transport services'leri kontrol edelim
SELECT id, user_id, service_number, title, status 
FROM transport_services 
WHERE status = 'active'
LIMIT 5;

-- Mevcut service offers'ları kontrol edelim
SELECT so.*, ts.title as transport_service_title, ts.user_id as service_owner_id
FROM service_offers so
LEFT JOIN transport_services ts ON so.transport_service_id = ts.id
LIMIT 10;

-- Eğer hiç service offer yoksa, test için bir tane oluşturalım
-- (Bu scripti çalıştırmadan önce yukarıdaki SELECT'leri çalıştırıp sonuçları kontrol edin)

/*
-- SADECE TEST İÇİN - gerçek değerlerle değiştirin
INSERT INTO service_offers (
    user_id,                    -- Teklifi veren kullanıcının ID'si  
    transport_service_id,       -- Teklif verilen transport service ID'si
    price_amount,
    price_currency,
    message,
    status,
    created_at,
    updated_at
) VALUES (
    'TEKLIF_VEREN_USER_ID',     -- Bu değeri gerçek bir user ID ile değiştirin
    'TRANSPORT_SERVICE_ID',     -- Bu değeri gerçek bir transport service ID ile değiştirin
    1500,                       -- Teklif tutarı
    'TRY',                      -- Para birimi
    'Test nakliye hizmeti teklifi', -- Mesaj
    'pending',                  -- Status
    NOW(),                      -- Oluşturma tarihi
    NOW()                       -- Güncelleme tarihi
);
*/

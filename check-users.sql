-- Önce mevcut kullanıcıları kontrol edelim
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Eğer kullanıcı yoksa, önce test için basit kullanıcı oluşturabiliriz
-- (Gerçek uygulamada auth ile oluşturulmalı)

-- Test user ID'si olarak kullanabileceğimiz UUID
-- UUID: d7b9c4e8-1234-5678-9abc-def012345678
